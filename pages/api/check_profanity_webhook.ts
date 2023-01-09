import type { NextApiRequest, NextApiResponse } from 'next'
import { ManagementClient } from '@kontent-ai/management-sdk';
import { BasicPage } from "../../models/content-types/basic_page"
import { getBasicPageItemById } from "../../lib/kontentClient";

const contentItem_Element_Source = 'content';
const contentItem_Element_SummaryOutput = 'bad_word_check_summary';

// Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "POST") {
    res.status(405).end()
    return
  }

  if (req && req.body) {

    // Cast the request body as a structured data object
    const notification = req.body as WebhookNotification

    console.log("notification" + notification)
    // Check that this request is based on a changed workflow step from the CMS - otherwise abort
    const isValidRequest = notification && notification.message && notification.message.operation && notification.message.operation === "change_workflow_step"
    console.log(notification)
    console.log(notification.data)
    console.log(notification.message)
    if (!isValidRequest) {
      console.log("request: " + isValidRequest)
      console.log(notification && notification.message && notification.message.operation && notification.message.operation === "change_workflow_step")
      console.log("messaage")
      console.log(notification.message)
      console.log("operation")
      console.log(notification.message.operation)
      console.log("change")
      console.log(notification.message.operation === "change_workflow_step")
      res.status(400).end()
      return
    }

    try {      
      // Retrieve payload from webhook post
      if (await notification.data.items) {

        // Get the content item sent (get first only - assume only one item is in payload)
        var workflowItem = await notification.data.items[0];
        const itemId = workflowItem.item.id;
  
        // Cast to BasicPage type - could add handling here to reject if this is now a Basic page content type
        const pageItems = await getBasicPageItemById(itemId) as Array<BasicPage>;

        var summaryBadWords = '';
  
        // Ensure there is a content item present
        if(pageItems && pageItems[0])
        {
          var pageItem = pageItems[0];

          // Get content to be checked from the content item
          var contentToCheck = pageItem.elements.content.value;

          // Send to Bad Words Filter API
          const axios = require("axios");

          const encodedParams = new URLSearchParams();
          encodedParams.append(contentItem_Element_Source, contentToCheck);
          encodedParams.append("censor-character", "*");
        
          const options = {
            method: 'POST',
            url: process.env.BADWORDS_RAPIDAPI_ENDPOINT_URL,
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              'X-RapidAPI-Key': process.env.BADWORDS_RAPIDAPI_API_KEY,
              'X-RapidAPI-Host': process.env.BADWORDS_RAPIDAPI_HOST_URI
            },
            data: encodedParams
          };

          var isBad = 'false';
          let badWordsList = [];
      
          // If we have a response
          await axios.request(options).then(function (response) {
            isBad = response.data['is-bad'].toString();

            response.data['bad-words-list'].forEach(element => {
              badWordsList.push(element);
            });

          }).catch(function (error) {
            res.status(500).json({ error1: error })
          });

          // Initialise management API client            
          const managementClient = new ManagementClient({
            projectId: process.env.NEXT_PUBLIC_KONTENT_PROJECT_ID,
            apiKey: process.env.NEXT_PUBLIC_KONTENT_MANAGEMENT_API_KEY,
          });

          if(isBad == 'true')
          {
            // Content flagged explicit - Update content item
            await managementClient.changeWorkflowStepOfLanguageVariant()
              .byItemId(itemId)
              .byLanguageCodename('default')
              .byWorkflowStepCodename(process.env.BADWORDS_WORKFLOW_STEP_CODENAME_EXPLICIT)
              .toPromise();            

            // If we have a summary of bad words returned, write summary to the content item's specified element field
            if(badWordsList.length > 0) {              
              badWordsList.forEach((badWord, i) => summaryBadWords = summaryBadWords + badWord + ', ');

              summaryBadWords = 'Bad word summary. Found: ' + summaryBadWords.replace(/,\s*$/, "");
            }
            else
            {
              summaryBadWords = 'Bad word summary. Found bad words but could retrieve bad word list.';
            }

            // Update content item with summary of quarantined words
            await managementClient.upsertLanguageVariant()
              .byItemId(itemId)
              .byLanguageCodename('default')
              .withData((builder:any) => [
                builder.textElement({
                  element: {
                    codename: contentItem_Element_SummaryOutput,
                  },
                  value: summaryBadWords
                })
              ])
              .toPromise();
          }
          else 
          {
            // Content flagged as safe - Update content item
            await managementClient.changeWorkflowStepOfLanguageVariant()
            .byItemId(itemId)
            .byLanguageCodename('default')
            .byWorkflowStepCodename(process.env.BADWORDS_WORKFLOW_STEP_CODENAME_SAFE)
            .toPromise();

            // Update content item with summary of quarantined words
            await managementClient.upsertLanguageVariant()
            .byItemId(itemId)
            .byLanguageCodename('default')
            .withData((builder:any) => [
              builder.textElement({
                element: {
                  codename: contentItem_Element_SummaryOutput,
                },
                value: 'Bad word summary. Found no bad words.'
              })
            ])
            .toPromise();
          }

          res.status(200).json({ name: 'Profanity check has been run successfully' })

        }
        else
        {
          res.status(400).json({ name: 'Item referenced in workflow (System.Id: ' + itemId + ') could not be retrieved from CMS' });
          return
        }
      }
      else
      {
        res.status(400).json({ name: 'No item sent from CMS' });
        return
      }
    } 
    catch(e) { 

      Error(e.message ?? e);

      res.status(500).json({ error2: e.message })
    }

  }
}



// Interfaces for structured data object

export interface Item {
  id: string;
}

export interface Language {
  id: string;
}

export interface TransitionFrom {
  id: string;
}

export interface TransitionTo {
  id: string;
}

export interface WorkflowEventItem {
  item: Item;
  language: Language;
  transition_from: TransitionFrom;
  transition_to: TransitionTo;
}

export interface Data {
  items: WorkflowEventItem[];
}

export interface Message {
  id: string;
  project_id: string;
  type: string;
  operation: string;
  api_name: string;
  created_timestamp: Date;
  webhook_url: string;
}

export interface WebhookNotification {
  data: Data;
  message: Message;
}

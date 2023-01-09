// Kentico Kontent Delivery API

import { createDeliveryClient, createRichTextHtmlResolver, linkedItemsHelper, camelCasePropertyNameResolver } from '@kontent-ai/delivery-sdk'
import { name, version } from '../package.json'
import { BasicPage } from "../models/content-types/basic_page"
import { RichTextElement } from '@kontent-ai/react-components';
import { GlobalBranding } from '../models/content-types/global_branding';

const sourceTrackingHeaderName = 'X-KC-SOURCE'

const client = createDeliveryClient({
  projectId: process.env.KONTENT_PROJECT_ID,
  previewApiKey: process.env.PREVIEW_API_KEY,
  defaultQueryConfig: {
    usePreviewMode: true
  },
  globalHeaders: (_queryConfig) => [
    {
      header: sourceTrackingHeaderName,
      value: `${name};${version}`,
    },
  ],
  propertyNameResolver: camelCasePropertyNameResolver
});

/* Global Branding */

export async function getGlobalBrandingItem() : Promise<GlobalBranding> {
  const response = await client
  .item("global_branding")
  .toPromise();

  return (response.data.item as GlobalBranding);
}

/* Basic Page */

export async function getBasicPageItem(itemCodeName) : Promise<BasicPage> {
  const response = await client
    .item(itemCodeName)
    .toPromise();

    return (response.data.item as BasicPage);
}


export async function getBasicPageItemById(itemId) : Promise<BasicPage[]> {
  const response = await client
    .items<BasicPage>()
    .type('basic_page')
    .equalsFilter('system.id', itemId)
    .toPromise();

    return response.data.items;
}


export async function getBasicPageItemList() : Promise<BasicPage[]> {
  const response = await client
    .items<BasicPage>()
    .type('basic_page')
    //.elementsParameter(['report_name', 'code_name', 'url_slug', 'publication_type', 'financial_year', 'audience'])
    .toAllPromise();

    return response.data.items;
}


export async function getBasicPageItemCodenameList() : Promise<BasicPage[]> {
  const response = await client
    .items<BasicPage>()
    .type('basic_page')
    .elementsParameter(['code_name'])
    .toAllPromise();

    return response.data.items;
}


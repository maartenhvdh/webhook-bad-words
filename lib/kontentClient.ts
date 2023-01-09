// Kentico Kontent Delivery API
import { createDeliveryClient, camelCasePropertyNameResolver } from '@kontent-ai/delivery-sdk'
import { name, version } from '../package.json'
import { BasicPage } from "../models/content-types/basic_page"

const sourceTrackingHeaderName = 'X-KC-SOURCE'

const client = createDeliveryClient({
  projectId: process.env.NEXT_PUBLIC_KONTENT_PROJECT_ID,
  previewApiKey: process.env.NEXT_PUBLIC_KONTENT_PREVIEW_API_KEY,
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

export async function getBasicPageItemById(itemId) : Promise<BasicPage[]> {
  const response = await client
    .items<BasicPage>()
    .type('_bad_words')
    .equalsFilter('system.id', itemId)
    .toPromise();

    return response.data.items;
}
import { IContentItem, Elements } from '@kontent-ai/delivery-sdk';
import { Metadata } from '../content-type-snippets/metadata';

/**
 * Generated by '@kontent-ai/model-generator@5.5.1'
 *
 * Basic Page
 * Id: a9aeec62-a50d-4f9c-b0cc-4310c10d85d8
 * Codename: basic_page
 */
export type BasicPage = IContentItem<{
  /**
   * Heading (text)
   * Required: true
   * Id: 54b86883-4437-4d4b-b1f0-23e67f68ed3a
   * Codename: heading
   *
   * The report name will be displayed as the heading in both online and printed media.
   */
  heading: Elements.TextElement;

  /**
   * Content (rich_text)
   * Required: false
   * Id: bd03975a-6fb4-49b4-8214-7adf22c9a216
   * Codename: content
   */
  content: Elements.RichTextElement;

  /**
   * URL Slug (url_slug)
   * Required: true
   * Id: f103c19b-02bc-423c-8a0f-2f3fdcafdc2e
   * Codename: url_slug
   */
  urlSlug: Elements.UrlSlugElement;

  /**
   * Simple Custom Element (custom)
   * Required: false
   * Id: affeb59a-9dd8-4ed4-9719-0aaa2859aa8b
   * Codename: simple_custom_element
   */
  simpleCustomElement: Elements.CustomElement;

  profanity_check: Elements.TextElement;


}> &
  Metadata;

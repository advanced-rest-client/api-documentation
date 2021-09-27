/* eslint-disable class-methods-use-this */
import { LitElement, TemplateResult } from 'lit-element';
import { AmfHelperMixin, AmfSerializer, DomainElement, ApiParameter } from '@api-components/amf-helper-mixin';

export declare const sectionToggleClickHandler: unique symbol;
export declare const queryDebounce: unique symbol;
export declare const debounceValue: unique symbol;
export declare const domainIdValue: unique symbol;
export declare const serializerValue: unique symbol;
export declare const domainModelValue: unique symbol;
export declare const sectionToggleTemplate: unique symbol;
export declare const paramsSectionTemplate: unique symbol;
export declare const schemaItemTemplate: unique symbol;
export declare const descriptionTemplate: unique symbol;

/**
 * A base class for the documentation components with common templates and functions.
 */
export class ApiDocumentationBase extends AmfHelperMixin(LitElement) {
  /** 
   * The domain id of the object to render.
   * @attribute
   */
  domainId: string;
  /** 
   * Enabled compatibility with the Anypoint platform.
   * @attribute
   */
  anypoint: boolean;
  /** 
   * The timeout after which the `queryGraph()` function is called 
   * in the debouncer.
   */
  queryDebouncerTimeout: number;
  [serializerValue]: AmfSerializer;

  /** 
   * The domain object read from the AMF graph model.
   */
  domainModel: DomainElement|undefined;
  [domainModelValue]: DomainElement|undefined;

  constructor();

  connectedCallback(): void;

  /**
   * Calls the `queryGraph()` function in a debouncer.
   */
  [queryDebounce](): void;

  /**
   * The main function to use to process the AMF model.
   * To be implemented by the child classes.
   */
  processGraph(): Promise<void>;

  /**
   * A handler for the section toggle button click.
   */
  [sectionToggleClickHandler](e: Event): void;

  /**
   * @return The template for the section toggle button
   */
  [sectionToggleTemplate](ctrlProperty: string): TemplateResult;
  /**
   * @param label The section label.
   * @param openedProperty The name of the element property to be toggled when interacting with the toggle button.
   * @param content The content to render.
   * @returns The template for a toggle section with a content.
   */
  [paramsSectionTemplate](label: string, openedProperty: string, content: TemplateResult | TemplateResult[]): TemplateResult;
  /**
   * @param model The parameter to render.
   * @return The template for the schema item document
   */
  [schemaItemTemplate](model: ApiParameter): TemplateResult;
  /**
   * @param description The description to render.
   * @returns The template for the markdown description.
   */
  [descriptionTemplate](description: string): TemplateResult|string;
}

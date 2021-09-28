import { TemplateResult } from 'lit-element';
import { ApiDocumentation, CreativeWork } from '@api-components/amf-helper-mixin';
import { ApiDocumentationBase } from './ApiDocumentationBase';

export const documentationValue: unique symbol;
export const titleTemplate: unique symbol;
export const setModel: unique symbol;

/**
 * A web component that renders the documentation page for an API documentation (like in RAML documentations) built from 
 * the AMF graph model.
 */
export default class ApiDocumentationDocumentElement extends ApiDocumentationBase {
  /**
   * @returns The serialized to a JS object graph model
   */
  get model(): ApiDocumentation|undefined;

  [documentationValue]: ApiDocumentation;
  constructor();
  domainModel: CreativeWork;

  /**
   * Queries the graph store for the API Documentation data.
   */
  processGraph(): Promise<void>;

  [setModel](model: CreativeWork): void;

  render(): TemplateResult;

  /**
   * @returns The template for the Documentation title.
   */
  [titleTemplate](): TemplateResult;
}

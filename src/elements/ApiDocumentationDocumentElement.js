/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { Styles as HttpStyles } from '@api-components/http-method-label';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import elementStyles from './styles/ApiDocumentationDocument.js';
import commonStyles from './styles/Common.js';
import { ApiDocumentationBase, descriptionTemplate, serializerValue } from './ApiDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').ApiDocumentation} ApiDocumentation */
/** @typedef {import('@api-components/amf-helper-mixin').CreativeWork} CreativeWork */

export const documentationValue = Symbol('documentationValue');
export const titleTemplate = Symbol('titleTemplate');
export const setModel = Symbol('setModel');

/**
 * A web component that renders the documentation page for an API documentation (like in RAML documentations) built from 
 * the AMF graph model.
 */
export default class ApiDocumentationDocumentElement extends ApiDocumentationBase {
  get styles() {
    return [elementStyles, commonStyles, HttpStyles.default, MarkdownStyles];
  }

  /**
   * @returns {ApiDocumentation|undefined} The serialized to a JS object graph model
   */
  get model() {
    return this[documentationValue];
  }

  constructor() {
    super();
    /** @type {ApiDocumentation} */
    this[documentationValue] = undefined;
    /** @type {CreativeWork} */
    this.domainModel = undefined;
  }

  /**
   * Queries the graph store for the API Documentation data.
   * @returns {Promise<void>}
   */
  async processGraph() {
    const { domainId, domainModel, amf } = this;
    if (domainModel) {
      this[setModel](domainModel);
      return;
    }
    if (!domainId) {
      this[setModel]();
      return;
    }
    const webApi = this._computeApi(amf);
    const model =  this._computeDocument(webApi, domainId);
    this[setModel](model);
  }

  /**
   * @param {CreativeWork=} model 
   */
  [setModel](model) {
    if (model) {
      this[documentationValue] = this[serializerValue].documentation(model);
    } else {
      this[documentationValue] = undefined;
    }
    this.requestUpdate();
  }

  render() {
    if (!this[documentationValue]) {
      return html``;
    }
    return html`
    <style>${this.styles}</style>
    ${this[titleTemplate]()}
    ${this[descriptionTemplate](this[documentationValue].description)}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the Documentation title.
   */
  [titleTemplate]() {
    const docs = this[documentationValue];
    const { title } = docs;
    if (!title) {
      return '';
    }
    return html`
    <div class="documentation-header">
      <div class="documentation-title">
        <span class="label">${title}</span>
      </div>
    </div>
    `;
  }
}

/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiPayload.js';
import { 
  ApiDocumentationBase,
  serializerValue,
} from './ApiDocumentationBase.js';
import '../../api-schema-document.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').ApiPayload} ApiPayload */
/** @typedef {import('@api-components/amf-helper-mixin').Payload} Payload */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiExample} ApiExample */

export const queryPayload = Symbol('queryPayload');
export const queryExamples = Symbol('queryExamples');
export const payloadValue = Symbol('payloadValue');
export const examplesValue = Symbol('examplesValue');
export const processPayload = Symbol('processPayload');
export const mediaTypeTemplate = Symbol('mediaTypeTemplate');
export const nameTemplate = Symbol('nameTemplate');
export const schemaTemplate = Symbol('schemaTemplate');

export default class ApiPayloadDocumentElement extends ApiDocumentationBase {
  get styles() {
    return [commonStyles, elementStyles];
  }

  /**
   * @returns {ApiPayload}
   */
  get payload() {
    return this[payloadValue];
  }

  /**
   * @param {ApiPayload} value
   */
  set payload(value) {
    const old = this[payloadValue];
    if (old === value) {
      return;
    }
    this[payloadValue] = value;
    this.processGraph();
  }

  constructor() {
    super();
    /**
     * @type {ApiPayload}
     */
    this[payloadValue] = undefined;
    /**
     * @type {ApiExample[]}
     */
    this[examplesValue] = undefined;
    /** @type Payload */
    this.domainModel = undefined;
  }

  /**
   * Queries the graph store for the API Payload data.
   * @returns {Promise<void>}
   */
  async processGraph() {
    const { domainModel } = this;
    if (domainModel) {
      this[payloadValue] = this[serializerValue].payload(domainModel);
    }
    await this[processPayload]();
    await this.requestUpdate();
  }

  async [processPayload]() {
    const { payload } = this;
    if (!payload) {
      this[examplesValue] = undefined;
      return;
    }
    const { examples } = payload;
    if (Array.isArray(examples) && examples.length) {
      this[examplesValue] = examples;
    }
  }

  render() {
    const { payload } = this;
    if (!payload) {
      return html``;
    }
    // todo: render examples for the payload.
    return html`
    <style>${this.styles}</style>
    ${this[nameTemplate]()}
    ${this[mediaTypeTemplate]()}
    ${this[schemaTemplate]()}
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the payload mime type.
   */
  [mediaTypeTemplate]() {
    const { payload } = this;
    const { mediaType } = payload;
    if (!mediaType) {
      return '';
    }
    return html`
    <div class="media-type">
      <label>Media type:</label>
      <span>${mediaType}</span>
    </div>
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the payload name
   */
  [nameTemplate]() {
    const { payload } = this;
    const { name } = payload;
    if (!name) {
      return '';
    }
    return html`
    <div class="payload-name">${name}</div>
    `;
  }

  /**
   * @return {TemplateResult} The template for the payload's schema
   */
  [schemaTemplate]() {
    const { payload } = this;
    const { schema, mediaType } = payload;
    if (!schema) {
      return html`<div class="empty-info">Schema is not defined for this payload.</div>`;
    }
    return html`
    <api-schema-document class="schema-renderer" .amf="${this.amf}" .schema="${schema}" .mimeType="${mediaType}" forceExamples schemaTitle></api-schema-document>
    `;
  }
}

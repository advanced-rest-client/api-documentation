/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-collapse/anypoint-collapse.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiResponse.js';
import '../../api-payload-document.js';
import '../../api-parameter-document.js';
import { 
  ApiDocumentationBase, 
  paramsSectionTemplate, 
  schemaItemTemplate,
  descriptionTemplate,
  serializerValue,
} from './ApiDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').ApiResponse} ApiResponse */
/** @typedef {import('@api-components/amf-helper-mixin').ApiPayload} ApiPayload */
/** @typedef {import('@api-components/amf-helper-mixin').Response} Response */
/** @typedef {import('@anypoint-web-components/anypoint-listbox').AnypointListbox} AnypointListbox */

export const queryResponse = Symbol('queryResponse');
export const responseValue = Symbol('responseValue');
export const queryPayloads = Symbol('queryPayloads');
export const payloadsValue = Symbol('payloadsValue');
export const payloadValue = Symbol('payloadValue');
export const headersTemplate = Symbol('headersTemplate');
export const payloadTemplate = Symbol('payloadTemplate');
export const payloadSelectorTemplate = Symbol('payloadSelectorTemplate');
export const mediaTypeSelectHandler = Symbol('mediaTypeSelectHandler');

/**
 * A web component that renders the documentation page for an API response object.
 */
export default class ApiResponseDocumentElement extends ApiDocumentationBase {
  static get styles() {
    return [commonStyles, elementStyles, MarkdownStyles];
  }

  /**
   * @returns {boolean} true when has headers parameters definition
   */
  get hasHeaders() {
    const response = this[responseValue];
    if (!response) {
      return false;
    }
    return Array.isArray(response.headers) && !!response.headers.length;
  }

  /**
   * @returns {ApiPayload|undefined}
   */
  get [payloadValue]() {
    const { mimeType } = this;
    const payloads = this[payloadsValue];
    if (!Array.isArray(payloads) || !payloads.length) {
      return undefined;
    }
    if (!mimeType) {
      return payloads[0];
    }
    return payloads.find((item) => item.mediaType === mimeType);
  }

  static get properties() {
    return {
      /** 
       * When set it opens the headers section
       */
      headersOpened: { type: Boolean, reflect: true },
      /** 
       * When set it opens the payload section
       */
      payloadOpened: { type: Boolean, reflect: true },
      /** 
       * The currently selected media type for the payloads.
       */
      mimeType: { type: String, reflect: true },
    };
  }

  /**
   * @returns {ApiResponse}
   */
  get response() {
    return this[responseValue];
  }

  /**
   * @param {ApiResponse} value
   */
  set response(value) {
    const old = this[responseValue];
    if (old === value) {
      return;
    }
    this[responseValue] = value;
    this.processGraph();
  }

  constructor() {
    super();
    /**
     * @type {ApiResponse}
     */
    this[responseValue] = undefined;
    /**
     * @type {ApiPayload[]}
     */
    this[payloadsValue] = undefined;
    /**
     * @type {string}
     */
    this.mimeType = undefined;

    this.headersOpened = false;
    this.payloadOpened = false;
    /** @type Response */
    this.domainModel = undefined;
  }

  /**
   * Queries the graph store for the API Response data.
   * @returns {Promise<void>}
   */
  async processGraph() {
    const { domainModel } = this;
    if (domainModel) {
      this[responseValue] = this[serializerValue].response(domainModel);
    }
    this[queryPayloads]();
    await this.requestUpdate();
  }

  [queryPayloads]() {
    const { response } = this;
    if (!response || !Array.isArray(response.payloads) || !response.payloads.length) {
      this[payloadsValue] = undefined;
      return;
    }
    this[payloadsValue] = response.payloads;
  }

  /**
   * @param {Event} e
   */
  [mediaTypeSelectHandler](e) {
    const select = /** @type AnypointListbox */ (e.target);
    const mime = String(select.selected);
    this.mimeType = mime;
  }

  render() {
    if (!this[responseValue]) {
      return html``;
    }
    return html`
    ${this[descriptionTemplate](this[responseValue].description)}
    ${this[headersTemplate]()}
    ${this[payloadTemplate]()}
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the headers
   */
  [headersTemplate]() {
    if (!this.hasHeaders) {
      return '';
    }
    const { response } = this;
    const content = response.headers.map((id) => this[schemaItemTemplate](id));
    return this[paramsSectionTemplate]('Headers', 'headersOpened', content);
  }

  /**
   * @return {TemplateResult|string} The template for the payload section
   */
  [payloadTemplate]() {
    const payload = this[payloadValue];
    if (!payload) {
      return '';
    }
    const content = html`
    ${this[payloadSelectorTemplate]()}
    <api-payload-document .payload="${payload}"></api-payload-document>
    `;
    return this[paramsSectionTemplate]('Response body', 'payloadOpened', content);
  }

  /**
   * @return {TemplateResult|string} The template for the payload media type selector.
   */
  [payloadSelectorTemplate]() {
    const payloads = this[payloadsValue];
    if (!Array.isArray(payloads) || payloads.length < 2) {
      return '';
    }
    const mime = [];
    payloads.forEach((item) => {
      if (item.mediaType) {
        mime.push(item.mediaType);
      }
    });
    if (!mime.length) {
      return '';
    }
    const mimeType = this.mimeType || mime[0];
    return html`
    <div class="media-type-selector">
      <anypoint-dropdown-menu
        class="amf-media-types"
      >
        <label slot="label">Body content type</label>
        <anypoint-listbox
          slot="dropdown-content"
          attrforselected="data-value"
          .selected="${mimeType}"
          @selected-changed="${this[mediaTypeSelectHandler]}"
        >
          ${mime.map((type) => html`<anypoint-item data-value="${type}">${type}</anypoint-item>`)}
        </anypoint-listbox>
      </anypoint-dropdown-menu>
    </div>
    `;
  }
}

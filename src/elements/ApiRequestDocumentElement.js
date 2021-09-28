/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import '@anypoint-web-components/anypoint-dropdown-menu/anypoint-dropdown-menu.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiRequest.js';
import { 
  ApiDocumentationBase, 
  paramsSectionTemplate, 
  schemaItemTemplate,
  descriptionTemplate,
  serializerValue,
} from './ApiDocumentationBase.js';
import { QueryParameterProcessor } from '../lib/QueryParameterProcessor.js';
import '../../api-payload-document.js';
import '../../api-parameter-document.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').ApiRequest} ApiRequest */
/** @typedef {import('@api-components/amf-helper-mixin').ApiPayload} ApiPayload */
/** @typedef {import('@api-components/amf-helper-mixin').Request} Request */
/** @typedef {import('@anypoint-web-components/anypoint-listbox').AnypointListbox} AnypointListbox */
/** @typedef {import('@api-components/amf-helper-mixin').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayShape} ApiArrayShape */
/** @typedef {import('../types').OperationParameter} OperationParameter */

export const queryRequest = Symbol('queryRequest');
export const requestValue = Symbol('requestValue');
export const queryPayloads = Symbol('queryPayloads');
export const payloadsValue = Symbol('payloadsValue');
export const payloadValue = Symbol('payloadValue');
export const queryParamsTemplate = Symbol('queryParamsTemplate');
export const headersTemplate = Symbol('headersTemplate');
export const cookiesTemplate = Symbol('cookiesTemplate');
export const payloadTemplate = Symbol('payloadTemplate');
export const payloadSelectorTemplate = Symbol('payloadSelectorTemplate');
export const mediaTypeSelectHandler = Symbol('mediaTypeSelectHandler');
export const processQueryParameters = Symbol('processQueryParameters');
export const queryParametersValue = Symbol('queryParametersValue');
export const queryStringTemplate = Symbol('queryStringTemplate');

/**
 * A web component that renders the documentation page for an API request object.
 */
export default class ApiRequestDocumentElement extends ApiDocumentationBase {
  static get styles() {
    return [commonStyles, elementStyles];
  }

  /**
   * @returns {boolean} true when has cookie parameters definition
   */
  get hasCookieParameters() {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return Array.isArray(request.cookieParameters) && !!request.cookieParameters.length;
  }

  /**
   * @returns {boolean} true when has headers parameters definition
   */
  get hasHeaders() {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return Array.isArray(request.headers) && !!request.headers.length;
  }

  /**
   * @returns {boolean} true when has query parameters definition
   */
  get hasQueryParameters() {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return Array.isArray(request.queryParameters) && !!request.queryParameters.length;
  }

  /**
   * @returns {boolean} true when has URI parameters definition
   */
  get hasUriParameters() {
    const request = this[requestValue];
    if (!request) {
      return false;
    }
    return Array.isArray(request.uriParameters) && !!request.uriParameters.length;
  }

  /**
   * @returns {boolean} true when has query string definition
   */
  get hasQueryString() {
    const request = /** @type ApiRequest */ (this[requestValue]);
    if (!request) {
      return false;
    }
    return !!request.queryString;
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

  /**
   * @returns {ApiRequest}
   */
  get request() {
    return this[requestValue];
  }

  /**
   * @param {ApiRequest} value
   */
  set request(value) {
    const old = this[requestValue];
    if (old === value) {
      return;
    }
    this[requestValue] = value;
    this.processGraph();
  }

  static get properties() {
    return {
      /** 
       * When set it opens the parameters section
       */
      parametersOpened: { type: Boolean, reflect: true },
      /** 
       * When set it opens the headers section
       */
      headersOpened: { type: Boolean, reflect: true },
      /** 
       * When set it opens the cookies section
       */
      cookiesOpened: { type: Boolean, reflect: true },
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

  constructor() {
    super();
    /**
     * @type {ApiRequest}
     */
    this[requestValue] = undefined;
    /**
     * @type {ApiPayload[]}
     */
    this[payloadsValue] = undefined;
    /** @type {string} */
    this.mimeType = undefined;
    /** @type {boolean} */
    this.headersOpened = undefined;
    /** @type {boolean} */
    this.payloadOpened = undefined;
    /** @type {boolean} */
    this.cookiesOpened = undefined;
    /** @type {boolean} */
    this.parametersOpened = undefined;
    /** @type Request */
    this.domainModel = undefined;
    /** @type OperationParameter[] */
    this[queryParametersValue] = undefined;
  }

  /**
   * @returns {Promise<void>}
   */
  async processGraph() {
    const { domainModel } = this;
    if (domainModel) {
      this[requestValue] = this[serializerValue].request(domainModel);
    }
    this.mimeType = undefined;
    await this[queryPayloads]();
    await this[processQueryParameters]();
    await this.requestUpdate();
  }

  async [queryPayloads]() {
    const { request } = this;
    if (!request || !request.payloads.length) {
      this[payloadsValue] = undefined;
      return;
    }
    this[payloadsValue] = request.payloads;
  }

  /**
   * Creates a parameter 
   */
  async [processQueryParameters]() {
    this[queryParametersValue] = undefined;
    const { request } = this;
    if (!request) {
      return;
    }
    const nodeShape = /** @type ApiNodeShape */ (request.queryString);
    if (!nodeShape) {
      return;
    }
    const factory = new QueryParameterProcessor();
    const params = factory.collectOperationParameters(request.queryString, 'query');
    this[queryParametersValue] = params;
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
    const { request } = this;
    if (!request) {
      return html``;
    }
    return html`
    ${this[descriptionTemplate](request.description)}
    ${this[queryParamsTemplate]()}
    ${this[queryStringTemplate]()}
    ${this[headersTemplate]()}
    ${this[cookiesTemplate]()}
    ${this[payloadTemplate]()}
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the query parameters
   */
  [queryParamsTemplate]() {
    if (!this.hasQueryParameters && !this.hasUriParameters) {
      return '';
    }
    const { request } = this;
    const { queryParameters=[], uriParameters=[] } = request;
    const all = uriParameters.concat(queryParameters);
    const content = all.map((param) => this[schemaItemTemplate](param));
    return this[paramsSectionTemplate]('Parameters', 'parametersOpened', content);
  }

  /**
   * @return {TemplateResult|string} The template for the query parameters built form the query string.
   */
  [queryStringTemplate]() {
    if (!this.hasQueryString || this.hasQueryParameters) {
      return '';
    }
    const params = this[queryParametersValue];
    const content = params.map((param) => this[schemaItemTemplate](param.parameter));
    return this[paramsSectionTemplate]('Parameters', 'parametersOpened', content);
  }

  /**
   * @return {TemplateResult|string} The template for the headers
   */
  [headersTemplate]() {
    if (!this.hasHeaders) {
      return '';
    }
    const { request } = this;
    const content = request.headers.map((id) => this[schemaItemTemplate](id));
    return this[paramsSectionTemplate]('Headers', 'headersOpened', content);
  }

  /**
   * @return {TemplateResult|string} The template for the cookies list section
   */
  [cookiesTemplate]() {
    if (!this.hasCookieParameters) {
      return '';
    }
    const { request } = this;
    const content = request.cookieParameters.map((id) => this[schemaItemTemplate](id));
    return this[paramsSectionTemplate]('Cookies', 'cookiesOpened', content);
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
    <api-payload-document .amf="${this.amf}" .payload="${payload}"></api-payload-document>
    `;
    return this[paramsSectionTemplate]('Request body', 'payloadOpened', content);
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

/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiRequest.js';
import { 
  ApiDocumentationBase, 
  paramsSectionTemplate, 
  schemaItemTemplate,
  // descriptionTemplate,
  // customDomainPropertiesTemplate,
  serializerValue,
} from './ApiDocumentationBase.js';
import { QueryParameterProcessor } from '../lib/QueryParameterProcessor.js';
import '../../api-payload-document.js';
import '../../api-parameter-document.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').ApiRequest} ApiRequest */
/** @typedef {import('@api-components/amf-helper-mixin').ApiPayload} ApiPayload */
/** @typedef {import('@api-components/amf-helper-mixin').Request} Request */
/** @typedef {import('@api-components/amf-helper-mixin').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiServer} ApiServer */
/** @typedef {import('@api-components/amf-helper-mixin').ApiEndPoint} ApiEndPoint */
/** @typedef {import('@api-components/amf-helper-mixin').ApiParameter} ApiParameter */
/** @typedef {import('@anypoint-web-components/anypoint-radio-button/index').AnypointRadioGroupElement} AnypointRadioGroupElement */
/** @typedef {import('../types').OperationParameter} OperationParameter */

export const queryRequest = Symbol('queryRequest');
export const requestValue = Symbol('requestValue');
export const queryPayloads = Symbol('queryPayloads');
export const payloadsValue = Symbol('payloadsValue');
export const payloadValue = Symbol('payloadValue');
export const notifyMime = Symbol('notifyMime');
export const preselectMime = Symbol('preselectMime');
export const queryParamsTemplate = Symbol('queryParamsTemplate');
export const headersTemplate = Symbol('headersTemplate');
export const cookiesTemplate = Symbol('cookiesTemplate');
export const payloadTemplate = Symbol('payloadTemplate');
export const payloadSelectorTemplate = Symbol('payloadSelectorTemplate');
export const mediaTypeSelectHandler = Symbol('mediaTypeSelectHandler');
export const processQueryParameters = Symbol('processQueryParameters');
export const queryParametersValue = Symbol('queryParametersValue');

/**
 * A web component that renders the documentation page for an API request object.
 */
export default class ApiRequestDocumentElement extends ApiDocumentationBase {
  get styles() {
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
   * @returns {ApiParameter[]} The combined list of path parameters in the server, endpoint, and the request.
   */
  get uriParameters() {
    const request = /** @type ApiRequest */ (this[requestValue]);
    const { server, endpoint } = this;
    let result = /** @type ApiParameter[] */ ([]);
    if (server && Array.isArray(server.variables) && server.variables.length) {
      result = result.concat(server.variables);
    }
    if (endpoint && Array.isArray(endpoint.parameters) && endpoint.parameters.length) {
      result = result.concat(endpoint.parameters);
    }
    if (request && Array.isArray(request.uriParameters) && request.uriParameters.length) {
      result = result.concat(request.uriParameters);
    }
    return result;
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
      /** 
       * The current server in use.
       * It adds path parameters defined for the server.
       */
      server: { type: Object },
      /** 
       * The parent endpoint of this request.
       * It adds path parameters defined for the endpoint.
       */
      endpoint: { type: Object },
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
    /** @type {Request} */
    this.domainModel = undefined;
    /** @type {ApiServer} */
    this.server = undefined;
    /** @type {ApiEndPoint} */
    this.endpoint = undefined;
    /** @type {OperationParameter[]} */
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
    await this[preselectMime]();
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
   * Pre-selects when needed the mime type for the current payload.
   */
  [preselectMime]() {
    const { mimeType } = this;
    const payloads = this[payloadsValue];
    if (!Array.isArray(payloads) || !payloads.length) {
      return;
    }
    const mime = /** @type string[] */ ([]);
    let hasCurrent = false;
    payloads.forEach((item) => {
      if (item.mediaType) {
        mime.push(item.mediaType);
        if (!hasCurrent && item.mediaType === mimeType) {
          hasCurrent = true;
        }
      }
    });
    // do not change the selection when already exist.
    if (hasCurrent) {
      return;
    }
    if (!mime.length) {
      return;
    }
    const [first] = mime;
    this.mimeType = first;
    this[notifyMime]();
  }

  /**
   * @param {Event} e
   */
  [mediaTypeSelectHandler](e) {
    const group = /** @type AnypointRadioGroupElement */ (e.target);
    const { selectedItem } = group;
    if (!selectedItem) {
      return;
    }
    const mime = selectedItem.dataset.value;
    this.mimeType = mime;
    this[notifyMime]();
  }

  /**
   * Dispatches the `mimechange` event.
   */
  [notifyMime]() {
    this.dispatchEvent(new Event('mimechange'));
  }

  render() {
    const { request, server, endpoint } = this;
    if (!request && !server && !endpoint) {
      return html``;
    }
    return html`
    <style>${this.styles}</style>
    ${this[queryParamsTemplate]()}
    ${this[headersTemplate]()}
    ${this[cookiesTemplate]()}
    ${this[payloadTemplate]()}
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the query parameters
   */
  [queryParamsTemplate]() {
    const { uriParameters, hasQueryParameters } = this;
    if (!hasQueryParameters && !uriParameters.length) {
      return '';
    }
    const { request } = this;
    let queryParameters = [];
    if (request && Array.isArray(request.queryParameters)) {
      queryParameters = request.queryParameters;
    }
    if (!queryParameters.length && this[queryParametersValue] && this[queryParametersValue].length) {
      queryParameters = this[queryParametersValue].map(i => i.parameter);
    }
    const content = [];
    uriParameters.forEach(param => content.push(this[schemaItemTemplate](param, 'uri')));
    queryParameters.forEach(param => content.push(this[schemaItemTemplate](param, 'query')));
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
    const content = request.headers.map((param) => this[schemaItemTemplate](param, 'header'));
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
    const content = request.cookieParameters.map((param) => this[schemaItemTemplate](param, 'cookie'));
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
    const mime = /** @type string[] */ ([]);
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
      <label>Body content type</label>
      <anypoint-radio-group 
        @select="${this[mediaTypeSelectHandler]}" 
        attrForSelected="data-value" 
        .selected="${mimeType}"
      >
        ${mime.map((item) => 
          html`<anypoint-radio-button class="response-toggle" name="responseMime" data-value="${item}">${item}</anypoint-radio-button>`)}
      </anypoint-radio-group>
    </div>
    `;
  }
}

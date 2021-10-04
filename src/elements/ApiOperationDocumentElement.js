/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { ns } from "@api-components/amf-helper-mixin";
import { Styles as HttpStyles } from '@api-components/http-method-label';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import { UrlLib } from '@api-components/api-request';
import { ApiSchemaValues, ApiSchemaGenerator } from '@api-components/api-schema';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tab.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tabs.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@advanced-rest-client/http-code-snippets/http-code-snippets.js';
import { QueryParameterProcessor } from '../lib/QueryParameterProcessor.js';
import elementStyles from './styles/ApiOperation.js';
import commonStyles from './styles/Common.js';
import { 
  ApiDocumentationBase, 
  paramsSectionTemplate,
  descriptionTemplate,
  serializerValue,
  customDomainPropertiesTemplate,
  evaluateExample,
} from './ApiDocumentationBase.js';
import { tablePropertyTemplate } from './SchemaCommonTemplates.js';
import schemaStyles from './styles/SchemaCommon.js';
import '../../api-request-document.js';
import '../../api-response-document.js';
import '../../api-security-requirement-document.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').ApiEndPoint} ApiEndPoint */
/** @typedef {import('@api-components/amf-helper-mixin').ApiServer} ApiServer */
/** @typedef {import('@api-components/amf-helper-mixin').ApiOperation} ApiOperation */
/** @typedef {import('@api-components/amf-helper-mixin').Operation} Operation */
/** @typedef {import('@api-components/amf-helper-mixin').ApiResponse} ApiResponse */
/** @typedef {import('@api-components/amf-helper-mixin').ApiCallback} ApiCallback */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiParameter} ApiParameter */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiSecurityRequirement} ApiSecurityRequirement */
/** @typedef {import('@anypoint-web-components/anypoint-tabs').AnypointTabs} AnypointTabs */
/** @typedef {import('./ApiRequestDocumentElement').default} ApiRequestDocumentElement */

export const queryEndpoint = Symbol('queryEndpoint');
export const queryServers = Symbol('queryServers');
export const queryResponses = Symbol('queryResponses');
export const operationValue = Symbol('operationValue');
export const endpointValue = Symbol('endpointValue');
export const serversValue = Symbol('serversValue');
export const serverIdValue = Symbol('serverIdValue');
export const urlValue = Symbol('urlValue');
export const responsesValue = Symbol('responsesValue');
export const computeUrlValue = Symbol('computeUrlValue');
export const computeParametersValue = Symbol('computeParametersValue');
export const snippetsParametersValue = Symbol('snippetsParametersValue');
export const computeSnippetsPayload = Symbol('computeSnippetsPayload');
export const computeSnippetsHeaders = Symbol('computeSnippetsHeaders');
export const snippetsPayloadValue = Symbol('snippetsPayloadValue');
export const snippetsHeadersValue = Symbol('snippetsHeadersValue');
export const baseUriValue = Symbol('baseUriValue');
export const preselectResponse = Symbol('preselectResponse');
export const preselectSecurity = Symbol('preselectSecurity');
export const requestMimeChangeHandler = Symbol('requestMimeChangeHandler');
export const titleTemplate = Symbol('titleTemplate');
export const traitsTemplate = Symbol('extendsTemplate');
export const summaryTemplate = Symbol('summaryTemplate');
export const urlTemplate = Symbol('urlTemplate');
export const requestTemplate = Symbol('requestTemplate');
export const responseTemplate = Symbol('responseTemplate');
export const responseTabsTemplate = Symbol('responseTabsTemplate');
export const responseContentTemplate = Symbol('responseContentTemplate');
export const statusCodeHandler = Symbol('statusCodeHandler');
export const securitySectionTemplate = Symbol('securitySectionTemplate');
export const securityTemplate = Symbol('securityTemplate');
export const deprecatedTemplate = Symbol('deprecatedTemplate');
export const metaDataTemplate = Symbol('metaDataTemplate');
export const tryItTemplate = Symbol('tryItTemplate');
export const tryItHandler = Symbol('tryItHandler');
export const callbacksTemplate = Symbol('callbacksTemplate');
export const callbackTemplate = Symbol('callbackTemplate');
export const snippetsTemplate = Symbol('snippetsTemplate');
export const securitySelectorTemplate = Symbol('securitySelectorTemplate');
export const securitySelectionHandler = Symbol('securitySelectionHandler');
export const securityTabTemplate = Symbol('securityTabTemplate');

/**
 * A web component that renders the documentation page for an API operation built from 
 * the AMF graph model.
 * 
 * @fires tryit
 */
export default class ApiOperationDocumentElement extends ApiDocumentationBase {
  get styles() {
    return [elementStyles, commonStyles, HttpStyles.default, MarkdownStyles, schemaStyles];
  }

  /** 
   * @returns {string} 
   */
  get serverId() {
    return this[serverIdValue];
  }

  /** 
   * @param {string} value
   */
  set serverId(value) {
    const old = this[serverIdValue];
    if (old === value) {
      return;
    }
    this[serverIdValue] = value;
    this[computeUrlValue]();
    this[computeParametersValue]();
    this.requestUpdate();
  }

  /**
   * @returns {ApiServer[]|undefined} The computed list of servers.
   */
  get servers() {
    return this[serversValue];
  }

  /**
   * @returns {ApiServer|undefined} The current server in use.
   */
  get server() {
    const servers = this[serversValue];
    const serverId = this[serverIdValue];
    let server;
    if (Array.isArray(servers) && servers.length) {
      if (serverId) {
        server = servers.find((item) => item.id === serverId);
      } else {
        [server] = servers;
      }
    }
    return server;
  }

  /**
   * @returns {ApiOperation|undefined}
   */
  get operation() {
    return this[operationValue];
  }

  /**
   * @param {ApiOperation} value
   */
  set operation(value) {
    const old = this[operationValue];
    if (old === value) {
      return;
    }
    this[operationValue] = value;
    this.processGraph();
  }

  /**
   * @returns {ApiEndPoint|undefined}
   */
  get endpoint() {
    return this[endpointValue];
  }

  /**
   * @param {ApiEndPoint} value
   */
  set endpoint(value) {
    const old = this[endpointValue];
    if (old === value) {
      return;
    }
    this[endpointValue] = value;
    this[computeUrlValue]();
    this[computeParametersValue]();
    this.requestUpdate();
  }

  /**
   * @returns {string|undefined}
   */
  get baseUri() {
    return this[baseUriValue];
  }

  /**
   * @param {string} value
   */
  set baseUri(value) {
    const old = this[baseUriValue];
    if (old === value) {
      return;
    }
    this[baseUriValue] = value;
    this[computeUrlValue]();
    this[computeParametersValue]();
    this.requestUpdate();
  }

  /**
   * @returns {string|undefined} The computed URI for the endpoint.
   */
  get endpointUri() {
    return this[urlValue];
  }

  /**
   * @returns {string}
   */
  get snippetsUri() {
    const base = this[urlValue] || '';
    const query = this[snippetsParametersValue] || '';
    return `${base}${query}`
  }

  /**
   * @returns {ApiResponse[]|undefined} The computed list of responses for this operation.
   */
  get responses() {
    return this[responsesValue];
  }

  static get properties() {
    return {
      /**
       * A property to set to override AMF's model base URI information.
       * When this property is set, the `endpointUri` property is recalculated.
       */
      baseUri: { type: String },
      /** 
       * The id of the currently selected server to use to construct the URL.
       * If not set a first server in the API servers array is used.
       */
      serverId: { type: String, reflect: true },
      /** 
       * The domain id of the currently selected security to render.
       * This is only used when a multiple security schemes are applied to the operation.
       */
      securityId: { type: String, reflect: true },
      /** 
       * When set it opens the response section
       */
      responsesOpened: { type: Boolean, reflect: true },
      /** 
       * When set it opens the security section
       */
      securityOpened: { type: Boolean, reflect: true },
      /** 
       * When set it opens the code snippets section
       */
      snippetsOpened: { type: Boolean, reflect: true },
      /** 
       * The selected status code in the responses section.
       */
      selectedStatus: { type: String },
      /** 
       * Whether the callbacks section is opened.
       */
      callbacksOpened: { type: String },
      /** 
       * When set it renders the "try it" button that dispatches the `tryit` event.
       */
      tryIt: { type: Boolean, reflect: true },
      /** 
       * When set it renders the view optimised for asynchronous API operation.
       */
      asyncApi: { type: Boolean, reflect: true },
      /**
       * When set it renders code examples section is the documentation
       */
      renderCodeSnippets: { type: Boolean },
      /**
       * When set it renders security documentation when applicable
       */
      renderSecurity: { type: Boolean },
      /** 
       * The currently rendered request panel mime type.
       */
      requestMimeType: { type: String },
    };
  }

  constructor() {
    super();
    /**
     * @type {ApiOperation}
     */
    this[operationValue] = undefined;
    /**
     * @type {ApiServer[]}
     */
    this[serversValue] = undefined;
    /**
     * @type {ApiEndPoint}
     */
    this[endpointValue] = undefined;
    /**
     * @type {string}
     */
    this[urlValue] = undefined;
    /**
     * @type {ApiResponse[]}
     */
    this[responsesValue] = undefined;
    /** @type {string} */
    this.selectedStatus = undefined;
    /** @type {boolean} */
    this.responsesOpened = undefined;
    /** @type {boolean} */
    this.callbacksOpened = undefined;
    /** @type {boolean} */
    this.securityOpened = undefined;
    /** @type {boolean} */
    this.snippetsOpened = undefined;
    /** @type {boolean} */
    this.tryIt = undefined;
    /** @type {boolean} */
    this.asyncApi = undefined;
    /** @type {boolean} */
    this.renderCodeSnippets = undefined;
    /** @type {boolean} */
    this.renderSecurity = undefined;
    /** @type {Operation} */
    this.domainModel = undefined;
    /** @type {string} */
    this.requestMimeType = undefined;
    /** @type {string} */
    this[snippetsPayloadValue] = undefined;
    /** @type {string} */
    this[snippetsHeadersValue] = undefined;
    /** @type {string} */
    this.securityId = undefined;
  }

  /**
   * @returns {Promise<void>}
   */
  async processGraph() {
    const { domainModel, domainId, amf } = this;
    if (domainModel) {
      this[operationValue] = this[serializerValue].operation(domainModel);
    } else if (domainId && amf) {
      if (!this[operationValue] || this[operationValue].id !== domainId) {
        const webApi = this._computeApi(amf);
        const model = this._computeMethodModel(webApi, domainId);
        if (model) {
          this[operationValue] = this[serializerValue].operation(model);
        }
      }
    }
    await this[queryEndpoint]();
    await this[queryServers]();
    await this[queryResponses]();
    this[preselectResponse]();
    this[preselectSecurity]();
    this[computeUrlValue]();
    this[computeParametersValue]();
    this[computeSnippetsPayload]();
    this[computeSnippetsHeaders]();
    await this.requestUpdate();
  }

  /**
   * Queries for the API operation's endpoint data.
   */
  async [queryEndpoint]() {
    const { domainId, amf, operation } = this;
    this[endpointValue] = undefined;
    const id = domainId || operation && operation.id;
    if (!id || !amf) {
      return;
    }
    const wa = this._computeApi(amf);
    if (!wa) {
      return;
    }
    const model = this._computeMethodEndpoint(wa, id);
    if (!model) {
      return;
    }
    this[endpointValue] = this[serializerValue].endPoint(model);
  }

  /**
   * Queries for the current servers value.
   */
  async [queryServers]() {
    this[serversValue] = undefined;
    const { domainId } = this;
    const endpointId = this[endpointValue] && this[endpointValue].id;
    const servers = this._getServers({
      endpointId,
      methodId: domainId,
    });
    if (Array.isArray(servers) && servers.length) {
      this[serversValue] = servers.map(server => this[serializerValue].server(server));
    }
  }

  /**
   * Queries for the responses data of the current operation.
   */
  async [queryResponses]() {
    this[responsesValue] = undefined;
    const { operation } = this;
    if (!operation) {
      return;
    }
    const { responses=[] } = operation;
    if (!responses.length) {
      return;
    }
    this[responsesValue] = responses;
  }

  /**
   * Updates the `selectedStatus` if not selected or the current selection doesn't 
   * exists in the current list of responses.
   */
  [preselectResponse]() {
    const responses = this[responsesValue];
    if (!Array.isArray(responses) || !responses.length) {
      return;
    }
    responses.sort((a, b) => {
      if (a.statusCode === b.statusCode) {
        return 0;
      }
      return Number(a.statusCode) > Number(b.statusCode) ? 1 : -1;
    });
    const { selectedStatus } = this;
    if (!selectedStatus) {
      this.selectedStatus = responses[0].statusCode;
      return;
    }
    const selected = responses.find((item) => item.statusCode === selectedStatus);
    if (selected) {
      return;
    }
    this.selectedStatus = responses[0].statusCode;
  }

  /**
   * Updates the `securityId` if not selected or the current selection doesn't 
   * exists in the current list of security.
   */
  [preselectSecurity]() {
    const { operation, renderSecurity, securityId } = this;
    if (!renderSecurity || !operation || !Array.isArray(operation.security) || !operation.security.length) {
      return;
    }
    if (!securityId) {
      this.securityId = operation.security[0].id;
      return;
    }
    const selected = operation.security.find((item) => item.id === securityId);
    if (selected) {
      return;
    }
    this.securityId = operation.security[0].id;
  }

  /**
   * Computes the URL value for the current serves, selected server, and endpoint's path.
   */
  [computeUrlValue]() {
    if (this.asyncApi) {
      return;
    }
    const endpoint = this[endpointValue];
    const version = this._computeApiVersion(this.amf);
    const { baseUri, server } = this;
    const wa = this._computeWebApi(this.amf);
    const protocols = /** @type string[] */ (this._getValueArray(wa, this.ns.aml.vocabularies.apiContract.scheme));
    const url = UrlLib.computeEndpointUri({ baseUri, server, endpoint, protocols, version, });
    this[urlValue] = url;
  }

  /**
   * Computes query parameters for the code snippets.
   */
  [computeParametersValue]() {
    this[snippetsParametersValue] = undefined;
    const { operation } = this;
    if (!operation) {
      return;
    }
    const { request } = operation;
    if (!request) {
      return;
    }
    const { queryParameters, queryString } = request;
    /** @type ApiParameter[] */
    let params;
    if (Array.isArray(queryParameters) && queryParameters.length) {
      params = queryParameters;
    } else if (queryString) {
      const factory = new QueryParameterProcessor();
      const items = factory.collectOperationParameters(request.queryString, 'query');
      if (Array.isArray(items) && items.length) {
        params = items.map(i => i.parameter);
      }
    }
    if (!params || !params.length) {
      return;
    }
    const qp = /** @type {Record<string, any>} */ ({});
    params.forEach((param) => {
      const { required, schema, paramName, name } = param;
      if (!required) {
        return;
      }
      const parameterName = paramName || name;
      const anySchema = /** @type ApiAnyShape */ (schema);
      const { defaultValueStr, examples=[] } = anySchema;
      if (defaultValueStr) {
        qp[parameterName] = defaultValueStr;
      } else if (examples.length) {
        const exp = examples.find(e => e.value);
        if (exp) {
          qp[parameterName] = exp.value;
        }
      } else {
        const value = ApiSchemaValues.generateDefaultValue(/** @type ApiScalarShape */ (schema));
        if (value || value === false || value === 0 || value === null) {
          qp[parameterName] = value;
        }
        // if (typeof value === 'undefined') {
        //   qp[parameterName] = '';
        // } else {
        //   qp[parameterName] = value;
        // }
      }
    });
    const value = UrlLib.applyUrlParameters('', qp, true);
    this[snippetsParametersValue] = value;
  }

  /**
   * Computes payload value for the code snippets.
   */
  [computeSnippetsPayload]() {
    this[snippetsPayloadValue] = undefined
    if (this.asyncApi) {
      return;
    }
    const { operation, requestMimeType } = this;
    if (!operation || !requestMimeType) {
      return;
    }
    const { request } = operation;
    if (!request) {
      return;
    }
    const { payloads=[] } = request;
    if (!payloads.length) {
      return;
    }
    const payload = payloads.find(p => p.mediaType === requestMimeType);
    if (!payload) {
      return;
    }
    const { examples=[], schema } = payload;
    let examplesCopy = [...examples];
    const anySchema = /** @type ApiAnyShape */ (schema);
    if (Array.isArray(anySchema.examples) && anySchema.examples.length) {
      examplesCopy = examplesCopy.concat(anySchema.examples);
    }
    examplesCopy = examplesCopy.filter((i) => !!i.value || !!i.structuredValue);
    let payloadValue;
    if (examplesCopy.length) {
      const example = examplesCopy.find(e => !!e.value);
      if (example) {
        payloadValue = this[evaluateExample](example, requestMimeType);
      }
    }
    if (!payloadValue) {
      payloadValue = ApiSchemaGenerator.asExample(schema, requestMimeType, {
        renderExamples: true,
        renderOptional: true,
      });
    }
    if (payloadValue && payloadValue.renderValue) {
      this[snippetsPayloadValue] = payloadValue.renderValue;
    }
  }

  /**
   * Computes headers value for the code snippets.
   */
  [computeSnippetsHeaders]() {
    this[snippetsHeadersValue] = undefined;
    if (this.asyncApi) {
      return;
    }
    const { operation, requestMimeType } = this;
    if (!operation) {
      return;
    }
    const { request, method } = operation;
    if (!request) {
      return;
    }
    const { headers=[] } = request;
    const parts = [];
    let hasMime = false;
    headers.forEach((param) => {
      const { paramName, name, schema } = param;
      if (!schema || !schema.types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
        return;
      }
      const typedScalar = /** @type ApiScalarShape */ (schema);
      let value = ApiSchemaValues.readInputValue(param, typedScalar, { fromExamples: true });
      if (Array.isArray(value)) {
        value = value.join(',');
      }
      if (typeof value !== 'undefined') {
        const headerName = paramName || name || '';
        if (headerName.toLowerCase() === 'content-type') {
          hasMime = true;
        }
        const header = `${paramName || name}: ${value}`;
        parts.push(header);
      }
    });
    if (!hasMime && requestMimeType && method !== 'get') {
      parts.push(`content-type: ${requestMimeType}`);
    }
    this[snippetsHeadersValue] = parts.join('\n');
  }

  /**
   * A handler for the status code tab selection.
   * @param {Event} e
   */
  [statusCodeHandler](e) {
    const tabs = /** @type AnypointTabs */ (e.target);
    this.selectedStatus = String(tabs.selected);
  }

  /**
   * A handler for the status code tab selection.
   * @param {Event} e
   */
  [securitySelectionHandler](e) {
    const tabs = /** @type AnypointTabs */ (e.target);
    this.securityId = String(tabs.selected);
  }

  /**
   * A handler for the try it button click.
   * It dispatches the `tryit` custom event.
   */
  [tryItHandler]() {
    const { operation, asyncApi } = this;
    if (!operation || asyncApi) {
      return;
    }
    const { id } = operation;
    const detail = { id };
    const config = {
      bubbles: true,
      composed: true,
      detail,
    };
    [
      'tryit-requested',
      'tryit'
    ].forEach((name) => {
      this.dispatchEvent(new CustomEvent(name, config));
    });
  }

  /**
   * A handler for the request panel mime type change.
   * @param {Event} e
   */
  [requestMimeChangeHandler](e) {
    const panel = /** @type ApiRequestDocumentElement */ (e.target);
    this.requestMimeType = panel.mimeType;
    this[computeSnippetsPayload]();
    this[computeSnippetsHeaders]();
    this.requestUpdate();
  }

  render() {
    if (!this[operationValue]) {
      return html``;
    }
    return html`
    <style>${this.styles}</style>
    ${this[titleTemplate]()}
    ${this[summaryTemplate]()}
    ${this[urlTemplate]()}
    ${this[traitsTemplate]()}
    ${this[deprecatedTemplate]()}
    ${this[descriptionTemplate](this[operationValue].description)}
    ${this[metaDataTemplate]()}
    ${this[customDomainPropertiesTemplate](this[operationValue].customDomainProperties)}
    ${this[requestTemplate]()}
    ${this[callbacksTemplate]()}
    ${this[snippetsTemplate]()}
    ${this[responseTemplate]()}
    ${this[securitySectionTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult} The template for the Operation title.
   */
  [titleTemplate]() {
    const operation = this[operationValue];
    const { name, method, deprecated } = operation;
    const label = name || method;
    const labelClasses = {
      label: true,
      deprecated,
    };
    const subTitle = this.asyncApi ? 'Async operation' : 'API operation';
    return html`
    <div class="operation-header">
      <div class="operation-title">
        <span class="${classMap(labelClasses)}">${label}</span>
        ${this[tryItTemplate]()}
      </div>
      <p class="sub-header">${subTitle}</p>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the Operation traits.
   */
  [traitsTemplate]() {
    const operation = /** @type ApiOperation */ (this[operationValue]);
    const { traits } = operation;
    if (!traits || !traits.length) {
      return '';
    }
    const names = traits.map(trait => trait.name).filter(i => !!i);
    let value = '';
    if (names.length === 2) {
      value = names.join(' and ');
    } else if (value.length > 2) {
      const last = names.pop();
      value = names.join(', ');
      value += `, and ${last}`;
    } else {
      value = names.join(', ');
    }
    return html`
    <section class="extensions">
      <p>Mixes in <span class="trait-name">${value}</span>.</p>
    </section>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the operation summary filed.
   */
  [summaryTemplate]() {
    const operation = this[operationValue];
    const { summary } = operation;
    if (!summary) {
      return '';
    }
    return html`
    <p class="summary">${summary}</p>
    `;
  }

  /**
   * @returns {TemplateResult[]|string} The template for the Operation meta information.
   */
  [metaDataTemplate]() {
    const operation = this[operationValue];
    const { operationId, } = operation;
    const result = [];
    if (operationId) {
      result.push(tablePropertyTemplate('Operation ID', operationId, 'operation-id'));
    }
    if (result.length) {
      return result;
    }
    return '';
  }

  /**
   * @returns {TemplateResult|string} The template for the deprecated message.
   */
  [deprecatedTemplate]() {
    const operation = this[operationValue];
    const { deprecated } = operation;
    if (!deprecated) {
      return '';
    }
    return html`
    <div class="deprecated-message">
      <arc-icon icon="warning"></arc-icon>
      <span class="message">
      This operation is marked as deprecated.
      </span>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the operation's URL.
   */
  [urlTemplate]() {
    if (this.asyncApi) {
      return '';
    }
    const url = this[urlValue];
    const operation = this[operationValue];
    const { method } = operation;
    return html`
    <div class="endpoint-url">
      <div class="method-label" data-method="${method}">${method}</div>
      <div class="url-value">${url}</div>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the operation's request documentation element.
   */
  [requestTemplate]() {
    const operation = this[operationValue];
    if (!operation) {
      return '';
    }
    const { server, endpoint } = this;
    return html`
    <api-request-document 
      .amf="${this.amf}"
      .request="${operation.request}" 
      .server=${server} 
      .endpoint=${endpoint}
      payloadOpened 
      headersOpened 
      parametersOpened
      ?anypoint="${this.anypoint}"
      @mimechange="${this[requestMimeChangeHandler]}"
    ></api-request-document>
    `;
  }

  [callbacksTemplate]() {
    const { operation } = this;
    const { callbacks } = operation;
    if (!Array.isArray(callbacks) || !callbacks.length) {
      return '';
    }
    const content = callbacks.map(callback => this[callbackTemplate](callback));
    return this[paramsSectionTemplate]('Callbacks', 'callbacksOpened', content);
  }

  /**
   * @param {ApiCallback} callback
   * @returns {TemplateResult} The template for the operation's request documentation element.
   */
  [callbackTemplate](callback) {
    const { name, endpoint } = callback;
    if (!endpoint) {
      return html``;
    }
    const { operations=[] } = endpoint;
    const [operation] = operations;
    if (!operation) {
      return html``;
    }
    return html`
    <div class="callback-section">
      <div class="heading4 table-title">${name}</div>
      <api-operation-document 
        .amf="${this.amf}"
        .domainId="${operation.id}"
        .operation="${operation}"
        .serverId="${this.serverId}" 
        .endpoint="${endpoint}"
        data-domain-id="${operation.id}"
        class="operation"
        ?anypoint="${this.anypoint}"
      ></api-operation-document>
    </div>
    `;
  }

  [responseTemplate]() {
    const responses = this[responsesValue];
    if (!Array.isArray(responses) || !responses.length) {
      return '';
    }
    const content = html`
    ${this[responseTabsTemplate](responses)}
    ${this[responseContentTemplate](responses)}
    `;
    return this[paramsSectionTemplate]('Responses', 'responsesOpened', content);
  }

  /**
   * @param {ApiResponse[]} responses The responses to render.
   * @returns {TemplateResult} The template for the responses selector.
   */
  [responseTabsTemplate](responses) {
    const { selectedStatus, anypoint } = this;
    const filtered = responses.filter((item) => !!item.statusCode);
    return html`
    <div class="status-codes-selector">
      <anypoint-tabs
        scrollable
        .selected="${selectedStatus}"
        attrForSelected="data-status"
        @selected="${this[statusCodeHandler]}"
        ?compatibility="${anypoint}"
      >
        ${filtered.map((item) => html`<anypoint-tab data-status="${item.statusCode}" ?compatibility="${anypoint}">${item.statusCode}</anypoint-tab>`)}
      </anypoint-tabs>
      <div class="codes-selector-divider"></div>
    </div>
    `;
  }

  /**
   * @param {ApiResponse[]} responses The responses to render.
   * @returns {TemplateResult} The template for the currently selected response.
   */
  [responseContentTemplate](responses) {
    const { selectedStatus } = this;
    const response = responses.find((item) => item.statusCode === selectedStatus);
    if (!response) {
      return html`<div class="empty-info">Select a response to render the documentation.</div>`;
    }
    return html`
    <api-response-document 
      .amf="${this.amf}" 
      .response="${response}" 
      headersOpened 
      payloadOpened
      ?anypoint="${this.anypoint}"
      class="method-response"
    ></api-response-document>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the security list section.
   */
  [securitySectionTemplate]() {
    const { operation, renderSecurity, securityId } = this;
    if (!renderSecurity || !operation || !Array.isArray(operation.security) || !operation.security.length) {
      return '';
    }
    const { security } = operation;
    const content = [];
    if (security.length === 1) {
      content.push(this[securityTemplate](security[0]));
    } else if (securityId) {
      content.push(this[securitySelectorTemplate]());
      const item = security.find(i => i.id === securityId);
      if (item) {
        content.push(this[securityTemplate](item));
      }
      // security.forEach((model) => content.push(this[securityTemplate](model)));
    }
    return this[paramsSectionTemplate]('Security', 'securityOpened', content);
  }

  /**
   * @param {ApiSecurityRequirement} security
   * @returns {TemplateResult} 
   */
  [securityTemplate](security) {
    return html`<api-security-requirement-document 
      .amf="${this.amf}" 
      .domainId="${security.id}" 
      ?anypoint="${this.anypoint}"
    ></api-security-requirement-document>`
  }

  /**
   * @returns {TemplateResult} 
   */
  [securitySelectorTemplate]() {
    const { operation, securityId, anypoint } = this;
    const { security } = operation;
    return html`
    <div class="security-selector">
      <anypoint-tabs
        scrollable
        .selected="${securityId}"
        attrForSelected="data-id"
        @selected="${this[securitySelectionHandler]}"
        ?compatibility="${anypoint}"
      >
        ${security.map((item) => this[securityTabTemplate](item))}
      </anypoint-tabs>
      <div class="codes-selector-divider"></div>
    </div>
    `;
  }

  /**
   * @param {ApiSecurityRequirement} security
   * @returns {TemplateResult} 
   */
  [securityTabTemplate](security) {
    const { name, schemes=[], id } = security;
    let label = 'unknown';
    if (name) {
      label = name;
    } else if (schemes.length) {
      const parts = schemes.map(i => i.name).filter(i => !!i);
      if (parts.length) {
        label = parts.join('/');
      }
    }
    return  html`<anypoint-tab data-id="${id}" ?compatibility="${this.anypoint}">${label}</anypoint-tab>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the "try it" button.
   */
  [tryItTemplate]() {
    if (!this.tryIt) {
      return '';
    }
    return html`
    <anypoint-button
      class="action-button"
      @click="${this[tryItHandler]}"
      emphasis="high"
      ?compatibility="${this.anypoint}"
    >Try it</anypoint-button>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the code snippets.
   */
  [snippetsTemplate]() {
    if (!this.renderCodeSnippets || this.asyncApi) {
      return '';
    }
    const { operation } = this;
    const content = html`
    <http-code-snippets
      scrollable
      ?compatibility="${this.anypoint}"
      .url="${this.snippetsUri}"
      .method="${(operation.method || '').toUpperCase()}"
      .payload="${this[snippetsPayloadValue]}"
      .headers="${this[snippetsHeadersValue]}"
    ></http-code-snippets>
    `;
    return this[paramsSectionTemplate]('Code snippets', 'snippetsOpened', content);
  }
}

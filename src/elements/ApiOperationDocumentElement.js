/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { Styles as HttpStyles } from '@api-components/http-method-label';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tab.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tabs.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import elementStyles from './styles/ApiOperation.js';
import commonStyles from './styles/Common.js';
import { 
  ApiDocumentationBase, 
  paramsSectionTemplate,
  descriptionTemplate,
  serializerValue,
  customDomainPropertiesTemplate,
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
/** @typedef {import('@anypoint-web-components/anypoint-tabs').AnypointTabs} AnypointTabs */

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
export const preselectResponse = Symbol('preselectResponse');
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
export const deprecatedTemplate = Symbol('deprecatedTemplate');
export const metaDataTemplate = Symbol('metaDataTemplate');
export const tryItTemplate = Symbol('tryItTemplate');
export const tryItHandler = Symbol('tryItHandler');
export const callbacksTemplate = Symbol('callbacksTemplate');
export const callbackTemplate = Symbol('callbackTemplate');

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
    this.requestUpdate();
  }

  static get properties() {
    return {
      /** 
       * The id of the currently selected server to use to construct the URL.
       * If not set a first server in the API servers array is used.
       */
      serverId: { type: String, reflect: true },
      /** 
       * When set it opens the response section
       */
      responsesOpened: { type: Boolean, reflect: true },
      /** 
       * When set it opens the security section
       */
      securityOpened: { type: Boolean, reflect: true },
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
    this.tryIt = undefined;
    /** @type {boolean} */
    this.asyncApi = undefined;
    /** @type {Operation} */
    this.domainModel = undefined;
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
    this[computeUrlValue]();
    await this.requestUpdate();
  }

  /**
   * Queries for the API operation's endpoint data.
   */
  async [queryEndpoint]() {
    const { domainId, amf } = this;
    this[endpointValue] = undefined;
    if (!domainId || !amf) {
      return;
    }
    const wa = this._computeApi(amf);
    if (!wa) {
      return;
    }
    const model = this._computeMethodEndpoint(wa, domainId);
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
   * Computes the URL value for the current serves, selected server, and endpoint's path.
   */
  [computeUrlValue]() {
    if (this.asyncApi) {
      return;
    }
    const servers = this[serversValue];
    const endpoint = this[endpointValue];
    const serverId = this[serverIdValue];
    let result = '';
    let server;
    if (Array.isArray(servers) && servers.length) {
      if (serverId) {
        server = servers.find((item) => item.id === serverId);
      } else {
        [server] = servers;
      }
    }
    if (server) {
      result += server.url;
      if (result.endsWith('/')) {
        result = result.substr(0, result.length - 1);
      }
    }
    if (endpoint) {
      let { path='' } = endpoint;
      if (path[0] !== '/') {
        path = `/${path}`;
      }
      result += path;
    }
    if (!result) {
      result = '(unknown path)';
    }
    this[urlValue] = result;
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

  render() {
    if (!this[operationValue]) {
      return html``;
    }
    return html`
    <style>${this.styles}</style>
    ${this[titleTemplate]()}
    ${this[traitsTemplate]()}
    ${this[summaryTemplate]()}
    ${this[deprecatedTemplate]()}
    ${this[descriptionTemplate](this[operationValue].description)}
    ${this[metaDataTemplate]()}
    ${this[customDomainPropertiesTemplate](this[operationValue].customDomainProperties)}
    ${this[urlTemplate]()}
    ${this[requestTemplate]()}
    ${this[callbacksTemplate]()}
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
      result.push(tablePropertyTemplate('Operation ID', operationId));
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
    if (!operation || !operation.request) {
      return '';
    }
    return html`
    <api-request-document 
      .amf="${this.amf}"
      .request="${operation.request}" 
      payloadOpened 
      headersOpened 
      parametersOpened
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
    const { selectedStatus } = this;
    const filtered = responses.filter((item) => !!item.statusCode);
    return html`
    <div class="status-codes-selector">
      <anypoint-tabs
        scrollable
        .selected="${selectedStatus}"
        attrForSelected="data-status"
        @selected="${this[statusCodeHandler]}"
      >
        ${filtered.map((item) => html`<anypoint-tab data-status="${item.statusCode}">${item.statusCode}</anypoint-tab>`)}
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
    <api-response-document .amf="${this.amf}" .response="${response}" headersOpened payloadOpened></api-response-document>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the security list section.
   */
  [securitySectionTemplate]() {
    const { operation } = this;
    if (!operation || !Array.isArray(operation.security) || !operation.security.length) {
      return '';
    }
    const content = operation.security.map((model) => html`<api-security-requirement-document .amf="${this.amf}" .securityRequirement="${model}"></api-security-requirement-document>`);
    return this[paramsSectionTemplate]('Security', 'securityOpened', content);
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
}

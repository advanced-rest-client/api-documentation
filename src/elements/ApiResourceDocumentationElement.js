/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import elementStyles from './styles/ApiResource.js';
import commonStyles from './styles/Common.js';
import { 
  ApiDocumentationBase, 
  paramsSectionTemplate, 
  schemaItemTemplate,
  descriptionTemplate,
  serializerValue,
} from './ApiDocumentationBase.js';
import '../../api-operation-document.js'
import '../../api-parameter-document.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').ApiEndPoint} ApiEndPoint */
/** @typedef {import('@api-components/amf-helper-mixin').EndPoint} EndPoint */
/** @typedef {import('@api-components/amf-helper-mixin').ApiServer} ApiServer */
/** @typedef {import('@api-components/amf-helper-mixin').ApiOperation} ApiOperation */

export const operationIdValue = Symbol('operationIdValue');
export const queryEndpoint = Symbol('queryEndpoint');
export const queryServers = Symbol('queryServers');
export const endpointValue = Symbol('endpointValue');
export const serversValue = Symbol('serversValue');
export const serverIdValue = Symbol('serverIdValue');
export const urlValue = Symbol('urlValue');
export const computeUrlValue = Symbol('computeUrlValue');
export const titleTemplate = Symbol('titleTemplate');
export const urlTemplate = Symbol('urlTemplate');
export const operationsTemplate = Symbol('operationsTemplate');
export const operationTemplate = Symbol('operationTemplate');
export const parametersTemplate = Symbol('parametersTemplate');
export const operationIdChanged = Symbol('operationIdChanged');

/**
 * A web component that renders the documentation page for an API resource built from 
 * the AMF graph model.
 */
export default class AmfResourceDocumentationElement extends ApiDocumentationBase {
  static get styles() {
    return [elementStyles, commonStyles, MarkdownStyles];
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
    this.processGraph();
  }

  /** @returns {string} */
  get operationId() {
    return this[operationIdValue];
  }

  /** @param {string} value */
  set operationId(value) {
    const old = this[operationIdValue];
    if (old === value) {
      return;
    }
    this[operationIdValue] = value;
    this.requestUpdate('operationId', old);
    this[operationIdChanged]();
  }

  /** @returns {string} */
  get serverId() {
    return this[serverIdValue];
  }

  /** @param {string} value */
  set serverId(value) {
    const old = this[serverIdValue];
    if (old === value) {
      return;
    }
    this[serverIdValue] = value;
    this[computeUrlValue]();
  }

  static get properties() {
    return {
      /** 
       * The id of the currently selected server to use to construct the URL.
       * If not set a first server in the API servers array is used.
       */
      serverId: { type: String, reflect: true },
      /** 
       * When set it scrolls to the operation with the given id, if exists.
       * The operation is performed after render.
       */
      operationId: { type: String, reflect: true },
      /** 
       * When set it opens the parameters section
       */
      parametersOpened: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    /**
     * @type {ApiEndPoint}
     */
    this[endpointValue] = undefined;
    /**
     * @type {ApiServer[]}
     */
    this[serversValue] = undefined;
    /**
     * @type {string}
     */
    this[urlValue] = undefined;

    this.parametersOpened = false;
    /**
     * @type {string}
     */
    this.operationId = undefined;
    /** @type {EndPoint} */
    this.domainModel = undefined;
  }

  /**
   * @returns {Promise<void>}
   */
  async processGraph() {
    const { domainModel, domainId, amf } = this;
    if (domainModel) {
      this[endpointValue] = this[serializerValue].endPoint(domainModel);
    } else if (domainId && amf) {
      const webApi = this._computeApi(amf);
      const model = this._computeEndpointModel(webApi, domainId);
      if (model) {
        this[endpointValue] = this[serializerValue].endPoint(model);
      }
    }
    await this[queryServers]();
    this[computeUrlValue]();
    await this.requestUpdate();
    if (this.operationId) {
      // this timeout gives few milliseconds for the operations to render.
      setTimeout(() => {
        // Todo: operations should inform the parent that the view is rendered
        // and after that this function should be called.
        this.scrollToOperation(this.operationId);
      }, 200);
    }
  }

  /**
   * Scrolls the view to the operation, when present in the DOM.
   * @param {string} id The operation domain id to scroll into.
   */
  scrollToOperation(id) {
    const elm = this.shadowRoot.querySelector(`api-operation-document[data-domain-id="${id}"]`);
    if (!elm) {
      return;
    }
    elm.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
  }

  /**
   * Scrolls to the selected operation after view update.
   */
  async [operationIdChanged]() {
    await this.updateComplete;
    const { operationId } = this;
    if (operationId) {
      this.scrollToOperation(operationId);
    } else {
      this.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
    }
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
   * Computes the URL value for the current serves, selected server, and endpoint's path.
   */
  [computeUrlValue]() {
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

  render() {
    if (!this[endpointValue]) {
      return html``;
    }
    return html`
    ${this[titleTemplate]()}
    ${this[descriptionTemplate](this[endpointValue].description)}
    ${this[urlTemplate]()}
    ${this[parametersTemplate]()}
    ${this[operationsTemplate]()}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the Operation title.
   */
  [titleTemplate]() {
    const endPoint = this[endpointValue];
    const { name, path } = endPoint;
    const label = name || path;
    if (!label) {
      return '';
    }
    return html`
    <div class="endpoint-header">
      <div class="endpoint-title">
        <span class="label">${label}</span>
      </div>
      <p class="sub-header">API endpoint</p>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the operation's URL.
   */
  [urlTemplate]() {
    const url = this[urlValue];
    return html`
    <div class="endpoint-url">
      <div class="url-value">${url}</div>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the list of operations.
   */
  [operationsTemplate]() {
    const endPoint = /** @type ApiEndPoint */ (this[endpointValue]);
    const { operations } = endPoint;
    if (!operations.length) {
      return '';
    }
    return html`
    ${operations.map((operation) => this[operationTemplate](operation))}
    `;
  }

  /**
   * @param {ApiOperation} operation The graph id of the operation.
   * @returns {TemplateResult} The template for the API operation.
   */
  [operationTemplate](operation) {
    const { serverId } = this;
    return html`<api-operation-document 
      .operation="${operation}" 
      .serverId="${serverId}" 
      data-domain-id="${operation.id}"
      responsesOpened></api-operation-document>`;
  }

  /**
   * @return {TemplateResult|string} The template for the endpoint's URI params.
   */
  [parametersTemplate]() {
    const endPoint = /** @type ApiEndPoint */ (this[endpointValue]);
    const { parameters } = endPoint;
    if (!parameters.length) {
      return '';
    }
    const content = parameters.map((param) => this[schemaItemTemplate](param));
    return this[paramsSectionTemplate]('URI parameters', 'parametersOpened', content);
  }
}

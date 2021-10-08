/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import '@api-components/api-server-selector/api-server-selector.js'
import elementStyles from './styles/ApiDocumentation.js';
import { 
  ApiDocumentationBase,
  serializerValue,
  processDebounce,
} from './ApiDocumentationBase.js';
import '../../api-summary.js'
import '../../api-operation-document.js'
import '../../api-resource-document.js';
import '../../api-security-document.js';
import '../../api-documentation-document.js';
import '../../api-schema-document.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */
/** @typedef {import('@api-components/amf-helper-mixin').EndPoint} EndPoint */
/** @typedef {import('@api-components/amf-helper-mixin').Operation} Operation */
/** @typedef {import('@api-components/amf-helper-mixin').ApiSummary} ApiSummary */
/** @typedef {import('@api-components/api-server-selector').ServerType} ServerType */

export const operationIdValue = Symbol('operationIdValue');
export const domainTypeValue = Symbol('domainTypeValue');
export const navigationHandler = Symbol('navigationHandler');
export const navEventsRegistered = Symbol('navEventsRegistered');
export const registerNavigationEvents = Symbol('registerNavigationEvents');
export const unregisterNavigationEvents = Symbol('unregisterNavigationEvents');
export const handleNavigationEventsValue = Symbol('handleNavigationEventsValue');
export const processApiSpecSelection = Symbol('processApiSpecSelection');
export const isLibrary = Symbol('isLibrary');
export const processLibrarySelection = Symbol('processLibrarySelection');
export const computeDeclById = Symbol('computeDeclById');
export const renderedViewValue = Symbol('renderedViewValue');
export const renderedModelValue = Symbol('renderedModelValue');
export const computeSecurityApiModel = Symbol('computeSecurityApiModel');
export const computeReferenceSecurity = Symbol('computeReferenceSecurity');
export const computeTypeApiModel = Symbol('computeTypeApiModel');
export const computeDocsApiModel = Symbol('computeDocsApiModel');
export const computeResourceApiModel = Symbol('computeEndpointApiModel');
export const computeEndpointApiMethodModel = Symbol('computeEndpointApiMethodModel');
export const computeMethodApiModel = Symbol('computeMethodApiModel');
export const processFragment = Symbol('processFragment');
export const processPartial = Symbol('processPartial');
export const processEndpointPartial = Symbol('processEndpointPartial');
export const endpointValue = Symbol('endpointValue');
export const apiSummaryValue = Symbol('apiSummaryValue');
export const serverSelectorTemplate = Symbol('serverSelectorTemplate');
export const serversCountHandler = Symbol('serversCountHandler');
export const serverChangeHandler = Symbol('serverChangeHandler');
export const modelTemplate = Symbol('modelTemplate');
export const summaryTemplate = Symbol('summaryTemplate');
export const securityTemplate = Symbol('securityTemplate');
export const documentationTemplate = Symbol('documentationTemplate');
export const schemaTemplate = Symbol('schemaTemplate');
export const resourceTemplate = Symbol('resourceTemplate');

/**
 * A main documentation view for an AMF model representing a sync or an async API.
 * 
 * This element works with the [AMF](https://github.com/mulesoft/amf) data model.
 */
export default class ApiDocumentationElement extends ApiDocumentationBase {
  get styles() {
    return elementStyles;
  }

  static get properties() {
    return {
      /**
       * Type of the selected domain item.
       * One of `documentation`, `type`, `security`, `endpoint`, `method`,
       * or `summary`.
       */
      domainType: { type: String },
      /** 
       * The domain id of the currently rendered API operation.
       * When selecting an operation the `domainId` is the id if the parent endpoint.
       */
      operationId: { type: String },
      /**
       * By default application hosting the element must set `domainId` and
       * `domainType` properties. When using `api-navigation` element
       * by setting this property the element listens for navigation events
       * and updates the state
       */
      handleNavigationEvents: { type: Boolean },
      /**
       * A property to set to override AMF's model base URI information.
       */
      baseUri: { type: String },
      /** 
       * When set it renders the "try it" button that dispatches the `tryit` event.
       */
      tryItButton: { type: Boolean, reflect: true },
      /** 
       * When set it renders the "try it" panel next to the operation documentation.
       * Setting this automatically disables the `tryItButton` property.
       * 
       * Note, use this only when there's enough space on the screen to render 2 panels side-by-side.
       */
      tryItPanel: { type: Boolean, reflect: true },
      /**
       * OAuth2 redirect URI.
       * This value **must** be set in order for OAuth 1/2 to work properly.
       * This is only required in inline mode (`inlineMethods`).
       */
      redirectUri: { type: String },
      /** 
       * When set it renders the URL input above the URL parameters in the HTTP editor.
       */
      httpUrlEditor: { type: Boolean, reflect: true },
      /** 
       * When set it applies the authorization values to the request dispatched
       * with the API request event.
       * If possible, it applies the authorization values to query parameter or headers
       * depending on the configuration.
       * 
       * When the values arr applied to the request the authorization config is kept in the
       * request object, but its `enabled` state is always `false`, meaning other potential
       * processors should ignore this values.
       * 
       * If this property is not set then the application hosting this component should
       * process the authorization data and apply them to the request.
       */
      httpApplyAuthorization: { type: Boolean, reflect: true },
      /**
       * List of credentials source passed to the HTTP editor
       */
      httpCredentialsSource: { type: Array },
      /**
       * Optional property to set on the request editor. 
       * When true, the server selector is not rendered
       */
      httpNoServerSelector: { type: Boolean },
      /**
       * When set it renders "add custom" item button in the HTTP request editor.
       * If the element is to be used without AMF model this should always
       * be enabled. Otherwise users won't be able to add a parameter.
       */
      httpAllowCustom: { type: Boolean },
      /**
       * Optional property to set on the request editor. 
       * If true, the server selector custom base URI option is rendered
       */
      httpAllowCustomBaseUri: { type: Boolean },
      /**
       * The URI of the server currently selected in the server selector
       */
      serverValue: { type: String },
      /**
       * The type of the server currently selected in the server selector
       */
      serverType: { type: String },
    };
  }

  /** 
   * @returns {string|undefined} The domain id of the object to render.
   */
  get domainType() {
    return this[domainTypeValue];
  }

  /** 
   * @returns {string|undefined} The domain id of the object to render.
   */
  set domainType(value) {
    const old = this[domainTypeValue];
    if (old === value) {
      return;
    }
    this[domainTypeValue] = value;
    this.requestUpdate('domainType', old);
    if (value) {
      this[processDebounce]();
    }
  }

  /** 
   * @returns {string|undefined} The domain id of the object to render.
   */
  get operationId() {
    return this[operationIdValue];
  }

  /** 
   * @returns {string|undefined} The domain id of the object to render.
   */
  set operationId(value) {
    const old = this[operationIdValue];
    if (old === value) {
      return;
    }
    this[operationIdValue] = value;
    this.requestUpdate('operationId', old);
    if (value) {
      this[processDebounce]();
    }
  }

  /** @returns {boolean} */
  get handleNavigationEvents() {
    return this[handleNavigationEventsValue];
  }

  /** @param {boolean} value */
  set handleNavigationEvents(value) {
    const old = this[handleNavigationEventsValue];
    if (old === value) {
      return;
    }
    this[handleNavigationEventsValue] = value;
    if (value) {
      this[registerNavigationEvents]();
    } else {
      this[unregisterNavigationEvents]();
    }
  }

  /**
   * Former `effectiveBaseUri`.
   * @returns {string|undefined} The URI for the API defined by the `baseUri` property or the `serverValue`.
   */
  get apiBaseUri() {
    const { baseUri, serverValue } = this;
    return baseUri || serverValue;
  }

  /**
   * @deprecated Use `apiBaseUri` instead.
   */
  get effectiveBaseUri() {
    return this.apiBaseUri;
  }

  /** @returns {string} The domain type of the rendered view. */
  get renderedView() {
    return this[renderedViewValue];
  }

  /** @returns {any} The domain model rendered in the view. */
  get renderedModel() {
    return this[renderedModelValue];
  }

  /** @returns {boolean} */
  get renderSelector() {
    const { domainType, serversCount, httpAllowCustomBaseUri } = this;
		const isMethodOrEndpoint = !!domainType && (['method', 'endpoint'].includes(domainType));
		const moreThanOneServer = serversCount >= 2;
		if (isMethodOrEndpoint) {
			return httpAllowCustomBaseUri || moreThanOneServer;
		}
		return false;
  }

  constructor() {
    super();
    /** @type {string} */
    this.domainType = undefined;
    /** @type {string} */
    this.operationId = undefined;
    /** @type {string} */
    this.baseUri = undefined;
    /** @type {boolean} */
    this.tryItButton = undefined;
    /** @type {boolean} */
    this.tryItPanel = undefined;
    /** @type {boolean} */
    this.httpUrlEditor = undefined;
    /** @type {boolean} */
    this.httpNoServerSelector = undefined;
    /** @type {boolean} */
    this.httpAllowCustomBaseUri = undefined;
    /** @type {boolean} */
    this.httpAllowCustom = undefined;
    /** @type {string} */
    this.redirectUri = undefined;
    /** @type {ServerType} */
    this.serverType = undefined;
    /** @type {string} */
    this.serverValue = undefined;
    /** @type {number} */
    this.serversCount = undefined;
    /** @type {boolean} */
    this.httpApplyAuthorization = undefined;
    this.httpCredentialsSource = undefined;
    /** @type {EndPoint} */
    this[endpointValue] = undefined;
    /** @type {ApiSummary} */
    this[apiSummaryValue] = undefined;

    this[navigationHandler] = this[navigationHandler].bind(this);
    this[navEventsRegistered] = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this[navEventsRegistered]) {
      this[unregisterNavigationEvents]();
    }
  }

  /**
   * Registers `api-navigation-selection-changed` event listener handler
   * on window object.
   */
  [registerNavigationEvents]() {
    this[navEventsRegistered] = true;
    window.addEventListener('api-navigation-selection-changed', this[navigationHandler]);
  }

  /**
   * Removes event listener from window object for `api-navigation-selection-changed` event.
   */
  [unregisterNavigationEvents]() {
    this[navEventsRegistered] = false;
    window.removeEventListener('api-navigation-selection-changed', this[navigationHandler]);
  }

  /**
   * Handler for `api-navigation-selection-changed` event.
   * 
   * Note, when the current type is set to `method` then the `operationId` is
   * set instead of `domainId`, which is set to the parent endpoint id.
   *
   * @param {CustomEvent} e
   */
  [navigationHandler](e) {
    const { selected, type, endpointId, passive } = e.detail;
    if (passive === true) {
      return;
    }
    this.domainType = type;
    if (type === 'method') {
      this.operationId = selected;
      this.domainId = endpointId;  
    } else {
      this.operationId = undefined;
      this.domainId = selected;
    }
    this.processGraph();
  }

  /**
   * @returns {Promise<void>}
   */
  async processGraph() {
    this[apiSummaryValue] = undefined;
    let { amf } = this;
    if (!amf) {
      return;
    }
    if (Array.isArray(amf)) {
      [amf] = amf;
    }
    const api = this._computeApi(amf);
    if (api) {
      const summary = this[serializerValue].apiSummary(api);
      this[apiSummaryValue] = summary;
      this[processApiSpecSelection](amf);
      return;
    }
    if (this[isLibrary](amf)) {
      this[processLibrarySelection](amf);
      return;
    }
    if (this._hasType(amf, this.ns.aml.vocabularies.security.SecuritySchemeFragment)) {
      this[processFragment](amf, 'security');
      return;
    }
    if (this._hasType(amf, this.ns.aml.vocabularies.apiContract.UserDocumentationFragment)) {
      this[processFragment](amf, 'documentation');
      return;
    }
    if (this._hasType(amf, this.ns.aml.vocabularies.shapes.DataTypeFragment)) {
      this[processFragment](amf, 'type');
      return;
    }
    if (this._hasType(amf, this.ns.aml.vocabularies.core.CreativeWork)) {
      this[processPartial](amf, 'documentation');
      return;
    }
    if (this._hasType(amf, this.ns.aml.vocabularies.security.SecurityScheme)) {
      this[processPartial](amf, 'security');
      return;
    }
    if (this._hasType(amf, this.ns.aml.vocabularies.apiContract.EndPoint)) {
      this[processEndpointPartial](amf);
      return;
    }
    if (this._hasType(amf, this.ns.w3.shacl.Shape) || this._hasType(amf, this.ns.aml.vocabularies.document.DomainElement)) {
      this[processPartial](amf, 'type');
    }
  }

  /**
   * Processes selection for the web API data model. It ignores the input if
   * `domainId` or `domainType` is not set.
   * 
   * @param {AmfDocument} model WebApi AMF model. Do not use an array here.
   */
  [processApiSpecSelection](model) {
    const { domainId, tryItPanel } = this;
    let { domainType } = this;
    if (!domainId || !domainType) {
      // Not all required properties were set.
      return;
    }
    let result;
    switch (domainType) {
      case 'summary': result = model; break;
      case 'security': result = this[computeSecurityApiModel](model, domainId); break;
      case 'type': result = this[computeTypeApiModel](model, domainId); break;
      case 'documentation': result = this[computeDocsApiModel](model, domainId); break;
      case 'endpoint':
        result = this[computeResourceApiModel](model, domainId);
        break;
      case 'method':
        if (tryItPanel) {
          domainType = 'endpoint';
          result = this[computeEndpointApiMethodModel](model, domainId);
        } else {
          result = this[computeMethodApiModel](model, domainId);
          this[endpointValue] = this[computeEndpointApiMethodModel](model, domainId);
        }
        break;
      default:
        return;
    }
    this[renderedModelValue] = result;
    this[renderedViewValue] = domainType;
    this.requestUpdate();
  }

  /**
   * Processes selection for a library data model. It ignores the input if
   * `domainId` or `domainType` is not set.
   * @param {AmfDocument} model Library AMF model. Do not use an array here.
   */
  [processLibrarySelection](model) {
    const { domainId, domainType } = this;
    if (!domainId || !domainType) {
      // Not all required properties were set.
      return;
    }
    let result;
    switch (domainType) {
      case 'security':
      case 'type': 
        result = this[computeDeclById](model, domainId); 
        break;
      default:
        result = model;
        return;
    }
    this[renderedModelValue] = result;
    this[renderedViewValue] = domainType;
    this.requestUpdate();
  }

  /**
   * Processes fragment model and sets current selection and the model.
   * 
   * @param {AmfDocument} model RAML fragment model
   * @param {string} domainType The selected domain type.
   */
  [processFragment](model, domainType) {
    const result = this._computeEncodes(model);
    this[renderedModelValue] = result;
    this[renderedViewValue] = domainType;
    this.requestUpdate();
  }

  /**
   * Sets the partial model to be rendered.
   * 
   * @param {AmfDocument} model RAML partial model
   * @param {string} domainType The domain type representing the partial model.
   */
  [processPartial](model, domainType) {
    this[renderedModelValue] = model;
    this[renderedViewValue] = domainType;
    this.requestUpdate();
  }

  /**
   * Processes endpoint data from partial model definition.
   * It sets models that are used by the docs.
   *
   * If `selected` or `selectedType` is not set then it automatically selects
   * an endpoint.
   * @param {DomainElement} model Partial model for endpoints
   */
  [processEndpointPartial](model) {
    const { tryItPanel } = this;
    let { domainType } = this;
		if (!domainType || tryItPanel) {
			domainType = 'endpoint';
		}
    if (!['method', 'endpoint'].includes(domainType)) {
      domainType = 'endpoint';
    }
		this[endpointValue] = model;
		this[renderedModelValue] = model;
		this[renderedViewValue] = domainType;
    this.requestUpdate();
  }

  /**
   * Tests if `model` is of a RAML library model.
   * @param {AmfDocument} model A shape to test
   * @returns {boolean} true when the presented model is a library.
   */
  [isLibrary](model) {
    if (!model) {
      return false;
    }
    let doc = model;
    if (Array.isArray(doc)) {
      [doc] = doc;
    }
    if (!doc['@type']) {
      return false;
    }
    const moduleKey = this._getAmfKey(this.ns.aml.vocabularies.document.Module);
    return moduleKey === doc['@type'][0];
  }

  /**
   * Computes model of a shape defined in `declares` list
   * @param {AmfDocument} model AMF model
   * @param {string} domainId Current selection
   * @returns {any|undefined}
   */
  [computeDeclById](model, domainId) {
    const declares = this._computeDeclares(model);
		if (!declares) {
			return undefined;
		}
		let selectedDeclaration = this._findById(declares, domainId)
		if (!selectedDeclaration) {
			const references = this._computeReferences(model);
			if (references) {
				const declarationsInRef = references.map((r) => this._computeDeclares(r)).flat();
				selectedDeclaration = this._findById(declarationsInRef, domainId);
			}
		}
		return selectedDeclaration;
  }

  /**
   * Computes security scheme definition model from web API and current selection.
   * It looks for the definition in both `declares` and `references` properties.
   * Returned value is already resolved AMF model (references are resolved).
   *
   * @param {AmfDocument} model WebApi AMF model. Do not use an array here.
   * @param {string} domainId Currently selected `@id`.
   * @returns {DomainElement|undefined} Model definition for the security scheme.
   */
  [computeSecurityApiModel](model, domainId) {
    const declares = this._computeDeclares(model);
    if (declares) {
      const result = declares.find((item) => item['@id'] === domainId);
      if (result) {
        return this._resolve(result);
      }
    }
    const references = this._computeReferences(model);
    if (Array.isArray(references) && references.length) {
      for (const reference of references) {
        if (this._hasType(reference, this.ns.aml.vocabularies.document.Module)) {
          const result = this[computeReferenceSecurity](reference, domainId);
          if (result) {
            return this._resolve(result);
          }
        } 
      }
    }
    return undefined;
  }

  /**
   * Computes a security model from a reference (library for example).
   * @param {AmfDocument} reference AMF model for a reference to extract the data from
   * @param {string} domainId Node ID to look for
   * @returns {DomainElement|undefined} Type definition or undefined if not found.
   */
  [computeReferenceSecurity](reference, domainId) {
    const declare = this._computeDeclares(reference);
    if (!declare) {
      return undefined;
    }
    let result = declare.find((item) => {
      if (Array.isArray(item)) {
        [item] = item;
      }
      return item['@id'] === domainId;
    });
    if (Array.isArray(result)) {
      [result] = result;
    }
    return this._resolve(result);
  }

  /**
   * Computes type definition model from web API and current selection.
   * It looks for the definition in both `declares` and `references` properties.
   * Returned value is already resolved AMF model (references are resolved).
   *
   * @param {AmfDocument} model WebApi AMF model. Do not use an array here.
   * @param {string} domainId Currently selected `@id`.
   * @returns {DomainElement|undefined} Model definition for a type.
   */
  [computeTypeApiModel](model, domainId) {
    const declares = this._computeDeclares(model);
    const references = this._computeReferences(model);
    return this._computeType(declares, references, domainId);
  }

  /**
   * Computes documentation definition model from web API and current selection.
   *
   * @param {AmfDocument} model WebApi AMF model. Do not use an array here.
   * @param {string} domainId Currently selected `@id`.
   * @returns {DomainElement|undefined} Model definition for a documentation fragment.
   */
  [computeDocsApiModel](model, domainId) {
    const webApi = this._computeApi(model);
    return this._computeDocument(webApi, domainId);
  }

  /**
   * Computes Endpoint definition model from web API and current selection.
   *
   * @param {AmfDocument} model WebApi AMF model. Do not use an array here.
   * @param {string} domainId Currently selected `@id`.
   * @returns {DomainElement|undefined} Model definition for an endpoint fragment.
   */
  [computeResourceApiModel](model, domainId) {
    const webApi = this._computeApi(model);
    return this._computeEndpointModel(webApi, domainId);
  }

  /**
   * Computes Method definition model from web API and current selection.
   *
   * @param {AmfDocument} model WebApi AMF model. Do not use an array here.
   * @param {string} domainId Currently selected `@id`.
   * @returns {DomainElement|undefined}
   */
  [computeMethodApiModel](model, domainId) {
    const webApi = this._computeApi(model);
    return this._computeMethodModel(webApi, domainId);
  }

  /**
   * @param {AmfDocument} model WebApi AMF model.
   * @param {string} domainId Currently selected `@id`.
   * @returns {DomainElement|undefined}
   */
  [computeEndpointApiMethodModel](model, domainId) {
    const webApi = this._computeApi(model);
    return this._computeMethodEndpoint(webApi, domainId);
  }

  /**
   * @param {CustomEvent} e
   */
  [serversCountHandler](e) {
    this.serversCount = e.detail.value;
  }

  /**
   * @param {CustomEvent} e
   */
  [serverChangeHandler](e) {
    this.serverValue = e.detail.value;
    this.serverType = e.detail.type;
  }

  render() {
    return html`<style>${this.styles}</style>
    ${this[serverSelectorTemplate]()}
    ${this[modelTemplate]()}`;
  }

  /**
   * @returns {TemplateResult|string} The template for the server selector.
   */
  [serverSelectorTemplate]() {
    if (this.httpNoServerSelector) {
      return '';
    }
    const { amf, anypoint, serverType, serverValue, httpAllowCustomBaseUri, renderSelector, domainId, domainType } = this;
    return html`
      <api-server-selector
        class="server-selector"
        .amf="${amf}"
        .selectedShape="${domainId}"
        .selectedShapeType="${domainType}"
        .value="${serverValue}"
        .type="${serverType}"
        ?hidden="${!renderSelector}"
        ?allowCustom="${httpAllowCustomBaseUri}"
        ?compatibility="${anypoint}"
        autoSelect
        @serverscountchanged="${this[serversCountHandler]}"
        @apiserverchanged="${this[serverChangeHandler]}"
      >
        <slot name="custom-base-uri" slot="custom-base-uri"></slot>
      </api-server-selector>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the server selector.
   */
  [modelTemplate]() {
    switch (this[renderedViewValue]) {
      case 'summary': return this[summaryTemplate]();
      case 'security': return this[securityTemplate]();
      case 'documentation': return this[documentationTemplate]();
      case 'type': return this[schemaTemplate]();
      case 'endpoint':
      case 'method':
        return this[resourceTemplate]();
      default: return '';
    }
  }

  /**
   * @returns {TemplateResult|string} The template for the API summary page.
   */
  [summaryTemplate]() {
    const { baseUri, anypoint } = this;
    const model = this[renderedModelValue];
    return html`
    <api-summary .amf="${model}" .baseUri="${baseUri}" .anypoint="${anypoint}"></api-summary>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the API security definition page.
   */
  [securityTemplate]() {
    const { amf, anypoint } = this;
    const model = this[renderedModelValue];
    return html`<api-security-document
      .amf="${amf}"
      .domainModel="${model}"
      .anypoint="${anypoint}"></api-security-document>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the RAML's documentation page.
   */
  [documentationTemplate]() {
    const { amf, anypoint } = this;
    const model = this[renderedModelValue];
    return html`<api-documentation-document
      .amf="${amf}"
      .domainModel="${model}"
      .anypoint="${anypoint}"></api-documentation-document>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the API schema page.
   */
  [schemaTemplate]() {
    const { amf, anypoint } = this;
    const model = this[renderedModelValue];
    // @todo: render media type selector.
    // const { accepts } = this[apiSummaryValue]
    return html`
    <api-schema-document
      .amf="${amf}"
      .domainModel="${model}"
      .anypoint="${anypoint}"
    ></api-schema-document>`;
  }

  /**
   * @returns {TemplateResult|string} The template for the API endpoint page.
   */
  [resourceTemplate]() {
    const { amf, domainId, operationId } = this;
    const model = this[renderedModelValue];
    return html`<api-resource-document
      .amf="${amf}"
      .domainId="${domainId}"
      .operationId="${operationId}"
      .domainModel="${model}"
      .redirectUri="${this.redirectUri}"
      .serverType="${this.serverType}"
      .serverValue="${this.serverValue}"
      .baseUri="${this.apiBaseUri}"
      ?tryItButton="${this.tryItButton}"
      ?tryItPanel="${this.tryItPanel}"
      ?anypoint="${this.anypoint}"
      ?httpUrlEditor="${this.httpUrlEditor}"
      httpNoServerSelector
    ></api-resource-document>`;
  }
}

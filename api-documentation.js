import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
import {AmfHelperMixin, ns} from '../../@api-components/amf-helper-mixin/amf-helper-mixin.js';
import {afterNextRender} from '../../@polymer/polymer/lib/utils/render-status.js';
import '../../@polymer/polymer/lib/elements/dom-if.js';
import '../../@api-components/raml-aware/raml-aware.js';
import '../../@api-components/api-endpoint-documentation/api-endpoint-documentation.js';
import '../../@api-components/api-type-documentation/api-type-documentation.js';
import '../../@api-components/api-documentation-document/api-documentation-document.js';
import '../../@api-components/api-method-documentation/api-method-documentation.js';
import '../../@api-components/api-summary/api-summary.js';
import '../../@api-components/api-security-documentation/api-security-documentation.js';
/* eslint-disable max-len */
/**
 * `api-documentation`
 *
 * A main documentation view for AMF model.
 *
 * This element works with [AMF](https://github.com/mulesoft/amf) data model.
 *
 * It works well with `api-navigation` component. When `handle-navigation-events`
 * is set it listens for selection events dispatched by the navigation.
 *
 * To manually steare the behavior of the component you have to set both:
 * - selected
 * - selectedType
 *
 * Selected is an `@id` of the AMF data model in json/ld representation.
 * Selected type tells the component where to look for the data and which
 * view to render.
 *
 * The component handles data computation on selection change.
 *
 * ## Updating API's base URI
 *
 * By default the component render the documentation as it is defined
 * in the AMF model. Sometimes, however, you may need to replace the base URI
 * of the API with something else. It is useful when the API does not
 * have base URI property defined (therefore this component render relative
 * paths instead of URIs) or when you want to manage different environments.
 *
 * To update base URI value either update `baseUri` property or use
 * `iron-meta` with key `ApiBaseUri`. First method is easier but the second
 * gives much more flexibility since it use a
 * [monostate pattern](http://wiki.c2.com/?MonostatePattern)
 * to manage base URI property.
 *
 * When the component constructs the funal URI for the endpoint it does the following:
 * - if `baseUri` is set it uses this value as a base uri for the endpoint
 * - else if `iron-meta` with key `ApiBaseUri` exists and contains a value
 * it uses it uses this value as a base uri for the endpoint
 * - else if `amfModel` is set then it computes base uri value from main
 * model document
 * Then it concatenates computed base URI with `endpoint`'s path property.
 *
 * ### Example
 *
 * ```html
 * <iron-meta key="ApiBaseUri" value="https://domain.com"></iron-meta>
 * ```
 *
 * To update value of the `iron-meta`:
 * ```javascript
 * new Polymer.IronMeta({key: 'ApiBaseUri'}).value = 'https://other.domain';
 * ```
 *
 * Note: The element will not be notified about the change when `iron-meta` value change.
 * The change will be reflected when `amfModel` or `endpoint` property chnage.
 *
 * ## Styling
 *
 * `<api-documentation>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--api-documentation` | Mixin applied to this elment | `{}`
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof ApiElements
 * @appliesMixin AmfHelperMixin
 */
class ApiDocumentation extends AmfHelperMixin(PolymerElement) {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      @apply --api-documentation;
    }
    </style>
    <template is="dom-if" if="[[aware]]">
      <raml-aware raml="{{amfModel}}" scope="[[aware]]"></raml-aware>
    </template>
    <template is="dom-if" if="[[isSummary]]" restamp="true">
      <api-summary amf-model="[[docsModel]]" base-uri="[[baseUri]]"></api-summary>
    </template>
    <template is="dom-if" if="[[isSecurity]]" restamp="true">
      <api-security-documentation amf-model="{{amfModel}}" security="[[docsModel]]" narrow="[[narrow]]"></api-security-documentation>
    </template>
    <template is="dom-if" if="[[_renderInlineEndpoint(inlineMethods, isMethod, isEndpoint)]]" restamp="true">
      <api-endpoint-documentation amf-model="{{amfModel}}" endpoint="[[docsModel]]" previous="[[_computeEndpointPrevious(amfModel, selected)]]" next="[[_computeEndpointNext(amfModel, selected)]]" base-uri="[[baseUri]]" narrow="[[narrow]]" selected="[[selected]]" no-try-it="" inline-methods="" scroll-target="[[scrollTarget]]" redirect-uri="[[redirectUri]]"></api-endpoint-documentation>
    </template>
    <template is="dom-if" if="[[_renderEndpoint(inlineMethods, isEndpoint)]]" restamp="true">
      <api-endpoint-documentation amf-model="{{amfModel}}" endpoint="[[docsModel]]" previous="[[_computeEndpointPrevious(amfModel, selected)]]" next="[[_computeEndpointNext(amfModel, selected)]]" base-uri="[[baseUri]]" narrow="[[narrow]]" scroll-target="[[scrollTarget]]" redirect-uri="[[redirectUri]]"></api-endpoint-documentation>
    </template>
    <template is="dom-if" if="[[_renderMethod(inlineMethods, isMethod)]]" restamp="true">
      <api-method-documentation amf-model="{{amfModel}}" endpoint="[[endpoint]]" method="[[docsModel]]" previous="[[_computeMethodPrevious(amfModel, selected)]]" next="[[_computeMethodNext(amfModel, selected)]]" base-uri="[[baseUri]]" no-try-it="[[noTryIt]]" narrow="[[narrow]]" render-security="" render-code-snippets=""></api-method-documentation>
    </template>
    <template is="dom-if" if="[[isDoc]]" restamp="true">
      <api-documentation-document amf-model="{{amfModel}}" api-document="[[docsModel]]"></api-documentation-document>
    </template>
    <template is="dom-if" if="[[isType]]" restamp="true">
      <api-type-documentation amf-model="{{amfModel}}" type="[[docsModel]]" narrow="[[narrow]]"></api-type-documentation>
    </template>`;
  }

  static get properties() {
    return {
      /**
       * `raml-aware` scope property to use.
       */
      aware: String,
      /**
       * A model's `@id` of selected documentation part.
       * Special case is for `summary` view. It's not part of an API
       * but most applications has some kind of summary view for the
       * API.
       */
      selected: String,
      /**
       * Type of the selected item.
       * One of `documentation`, `type`, `security`, `endpoint`, `method`
       * or `summary`.
       */
      selectedType: String,
      /**
       * By default application hosting the element must set `selected` and
       * `selectedType` properties. When using `api-navigation` element
       * by setting this property the element listens for navigation events
       * and updates the state
       */
      handleNavigationEvents: {
        type: Boolean,
        observer: '_handleNavChanged'
      },
      // True if currently selection is endpoint
      isEndpoint: {
        type: Boolean,
        readOnly: true
      },
      // True if currently selection is method
      isMethod: {
        type: Boolean,
        readOnly: true
      },
      // True if currently selection is documentation
      isDoc: {
        type: Boolean,
        readOnly: true
      },
      // True if currently selection is type
      isType: {
        type: Boolean,
        readOnly: true
      },
      // True if currently selection is security
      isSecurity: {
        type: Boolean,
        readOnly: true
      },
      // True if currently selection is summary
      isSummary: {
        type: Boolean,
        readOnly: true
      },
      /**
       * Computed value of the final model extracted from `amfModel`, `selected`,
       * and `selectedType` properties.
       * @type {Object}
       */
      docsModel: {type: Object, readOnly: true},
      /**
       * Computed value of currently rendered endpoint.
       */
      endpoint: {type: Object, readOnly: true},
      /**
       * A property to set to override AMF's model base URI information.
       */
      baseUri: String,
      /**
       * Passing value of `noTryIt` to the method documentation.
       * Hiddes "Try it" button.
       */
      noTryIt: Boolean,
      /**
       * If set it will renders the view in the narrow layout.
       */
      narrow: Boolean,
      /**
       * If set then it renders methods documentation inline with
       * the endpoint documentation.
       * When it's not set (or value is `false`, default) then it renders
       * just a list of methods with links.
       */
      inlineMethods: {type: Boolean, value: false},
      /**
       * Scroll target used to observe `scroll` event.
       * When set the element will observe scroll and inform other components
       * about changes in navigation while scrolling through methods list.
       * The navigation event contains `passive: true` property that
       * determines that it's not user triggered navigation but rather
       * context enforced.
       */
      scrollTarget: Object,
      /**
       * OAuth2 redirect URI.
       * This value **must** be set in order for OAuth 1/2 to work properly.
       * This is only required in inline mode (`inlineMethods`).
       */
      redirectUri: String
    };
  }

  static get observers() {
    return [
      '_apiModelChanged(amfModel, selected, selectedType, inlineMethods)'
    ];
  }

  constructor() {
    super();
    this._navigationHandler = this._navigationHandler.bind(this);
  }

  disconnectedCallback() {
    if (this.__eventsRegistered) {
      this._unregisterNavigationEvents();
    }
  }
  /**
   * Registers `api-navigation-selection-changed` event listener handler
   * on window object.
   */
  _registerNavigationEvents() {
    this.__eventsRegistered = true;
    window.addEventListener('api-navigation-selection-changed', this._navigationHandler);
  }
  /**
   * Removes event listener from window object for
   * `api-navigation-selection-changed` event.
   */
  _unregisterNavigationEvents() {
    this.__eventsRegistered = false;
    window.removeEventListener('api-navigation-selection-changed', this._navigationHandler);
  }
  /**
   * Registers / unregisters event listeners depending on `state`
   *
   * @param {Boolean} state
   */
  _handleNavChanged(state) {
    if (state) {
      this._registerNavigationEvents();
    } else {
      this._unregisterNavigationEvents();
    }
  }
  /**
   * Handler for `api-navigation-selection-changed` event.
   *
   * @param {CustomEvent} e
   */
  _navigationHandler(e) {
    if (e.detail.passive === true) {
      return;
    }
    this.selected = e.detail.selected;
    this.selectedType = e.detail.type;
  }
  /**
   * A function that is called each time `amfModel`, `selected`, or `selectedType`
   * changed. It calls `__processModel()` function in a debouncer (Polymer's
   * `afterNextRender` from RenderStatus class) to ensure all properties are set.
   *
   * Note, this function won't be called when any change inside `amfModel` ocurred
   * as this reacts on complete variable change.
   */
  _apiModelChanged() {
    if (this.__modelChangeDebouncer) {
      return;
    }
    this.__modelChangeDebouncer = true;
    afterNextRender(this, () => {
      this.__modelChangeDebouncer = false;
      this.__processModel(this.amfModel, this.selected, this.selectedType, this.inlineMethods);
    });
  }
  /**
   * Processes AMF model depending on it's type.
   * The documentation panel supports full API model, (some) RAML fragments,
   * and "partial" model returned from the query serice based on graph queries.
   *
   * Note, this function throws an error if unsuported data is passed.
   *
   * @param {Array|Object} model AMF model to process
   * @param {?String} selected Selected AMF node `@id`
   * @param {?String} selectedType Selected view type. One of `endpoint`, `method`,
   * `documentation`, `type`, `security`, or `summary`.
   * @param {?Boolean} inlineMethods Whether the view should render the request panel
   * alongside the documentation.
   */
  __processModel(model, selected, selectedType, inlineMethods) {
    if (!model) {
      return;
    }
    if (model instanceof Array) {
      model = model[0];
    }
    if (this._hasType(model, ns.raml.vocabularies.document + 'Document')) {
      this.__processApiSpecSelection(model, selected, selectedType, inlineMethods);
      return;
    }
    if (this._isLibrary(model)) {
      this.__processLibrarySelection(model, selected, selectedType);
      return;
    }
    if (this._isSecurityFragment(model)) {
      this._processSecurityFragment(model);
      return;
    }
    if (this._isDocumentationFragment(model)) {
      this._processDocumentationFragment(model);
      return;
    }
    if (this._isTypeFragment(model)) {
      this._processTypeFragment(model);
      return;
    }
    if (this._isDocumentationPartialModel(model)) {
      this._processDocumentationParial(model);
      return;
    }
    if (this._isSecurityPartialModel(model)) {
      this._processSecurityParial(model);
      return;
    }
    if (this._isTypePartialModel(model)) {
      this._processTypeParial(model);
      return;
    }
    if (this._isEndpointPartialModel(model)) {
      this._processEndpointParial(model, selected, selectedType, inlineMethods);
      return;
    }
    throw new Error('Unsupported AMF model.');
  }
  /**
   * Sets current component selection to the one specified in `selectedType`.
   * It does not change anything if current selection equals desired selection.
   * @param {String} selectedType Desired selection. One of `endpoint`, `method`,
   * `documentation`, `type`, `security`, or `summary`.
   */
  __resetComponentSelection(selectedType) {
    const isEndpoint = selectedType === 'endpoint';
    if (this.isEndpoint !== isEndpoint) {
      this._setIsEndpoint(isEndpoint);
    }
    const isMethod = selectedType === 'method';
    if (this.isMethod !== isMethod) {
      this._setIsMethod(isMethod);
    }
    const isDoc = selectedType === 'documentation';
    if (this.isDoc !== isDoc) {
      this._setIsDoc(isDoc);
    }
    const isType = selectedType === 'type';
    if (this.isType !== isType) {
      this._setIsType(isType);
    }
    const isSecurity = selectedType === 'security';
    if (this.isSecurity !== isSecurity) {
      this._setIsSecurity(isSecurity);
    }
    const isSummary = selectedType === 'summary';
    if (this.isSummary !== isSummary) {
      this._setIsSummary(isSummary);
    }
  }
  /**
   * Processes selection for the web API data model. It ignores the input if
   * `selected` or `selectedType` is not set.
   * @param {Object} model WebApi AMF model. Do not use an array here.
   * @param {String} selected Currently selected `@id`.
   * @param {String} selectedType Currently selected view type. One of `endpoint`, `method`,
   * `documentation`, `type`, `security`, or `summary`.
   * @param {Boolean} inlineMethods
   */
  __processApiSpecSelection(model, selected, selectedType, inlineMethods) {
    if (!selected || !selectedType) {
      // Not all required properties were set.
      return;
    }
    this.__resetComponentSelection(selectedType);
    let result;
    switch (selectedType) {
      case 'summary': result = model; break;
      case 'security': result = this._computeSecurityApiModel(model, selected); break;
      case 'type': result = this._computeTypeApiModel(model, selected); break;
      case 'documentation': result = this._computeDocsApiModel(model, selected); break;
      case 'endpoint': result = this._computeEndpointApiModel(model, selected); break;
      case 'method':
        if (inlineMethods) {
          result = this._computeEndpointApiMethodModel(model, selected);
        } else {
          result = this._computeMethodApiModel(model, selected);
        }
        break;
      default:
        console.warn('Unknown API selection type. Unable to process.');
        return;
    }
    this._setDocsModel(result);
  }
  /**
   * Computes security scheme definition model from web API and current selection.
   * It looks for the definition in both `declares` and `references` properties.
   * Returned value is already resolved AMF model (references are resolved).
   *
   * @param {Object} model WebApi AMF model. Do not use an array here.
   * @param {String} selected Currently selected `@id`.
   * @return {Object|undefined} Model definition for the securit scheme.
   */
  _computeSecurityApiModel(model, selected) {
    const declares = this._computeDeclares(model);
    let result;
    if (declares) {
      result = declares.find((item) => item['@id'] === selected);
    }
    if (!result) {
      const references = this._computeReferences(model);
      if (references && references.length) {
        for (let i = 0, len = references.length; i < len; i++) {
          if (!this._hasType(references[i], this.ns.raml.vocabularies.document + 'Module')) {
            continue;
          }
          result = this._computeReferenceSecurity(references[i], selected);
          if (result) {
            break;
          }
        }
      }
    } else {
      result = this._resolve(result);
    }
    return result;
  }
  /**
   * Computes type definition model from web API and current selection.
   * It looks for the definition in both `declares` and `references` properties.
   * Returned value is already resolved AMF model (references are resolved).
   *
   * @param {Object} model WebApi AMF model. Do not use an array here.
   * @param {String} selected Currently selected `@id`.
   * @return {Object|undefined} Model definition for a type.
   */
  _computeTypeApiModel(model, selected) {
    const declares = this._computeDeclares(model);
    const references = this._computeReferences(model);
    return this._computeType(declares, references, selected);
  }
  /**
   * Computes documentation definition model from web API and current selection.
   *
   * @param {Object} model WebApi AMF model. Do not use an array here.
   * @param {String} selected Currently selected `@id`.
   * @return {Object|undefined} Model definition for a documentation fragment.
   */
  _computeDocsApiModel(model, selected) {
    const webApi = this._computeWebApi(model);
    return this._computeDocument(webApi, selected);
  }
  /**
   * Computes Endpoint definition model from web API and current selection.
   *
   * @param {Object} model WebApi AMF model. Do not use an array here.
   * @param {String} selected Currently selected `@id`.
   * @return {Object|undefined} Model definition for an endpoint fragment.
   */
  _computeEndpointApiModel(model, selected) {
    const webApi = this._computeWebApi(model);
    return this._computeEndpointModel(webApi, selected);
  }
  /**
   * Computes Method definition model from web API and current selection.
   *
   * @param {Object} model WebApi AMF model. Do not use an array here.
   * @param {String} selected Currently selected `@id`.
   * @return {Object|undefined} Model definition for an endpoint fragment.
   */
  _computeMethodApiModel(model, selected) {
    const webApi = this._computeWebApi(model);
    return this._computeMethodModel(webApi, selected);
  }

  _computeEndpointApiMethodModel(model, selected) {
    const webApi = this._computeWebApi(model);
    return this._computeMethodEndpoint(webApi, selected);
  }
  /**
   * Processes selection for a library data model. It ignores the input if
   * `selected` or `selectedType` is not set.
   * @param {Object} model Library AMF model. Do not use an array here.
   * @param {String} selected Currently selected `@id`.
   * @param {String} selectedType Currently selected view type. One of `type` and `security`.
   * Other values, even though it may exists in the library, is not currently supported.
   */
  __processLibrarySelection(model, selected, selectedType) {
    if (!selected || !selectedType) {
      // Not all required properties were set.
      return;
    }
    this.__resetComponentSelection(selectedType);
    let result;
    switch (selectedType) {
      case 'security': result = this._computeSecurityLibraryModel(model, selected); break;
      case 'type': result = this._computeTypeLibraryModel(model, selected); break;
      default:
        console.warn('Unknown Library selection type. Unable to process.');
        return;
    }
    this._setDocsModel(result);
  }
  /**
   * Computes Security scheme from a Library model.
   * @param {Object} model Library AMF model.
   * @param {String} selected Currently selected `@id`.
   * @return {Object|undefined} Model definition for a security.
   */
  _computeSecurityLibraryModel(model, selected) {
    return this._computeDeclById(model, selected);
  }
  /**
   * Computes Type definition from a Library model.
   * @param {Object} model Library AMF model.
   * @param {String} selected Currently selected `@id`.
   * @return {Object|undefined} Model definition for a type.
   */
  _computeTypeLibraryModel(model, selected) {
    return this._computeDeclById(model, selected);
  }
  /**
   * Extracts security model from security scheme fragment and sets current selection
   * and the model.
   * @param {Object} model Security scheme fragment model
   */
  _processSecurityFragment(model) {
    this.__processFragment(model, 'security');
  }
  /**
   * Extracts documentation model from documentation fragment and sets current selection
   * and the model.
   * @param {Object} model Documentation fragment model
   */
  _processDocumentationFragment(model) {
    this.__processFragment(model, 'documentation');
  }
  /**
   * Extracts Type model from Type fragment and sets current selection
   * and the model.
   * @param {Object} model Type fragment model
   */
  _processTypeFragment(model) {
    this.__processFragment(model, 'type');
  }
  /**
   * Processes fragment model and sets current selection and the model.
   * @param {Object} model RAML fragment model
   * @param {String} selectedType Currently selected type.
   */
  __processFragment(model, selectedType) {
    const result = this._computeEncodes(model);
    this._setDocsModel(result);
    this.__resetComponentSelection(selectedType);
  }

  _processDocumentationParial(model) {
    this._setDocsModel(model);
    this.__resetComponentSelection('documentation');
  }

  _processSecurityParial(model) {
    this._setDocsModel(model);
    this.__resetComponentSelection('security');
  }

  _processTypeParial(model) {
    this._setDocsModel(model);
    this.__resetComponentSelection('type');
  }
  /**
   * Processes endpoint data from partial model definitnion.
   * It sets models that are used by the docs.
   *
   * If `selected` or `selectedType` is not set then it automatically selects
   * an endpoint.
   * @param {Object} model Partial model for endpoints
   * @param {?String} selected Current selection.
   * @param {?string} selectedType Selection type.
   * @param {Boolean} inlineMethods
   */
  _processEndpointParial(model, selected, selectedType, inlineMethods) {
    if (!selectedType || inlineMethods) {
      selectedType = 'endpoint';
    }
    this._setEndpoint(model);
    if (!inlineMethods && selectedType === 'method') {
      model = this._computeMethodPartialEndpoint(model, selected);
    }
    this._setDocsModel(model);
    this.__resetComponentSelection(selectedType);
  }
  /**
   * Creates a link model that is accepted by the endpoint documentation
   * view.
   * @param {?Object} item An AMF shape to use to get the data from.
   * @return {Object|undefined} Object with `label` and `id` or `undefined`
   * if no item.
   */
  _computeEndpointLink(item) {
    if (!item) {
      return;
    }
    let name = this._getValue(item, this.ns.schema.schemaName);
    if (!name) {
      name = this._getValue(item, this.ns.raml.vocabularies.http + 'path');
    }
    return {
      id: item['@id'],
      label: name
    };
  }
  /**
   * Computes link model for previous endpoint, if any exists relative to
   * current selection.
   * @param {Object} model Web API AMF model
   * @param {String} selected Currently selected endpoint
   * @return {Object|undefined} Object with `label` and `id` or `undefined`
   * if no previous item.
   */
  _computeEndpointPrevious(model, selected) {
    if (!model || !selected) {
      return;
    }
    if (this._hasType(model, ns.raml.vocabularies.http + 'EndPoint')) {
      return;
    }
    const webApi = this._computeWebApi(model);
    const ekey = this._getAmfKey(this.ns.raml.vocabularies.http + 'endpoint');
    const endpoints = this._ensureArray(webApi[ekey]);
    if (!endpoints) {
      return;
    }
    for (let i = 0; i < endpoints.length; i++) {
      if (endpoints[i]['@id'] === selected) {
        return this._computeEndpointLink(endpoints[i - 1]);
      }
    }
  }
  /**
   * Computes link model for next endpoint, if any exists relative to
   * current selection.
   * @param {Object} model WebApi shape object of AMF
   * @param {String} selected Currently selected endpoint
   * @return {Object|undefined} Object with `label` and `id` or `undefined`
   * if no next item.
   */
  _computeEndpointNext(model, selected) {
    if (!model || !selected) {
      return;
    }
    if (this._hasType(model, ns.raml.vocabularies.http + 'EndPoint')) {
      return;
    }
    const webApi = this._computeWebApi(model);
    const ekey = this._getAmfKey(ns.raml.vocabularies.http + 'endpoint');
    const endpoints = this._ensureArray(webApi[ekey]);
    if (!endpoints) {
      return;
    }
    for (let i = 0; i < endpoints.length; i++) {
      if (endpoints[i]['@id'] === selected) {
        return this._computeEndpointLink(endpoints[i + 1]);
      }
    }
  }
  /**
   * Creates a link model that is accepted by the method documentation
   * view.
   * @param {?Object} item An AMF shape to use to get the data from.
   * @return {Object|undefined} Object with `label` and `id` or `undefined`
   * if no item.
   */
  _computeMethodLink(item) {
    if (!item) {
      return;
    }
    let name = this._getValue(item, this.ns.schema.schemaName);
    if (!name) {
      name = this._getValue(item, this.ns.w3.hydra.core + 'method');
    }
    return {
      id: item['@id'],
      label: name
    };
  }
  /**
   * Computes link for the previous method.
   * This is used by the method documentation panel to render previous
   * nethod link.
   * @param {Object} model WebApi shape object of AMF
   * @param {String} selected Currently selected method
   * @return {Object|undefined} Object with `label` and `id` or `undefined`
   * if no previous item.
   */
  _computeMethodPrevious(model, selected) {
    let methods;
    if (this._hasType(model, ns.raml.vocabularies.http + 'EndPoint')) {
      const key = this._getAmfKey(ns.w3.hydra.supportedOperation);
      methods = this._ensureArray(model[key]);
    } else {
      const webApi = this._computeWebApi(model);
      methods = this.__computeMethodsListForMethod(webApi, selected);
    }
    if (!methods) {
      return;
    }
    for (let i = 0; i < methods.length; i++) {
      if (methods[i]['@id'] === selected) {
        return this._computeMethodLink(methods[i - 1]);
      }
    }
  }
  /**
   * Computes link for the next method.
   * This is used by the method documentation panel to render next
   * nethod link.
   * @param {Object} model WebApi shape object of AMF
   * @param {String} selected Currently selected method
   * @return {Object|undefined} Object with `label` and `id` or `undefined`
   * if no next item.
   */
  _computeMethodNext(model, selected) {
    let methods;
    if (this._hasType(model, ns.raml.vocabularies.http + 'EndPoint')) {
      const key = this._getAmfKey(ns.w3.hydra.supportedOperation);
      methods = this._ensureArray(model[key]);
    } else {
      const webApi = this._computeWebApi(model);
      methods = this.__computeMethodsListForMethod(webApi, selected);
    }
    if (!methods) {
      return;
    }
    for (let i = 0; i < methods.length; i++) {
      if (methods[i]['@id'] === selected) {
        return this._computeMethodLink(methods[i + 1]);
      }
    }
  }
  /**
   * Computes method definition from an endpoint partial model.
   * @param {Object} api Endpoint partial model
   * @param {String} selected Currently selected ID.
   * @return {Object|undefined} Method model.
   */
  _computeMethodPartialEndpoint(api, selected) {
    const opKey = this._getAmfKey(ns.w3.hydra.supportedOperation);
    const ops = this._ensureArray(api[opKey]);
    if (!ops) {
      return;
    }
    for (let i = 0, len = ops.length; i < len; i++) {
      const op = ops[i];
      if (op['@id'] === selected) {
        return op;
      }
    }
  }
  /**
   * Tests if endpoint component should be rendered for both method and
   * endpoint documentation in inline mode.
   * @param {Boolean} inlineMethods
   * @param {Boolean} isMethod
   * @param {Boolean} isEndpoint
   * @return {Boolean}
   */
  _renderInlineEndpoint(inlineMethods, isMethod, isEndpoint) {
    if (!inlineMethods) {
      return false;
    }
    return !!(isMethod || isEndpoint);
  }
  /**
   * Computes if single endpoint doc should be rendered
   * @param {Boolean} inlineMethods
   * @param {Boolean} isEndpoint
   * @return {Boolean}
   */
  _renderEndpoint(inlineMethods, isEndpoint) {
    return !!(!inlineMethods && isEndpoint);
  }
  /**
   * Computes if single method doc should be rendered
   * @param {Boolean} inlineMethods
   * @param {Boolean} isMethod
   * @return {Boolean}
   */
  _renderMethod(inlineMethods, isMethod) {
    return !!(!inlineMethods && isMethod);
  }
  /**
   * Tests if `model` is of a RAML library model.
   * @param {Object|Array} model A shape to test
   * @return {Boolean}
   */
  _isLibrary(model) {
    if (!model) {
      return false;
    }
    if (model instanceof Array) {
      model = model[0];
    }
    const moduleKey = this._getAmfKey(this.ns.raml.vocabularies.document + 'Module');
    return moduleKey === model['@type'][0];
  }
  /**
   * Computes a security model from a reference (library for example).
   * @param {Object|Array} reference AMF model for a reference to extract the data from
   * @param {String} selected Node ID to look for
   * @return {Object|undefined} Type definition or undefined if not found.
   */
  _computeReferenceSecurity(reference, selected) {
    const declare = this._computeDeclares(reference);
    if (!declare) {
      return;
    }
    let result = declare.find((item) => {
      if (item instanceof Array) {
        item = item[0];
      }
      return item['@id'] === selected;
    });
    if (result instanceof Array) {
      result = result[0];
    }
    return this._resolve(result);
  }
  /**
   * Computes model of a shape defined ni `declares` list
   * @param {Object} model AMF model
   * @param {String} selected Current selection
   * @return {Object|undefined}
   */
  _computeDeclById(model, selected) {
    const declares = this._computeDeclares(model);
    if (!declares) {
      return;
    }
    return declares.find((item) => item['@id'] === selected);
  }

  _isTypeFragment(model) {
    if (model instanceof Array) {
      model = model[0];
    }
    return this._hasType(model, ns.raml.vocabularies.document + 'DataType');
  }

  _isTypePartialModel(model) {
    if (model instanceof Array) {
      model = model[0];
    }
    return this._hasType(model, ns.raml.vocabularies.document + 'DomainElement');
  }

  _isSecurityFragment(model) {
    if (model instanceof Array) {
      model = model[0];
    }
    return this._hasType(model, ns.raml.vocabularies.document + 'SecuritySchemeFragment');
  }

  _isSecurityPartialModel(model) {
    if (model instanceof Array) {
      model = model[0];
    }
    return this._hasType(model, ns.raml.vocabularies.security + 'SecurityScheme');
  }

  _isDocumentationFragment(model) {
    if (model instanceof Array) {
      model = model[0];
    }
    return this._hasType(model, ns.raml.vocabularies.document + 'UserDocumentation');
  }

  _isDocumentationPartialModel(model) {
    if (model instanceof Array) {
      model = model[0];
    }
    return this._hasType(model, ns.schema.creativeWork);
  }

  _isEndpointPartialModel(model) {
    if (model instanceof Array) {
      model = model[0];
    }
    return this._hasType(model, ns.raml.vocabularies.http + 'EndPoint');
  }
}
window.customElements.define('api-documentation', ApiDocumentation);

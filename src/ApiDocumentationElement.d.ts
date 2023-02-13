/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { html, css, LitElement, CSSResult, TemplateResult } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin';

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
 * To manually steere the behavior of the component you have to set both:
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
 * When the component constructs the final URI for the endpoint it does the following:
 * - if `baseUri` is set it uses this value as a base uri for the endpoint
 * - else if `iron-meta` with key `ApiBaseUri` exists and contains a value
 * it uses it uses this value as a base uri for the endpoint
 * - else if `amf` is set then it computes base uri value from main
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
 * The change will be reflected when `amf` or `endpoint` property change.
 */
export class ApiDocumentationElement extends EventsTargetMixin(AmfHelperMixin(LitElement)) {
  get styles(): CSSResult;

  /**
   * A model's `@id` of selected documentation part.
   * Special case is for `summary` view. It's not part of an API
   * but most applications has some kind of summary view for the
   * API.
   * @attribute
   */
  selected: string;
  /**
   * Type of the selected item.
   * One of `documentation`, `type`, `security`, `endpoint`, `method`
   * or `summary`.
   * @attribute
   */
  selectedType: string;
  /**
   * By default application hosting the element must set `selected` and
   * `selectedType` properties. When using `api-navigation` element
   * by setting this property the element listens for navigation events
   * and updates the state
   * @attribute
   */
  handleNavigationEvents: boolean;
  /**
   * A property to set to override AMF's model base URI information.
   * @attribute
   */
  baseUri: string;
  /**
   * Passing value of `noTryIt` to the method documentation.
   * Hides "Try it" button.
   * @attribute
   */
  noTryIt: boolean;
  /**
   * If set it will renders the view in the narrow layout.
   * @attribute
   */
  narrow: boolean;
  /**
   * If set then it renders methods documentation inline with
   * the endpoint documentation.
   * When it's not set (or value is `false`, default) then it renders
   * just a list of methods with links.
   * @attribute
   */
  inlineMethods: boolean;
  /**
   * Scroll target used to observe `scroll` event.
   * When set the element will observe scroll and inform other components
   * about changes in navigation while scrolling through methods list.
   * The navigation event contains `passive: true` property that
   * determines that it's not user triggered navigation but rather
   * context enforced.
   */
  scrollTarget: Window|HTMLElement;
  /**
   * OAuth2 redirect URI.
   * This value **must** be set in order for OAuth 1/2 to work properly.
   * This is only required in inline mode (`inlineMethods`).
   * @attribute
   */
  redirectUri: string;
  /**
   * Enables compatibility with Anypoint components.
   * @attribute
   */
  compatibility: boolean;
  /**
   * When enabled it renders external types as links and dispatches
   * `api-navigation-selection-changed` when clicked.
   *
   * This property is experimental.
   * @attribute
   */
  graph: boolean;
  /**
   * Applied outlined theme to the try it panel
   * @attribute
   */
  outlined: boolean;
  /**
   * In inline mode, passes the `noUrlEditor` value on the
   * `api-request-panel`
   * @attribute
   */
  noUrlEditor: boolean;

  // Currently rendered view type
  _viewType: string;
  /**
   * Computed value of the final model extracted from the `amf`, `selected`,
   * and `selectedType` properties.
   */
  _docsModel: any;
  /**
   * Computed value of currently rendered endpoint.
   */
  _endpoint: any;
  /**
   * When set it hides bottom navigation links
   * @attribute
   */
  noBottomNavigation: boolean;
  /**
   * Hide OAS 3.0 server selector
   * @attribute
   */
  noServerSelector: boolean;
  /**
   * If true, the server selector custom base URI option is rendered
   * @attribute
   */
  allowCustomBaseUri: boolean;
  /**
   * The URI of the server currently selected in the server selector
   * @attribute
   */
  serverValue: string;
  /**
   * The type of the server currently selected in the server selector
   * @attribute
   */
  serverType: string;

  /**
   * If this value is set, then the documentation component will pass it down
   * to the `api-summary` component to sort the list of endpoints based
   * on the `path` value of the endpoint, keeping the order
   * of which endpoint was first in the list, relative to each other
   */
  rearrangeEndpoints: boolean;

  get showsSelector(): boolean;

  get effectiveBaseUri(): string;

  constructor();

  disconnectedCallback(): void;

  __amfChanged(): void;

  _processModelChange(): void;

  /**
   * Registers `api-navigation-selection-changed` event listener handler
   * on window object.
   */
  _registerNavigationEvents(): void;

  /**
   * Removes event listener from window object for
   * `api-navigation-selection-changed` event.
   */
  _unregisterNavigationEvents(): void;

  /**
   * Registers / unregisters event listeners depending on `state`
   */
  _handleNavChanged(state: boolean): void;

  get server(): any;

  /**
   * Handler for `api-navigation-selection-changed` event.
   */
  _navigationHandler(e: CustomEvent): void;

  _handleServersCountChange(e: CustomEvent): void;

  _getServerUri(server: any): string|undefined;

  _handleServerChange(e: CustomEvent): void;

  /**
   * Processes selection for the web API data model. It ignores the input if
   * `selected` or `selectedType` is not set.
   * @param model WebApi AMF model. Do not use an array here.
   */
  __processApiSpecSelection(model: any): void;

  /**
   * Computes security scheme definition model from web API and current selection.
   * It looks for the definition in both `declares` and `references` properties.
   * Returned value is already resolved AMF model (references are resolved).
   *
   * @param model WebApi AMF model. Do not use an array here.
   * @param selected Currently selected `@id`.
   * @returns Model definition for the security scheme.
   */
  _computeSecurityApiModel(model: any, selected: string): any|undefined;

  /**
   * Computes type definition model from web API and current selection.
   * It looks for the definition in both `declares` and `references` properties.
   * Returned value is already resolved AMF model (references are resolved).
   *
   * @param model WebApi AMF model. Do not use an array here.
   * @param selected Currently selected `@id`.
   * @returns Model definition for a type.
   */
  _computeTypeApiModel(model: any, selected: string): any|undefined;

  /**
   * Computes documentation definition model from web API and current selection.
   *
   * @param model WebApi AMF model. Do not use an array here.
   * @param selected Currently selected `@id`.
   * @returns Model definition for a documentation fragment.
   */
  _computeDocsApiModel(model: any, selected: string): any|undefined;

  /**
   * Computes Endpoint definition model from web API and current selection.
   *
   * @param model WebApi AMF model. Do not use an array here.
   * @param selected Currently selected `@id`.
   * @returns Model definition for an endpoint fragment.
   */
  _computeEndpointApiModel(model: any, selected: string): any|undefined;

  /**
   * Computes Method definition model from web API and current selection.
   *
   * @param model WebApi AMF model. Do not use an array here.
   * @param selected Currently selected `@id`.
   * @returns Model definition for an endpoint fragment.
   */
  _computeMethodApiModel(model: any, selected: string): any|undefined;

  _computeEndpointApiMethodModel(model: any, selected: string): any|undefined;

  /**
   * Processes selection for a library data model. It ignores the input if
   * `selected` or `selectedType` is not set.
   * @param model Library AMF model. Do not use an array here.
   */
  __processLibrarySelection(model: any): void;

  /**
   * Computes Security scheme from a Library model.
   * @param model Library AMF model.
   * @param selected Currently selected `@id`.
   * @returns Model definition for a security.
   */
  _computeSecurityLibraryModel(model: any, selected: string): any|undefined;

  /**
   * Computes Type definition from a Library model.
   * @param model Library AMF model.
   * @param selected Currently selected `@id`.
   * @returns Model definition for a type.
   */
  _computeTypeLibraryModel(model: any, selected: string): any|undefined;

  /**
   * Extracts security model from security scheme fragment and sets current selection
   * and the model.
   * @param model Security scheme fragment model
   */
  _processSecurityFragment(model: any): void;

  /**
   * Extracts documentation model from documentation fragment and sets current selection
   * and the model.
   * @param model Documentation fragment model
   */
  _processDocumentationFragment(model: any): void;

  /**
   * Extracts Type model from Type fragment and sets current selection
   * and the model.
   * @param model Type fragment model
   */
  _processTypeFragment(model: any): void;

  /**
   * Processes fragment model and sets current selection and the model.
   * @param model RAML fragment model
   * @param selectedType Currently selected type.
   */
  __processFragment(model: any, selectedType: string): void;

  _processDocumentationPartial(model: any): void;

  _processSecurityPartial(model: any): void;

  _processTypePartial(model: any): void;

  /**
   * Processes endpoint data from partial model definition.
   * It sets models that are used by the docs.
   *
   * If `selected` or `selectedType` is not set then it automatically selects
   * an endpoint.
   * @param model Partial model for endpoints
   */
  _processEndpointPartial(model: any): void;

  /**
   * Creates a link model that is accepted by the endpoint documentation
   * view.
   * @param item An AMF shape to use to get the data from.
   * @returns Object with `label` and `id` or `undefined`
   * if no item.
   */
  _computeEndpointLink(item: any): any|undefined;

  /**
   * Computes link model for previous endpoint, if any exists relative to
   * current selection.
   * @param model Web API AMF model
   * @param selected Currently selected endpoint
   * @param lookupMethods When set it looks for the ID in methods array.
   * @returns Object with `label` and `id` or `undefined` if no previous item.
   */
  _computeEndpointPrevious(model: any, selected: string, lookupMethods?: boolean): any|undefined;

  /**
   * Computes link model for next endpoint, if any exists relative to
   * current selection.
   * @param model WebApi shape object of AMF
   * @param selected Currently selected endpoint
   * @param lookupMethods When set it looks for the ID in methods array.
   * @returns Object with `label` and `id` or `undefined` if no next item.
   */
  _computeEndpointNext(model: any, selected: string, lookupMethods?: boolean): any|undefined;

  /**
   * Creates a link model that is accepted by the method documentation
   * view.
   * @param item An AMF shape to use to get the data from.
   * @returns Object with `label` and `id` or `undefined` if no item.
   */
  _computeMethodLink(item: any): any|undefined;

  /**
   * Computes link for the previous method.
   * This is used by the method documentation panel to render previous
   * method link.
   * @param model WebApi shape object of AMF
   * @param selected Currently selected method
   * @returns Object with `label` and `id` or `undefined`
   * if no previous item.
   */
  _computeMethodPrevious(model: any, selected: string): any|undefined;

  /**
   * Computes link for the next method.
   * This is used by the method documentation panel to render next
   * method link.
   * @param model WebApi shape object of AMF
   * @param selected Currently selected method
   * @returns Object with `label` and `id` or `undefined`
   * if no next item.
   */
  _computeMethodNext(model: any, selected: string): any|undefined;

  /**
   * Computes method definition from an endpoint partial model.
   * @param api Endpoint partial model
   * @param selected Currently selected ID.
   * @returns Method model.
   */
  _computeMethodPartialEndpoint(api: any, selected: string): any|undefined;

  /**
   * Tests if `model` is of a RAML library model.
   * @param model A shape to test
   */
  _isLibrary(model: any): boolean;

  /**
   * Computes a security model from a reference (library for example).
   * @param reference AMF model for a reference to extract the data from
   * @param selected Node ID to look for
   * @returns Type definition or undefined if not found.
   */
  _computeReferenceSecurity(reference: any|any[], selected: string): any|undefined;

  /**
   * Computes model of a shape defined ni `declares` list
   * @param model AMF model
   * @param selected Current selection
   */
  _computeDeclById(model: any, selected: string): any|undefined;

  /**
   * Computes model of a shape defined in `references` list
   * @param model AMF model
   * @param selected Current selection
   */
  _computeRefById(model, selected): any|undefined;

  _isTypeFragment(model: any): boolean;

  _isTypePartialModel(model: any): boolean;

  _isSecurityFragment(model: any): boolean;

  _isSecurityPartialModel(model: any): boolean;

  _isDocumentationFragment(model: any): boolean;

  _isDocumentationPartialModel(model: any): boolean;

  _isEndpointPartialModel(model: any): boolean;

  /**
   * Computes API's media types when requesting type documentation view.
   * This is passed to the type documentation to render examples in the type
   * according to API's defined media type.
   *
   * @param model API model.
   * @returns List of supported media types or undefined.
   */
  _computeApiMediaTypes(model: any): string[]|undefined;

  render(): TemplateResult;

  _renderServerSelector(): TemplateResult|string;

  _renderView(): TemplateResult|string;

  _summaryTemplate(): TemplateResult;

  _securityTemplate(): TemplateResult;

  _documentationTemplate(): TemplateResult;

  _typeTemplate(): TemplateResult;

  _methodTemplate(): TemplateResult;

  _endpointTemplate(): TemplateResult;

  _inlineEndpointTemplate(): TemplateResult;

  _simpleEndpointTemplate(): TemplateResult;
}

/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { LitElement, html } from 'lit-element';
import { AmfHelperMixin, AmfSerializer, ns } from '@api-components/amf-helper-mixin';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import elementStyles from './styles/ApiAnnotation.js';

/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */
/** @typedef {import('@api-components/amf-helper-mixin').ApiDomainProperty} ApiDomainProperty */
/** @typedef {import('@api-components/amf-helper-mixin').ApiCustomDomainProperty} ApiCustomDomainProperty */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-components/amf-helper-mixin').ApiObjectNode} ApiObjectNode */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const shapeValue = Symbol('shapeValue');
export const processShape = Symbol('processShape');
export const propertiesValue = Symbol('propertiesValue');
export const propertyTemplate = Symbol('propertyTemplate');
export const processVisibility = Symbol('processVisibility');
export const scalarTemplate = Symbol('scalarTemplate');
export const objectTemplate = Symbol('objectTemplate');
export const annotationWrapperTemplate = Symbol('annotationWrapperTemplate');
export const scalarValue = Symbol('scalarValue');
export const objectScalarPropertyTemplate = Symbol('objectScalarPropertyTemplate');

/**
 * An element to render annotations (also known as custom properties)
 * from AMF model.
 *
 * Annotations are part of RAML language and API console supports it.
 * The element looks for annotations in model and renders them.
 */
export default class ApiAnnotationDocumentElement extends AmfHelperMixin(LitElement) {
  get styles() {
    return elementStyles;
  }

  /**
   * @returns {DomainElement|undefined}
   */
  get shape() {
    return this[shapeValue];
  }

  /**
   * @param {DomainElement} value
   */
  set shape(value) {
    const oldValue = this[shapeValue];
    if (oldValue === value) {
      return;
    }
    this[shapeValue] = value;
    this[processShape]();
  }

  /**
   * Serialized with `ApiSerializer` API domain model.
   * This is to be used instead of `shape`.
   * @returns {ApiDomainProperty|undefined}
   */
  get domainModel() {
    return this[shapeValue];
  }

  /**
   * @param {ApiDomainProperty} value
   */
  set domainModel(value) {
    const oldValue = this[shapeValue];
    if (oldValue === value) {
      return;
    }
    this[shapeValue] = value;
    this[processShape]();
  }

  /**
   * @returns {boolean} `true` if any custom property has been found.
   */
  get hasCustomProperties() {
    const properties = this[propertiesValue];
    return Array.isArray(properties) && !!properties.length;
  }

  /**
   * @returns {ApiCustomDomainProperty[]|undefined} List of custom properties in the shape.
   */
  get customProperties() {
    return this[propertiesValue];
  }

  /**
   * @param {ApiCustomDomainProperty[]} value
   */
  set customProperties(value) {
    const old = this[propertiesValue];
    if (old === value) {
      return;
    }
    this[propertiesValue] = value;
    this[processVisibility]();
    this.requestUpdate();
  }

  constructor() {
    super();
    /** @type ApiCustomDomainProperty[] */
    this[propertiesValue] = undefined;
  }

  /**
   * Called when the shape property change.
   * Sets `hasCustomProperties` and `customList` properties.
   *
   * Note that for performance reasons, if the element determine that there's
   * no custom properties wit will not clear `customList`.
   * It will be updated only if the value actually change.
   */
  [processShape]() {
    const shape = /** @type DomainElement */ (this[shapeValue]);
    this[propertiesValue] = undefined;
    if (!shape) {
      return;
    }
    const serializer = new AmfSerializer(this.amf);
    const result = serializer.customDomainProperties(shape);
    if (Array.isArray(result) && result.length) {
      this[propertiesValue] = result;
    }
    this[processVisibility]();
    this.requestUpdate();
  }

  [processVisibility]() {
    const { hasCustomProperties } = this;
    if (hasCustomProperties) {
      this.setAttribute('aria-hidden', 'false');
      this.removeAttribute('hidden');
    } else {
      this.setAttribute('aria-hidden', 'true');
      this.setAttribute('hidden', 'true');
    }
  }

  /**
   * @param {ApiScalarNode} scalar
   * @returns {any}
   */
  [scalarValue](scalar) {
    let { value='' } = scalar;
    if (value === 'nil') {
      value = '';
    }
    return value;
  }

  render() {
    const { hasCustomProperties, customProperties } = this;
    if (!hasCustomProperties) {
      return '';
    }
    const content = customProperties.map((property) => this[propertyTemplate](property));
    return html`
    <style>${this.styles}</style>
    ${content}
    `;
  }

  /**
   * @param {ApiCustomDomainProperty} property
   * @returns {TemplateResult|string} The template for the custom property.
   */
  [propertyTemplate](property) {
    const { name, extension } = property;
    const { types } = extension;
    if (types.includes(ns.aml.vocabularies.data.Scalar)) {
      return this[scalarTemplate](name, /** @type ApiScalarNode */ (extension));
    } 
    if (types.includes(ns.aml.vocabularies.data.Object)) {
      return this[objectTemplate](name, /** @type ApiObjectNode */ (extension));
    }
    return '';
  }
  
  /**
   * @param {string} name The annotation name
   * @param {unknown} content The content tp render.
   * @returns {TemplateResult} The template for the custom property.
   */
  [annotationWrapperTemplate](name, content) {
    return html`
    <div class="custom-property">
      <arc-icon class="info-icon" icon="infoOutline"></arc-icon>
      <div class="info-value">
        <span class="name">${name}</span>
        ${content || ''}
      </div>
    </div>
    `;
  }

  /**
   * @param {string} name
   * @param {ApiScalarNode} scalar
   * @returns {TemplateResult} The template for the custom property.
   */
  [scalarTemplate](name, scalar) {
    const content = html`<span class="scalar-value">${this[scalarValue](scalar)}</span>`;
    return this[annotationWrapperTemplate](name, content);
  }

  /**
   * @param {string} name
   * @param {ApiObjectNode} object
   * @returns {TemplateResult} The template for the custom property.
   */
  [objectTemplate](name, object) {
    const { properties={} } = object;
    const content = Object.keys(properties).map((key) => {
      const value = properties[key];
      const { types } = value;
      if (types.includes(ns.aml.vocabularies.data.Scalar)) {
        return this[objectScalarPropertyTemplate](key, value);
      }
      return key;
    });
    return this[annotationWrapperTemplate](name, content);
  }

  /**
   * @param {string} name
   * @param {ApiScalarNode} scalar
   * @returns {TemplateResult} The template for the custom property.
   */
  [objectScalarPropertyTemplate](name, scalar) {
    const value = this[scalarValue](scalar);
    return html`
    <div class="object-property">
      <span class="object-name">${name}</span>
      <span class="object-value">${value}</span>
    </div>
    `;
  }
}

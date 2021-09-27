/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { AmfHelperMixin, AmfSerializer } from '@api-components/amf-helper-mixin';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-collapse/anypoint-collapse.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */
/** @typedef {import('@api-components/amf-helper-mixin').ApiParameter} ApiParameter */

export const sectionToggleClickHandler = Symbol('sectionToggleClickHandler');
export const processDebounce = Symbol('queryDebounce');
export const debounceValue = Symbol('debounceValue');
export const domainIdValue = Symbol('domainIdValue');
export const domainModelValue = Symbol('domainModelValue');
export const serializerValue = Symbol('domainIdValue');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const sectionToggleTemplate = Symbol('sectionToggleTemplate');
export const paramsSectionTemplate = Symbol('paramsSectionTemplate');
export const schemaItemTemplate = Symbol('schemaItemTemplate');

/**
 * A base class for the documentation components with common templates and functions.
 */
export class ApiDocumentationBase extends AmfHelperMixin(LitElement) {
  /** 
   * @returns {string|undefined} The domain id of the object to render.
   */
  get domainId() {
    return this[domainIdValue];
  }

  /** 
   * @returns {string|undefined} The domain id of the object to render.
   */
  set domainId(value) {
    const old = this[domainIdValue];
    if (old === value) {
      return;
    }
    this[domainIdValue] = value;
    this.requestUpdate('domainId', old);
    if (value) {
      this[processDebounce]();
    }
  }

  /** 
   * @returns {DomainElement|undefined} The domain object read from the AMF graph model.
   */
  get domainModel() {
    return this[domainModelValue];
  }

  /** 
   * @returns {DomainElement|undefined} The domain object read from the AMF graph model.
   */
  set domainModel(value) {
    const old = this[domainModelValue];
    if (old === value) {
      return;
    }
    this[domainModelValue] = value;
    this.requestUpdate('domainModel', old);
    if (value) {
      this[processDebounce]();
    }
  }

  static get properties() {
    return {
      /** 
       * The domain id of the object to render.
       */
      domainId: { type: String, reflect: true },
      /** 
       * Enabled compatibility with the Anypoint platform.
       */
      anypoint: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    /** 
     * The timeout after which the `queryGraph()` function is called 
     * in the debouncer.
     */
    this.queryDebouncerTimeout = 2;
    /** @type {boolean} */
    this.anypoint = undefined;
    this[serializerValue] = new AmfSerializer();
  }

  /**
   * @param {AmfDocument} amf 
   */
  __amfChanged(amf) {
    this[serializerValue].amf = amf;
    this[processDebounce]();
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.domainId) {
      this[processDebounce]();
    }
  }

  /**
   * Calls the `queryGraph()` function in a debouncer.
   */
  [processDebounce]() {
    if (this[debounceValue]) {
      clearTimeout(this[debounceValue]);
    }
    this[debounceValue] = setTimeout(() => {
      this[debounceValue] = undefined;
      this.processGraph();
    }, this.queryDebouncerTimeout);
  }

  /**
   * The main function to use to process the AMF model.
   * To be implemented by the child classes.
   */
  processGraph() {
    // ...
  }

  /**
   * A handler for the section toggle button click.
   * @param {Event} e
   */
  [sectionToggleClickHandler](e) {
    const button = /** @type HTMLElement */ (e.currentTarget);
    const { ctrlProperty } = button.dataset;
    if (!ctrlProperty) {
      return;
    }
    this[ctrlProperty] = !this[ctrlProperty];
  }

  /**
   * @param {string} ctrlProperty
   * @return {TemplateResult|string} The template for the section toggle button
   */
  [sectionToggleTemplate](ctrlProperty) {
    const label = this[ctrlProperty] ? 'Hide' : 'Show';
    const classes = {
      'section-toggle': true,
      opened: this[ctrlProperty],
    };
    return html`
    <anypoint-button 
      data-ctrl-property="${ctrlProperty}" 
      class="${classMap(classes)}"
      @click="${this[sectionToggleClickHandler]}"
    >
      ${label} <arc-icon icon="keyboardArrowDown" class="toggle-icon"></arc-icon>
    </anypoint-button>
    `;
  }

  /**
   * @param {string} label The section label.
   * @param {string} openedProperty The name of the element property to be toggled when interacting with the toggle button.
   * @param {TemplateResult|TemplateResult[]} content The content to render.
   * @returns {TemplateResult} The template for a toggle section with a content.
   */
  [paramsSectionTemplate](label, openedProperty, content) {
    const opened = this[openedProperty];
    return html`
    <div class="params-section">
      <div class="params-title">
        <span class="label">${label}</span>
        ${this[sectionToggleTemplate](openedProperty)}
      </div>
      <anypoint-collapse .opened="${opened}">
        ${content}
      </anypoint-collapse>
    </div>
    `;
  }

  /**
   * @param {ApiParameter} model The parameter to render.
   * @return {TemplateResult} The template for the schema item document
   */
  [schemaItemTemplate](model) {
    return html`
    <api-parameter-document .parameter="${model}" class="property-item"></api-parameter-document>
    `;
  }

  /**
   * @param {string=} description The description to render.
   * @returns {TemplateResult|string} The template for the markdown description.
   */
  [descriptionTemplate](description) {
    if (!description) {
      return '';
    }
    return html`
    <div class="api-description">
      <arc-marked 
        .markdown="${description}" 
        sanitize
      >
        <div slot="markdown-html" class="markdown-body"></div>
      </arc-marked>
    </div>`;
  }
}

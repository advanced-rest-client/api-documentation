/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { AmfHelperMixin, AmfSerializer } from '@api-components/amf-helper-mixin';
import { ApiExampleGenerator } from '@api-components/api-schema';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-collapse/anypoint-collapse.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@advanced-rest-client/highlight/arc-marked.js';
import '../../api-annotation-document.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */
/** @typedef {import('@api-components/amf-helper-mixin').ApiParameter} ApiParameter */
/** @typedef {import('@api-components/amf-helper-mixin').ApiCustomDomainProperty} ApiCustomDomainProperty */
/** @typedef {import('@api-components/amf-helper-mixin').ApiExample} ApiExample */
/** @typedef {import('@api-components/api-schema').SchemaExample} SchemaExample */

export const sectionToggleClickHandler = Symbol('sectionToggleClickHandler');
export const processDebounce = Symbol('queryDebounce');
export const debounceValue = Symbol('debounceValue');
export const domainIdValue = Symbol('domainIdValue');
export const domainModelValue = Symbol('domainModelValue');
export const serializerValue = Symbol('domainIdValue');
export const clickHandler = Symbol('clickHandler');
export const descriptionTemplate = Symbol('descriptionTemplate');
export const sectionToggleTemplate = Symbol('sectionToggleTemplate');
export const paramsSectionTemplate = Symbol('paramsSectionTemplate');
export const schemaItemTemplate = Symbol('schemaItemTemplate');
export const customDomainPropertiesTemplate = Symbol('customDomainPropertiesTemplate');
export const examplesTemplate = Symbol('examplesTemplate');
export const exampleTemplate = Symbol('exampleTemplate');
export const examplesValue = Symbol('examplesValue');
export const evaluateExamples = Symbol('evaluateExamples');
export const evaluateExample = Symbol('evaluateExample');

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
    /**
     * @type {SchemaExample[]}
     */
    this[examplesValue] = undefined;
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

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this[debounceValue]) {
      clearTimeout(this[debounceValue]);
      this[debounceValue] = undefined;
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
   * At current state there's no way to tell where to navigate when relative
   * link is clicked. To prevent 404 anchors this prevents any relative link click.
   * @param {Event} e
   */
  [clickHandler](e) {
    const node = /** @type HTMLElement */ (e.target);
    if (node.localName !== 'a') {
      return;
    }
    // target.href is always absolute, need attribute value to test for
    // relative links.
    const href = node.getAttribute('href');
    if (!href) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const ch0 = href[0];
    if (['.', '/'].indexOf(ch0) !== -1) {
      e.preventDefault();
      e.stopPropagation();
    }
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
   * @param {ApiExample[]} examples The list of examples to evaluate
   * @param {string} mediaType The media type to use with examples processing.
   * @returns {SchemaExample[]}
   */
  [evaluateExamples](examples, mediaType) {
    return examples.map((example) => this[evaluateExample](example, mediaType))
  }

  /**
   * @param {ApiExample} example The example to evaluate
   * @param {string} mediaType The media type to use with examples processing.
   * @returns {SchemaExample}
   */
  [evaluateExample](example, mediaType) {
    let value;
    if (mediaType) {
      const generator = new ApiExampleGenerator();
      value = generator.read(example, mediaType);
    } else {
      value = example.value || '';
    }
    const { name, displayName } = example;
    const label = displayName || name;
    const result = /** @type SchemaExample */ ({
      ...example,
      renderValue: value,
    });
    if (label && !label.startsWith('example_')) {
      result.label = label;
    }
    return result;
  }

  /**
   * @param {string} ctrlProperty
   * @return {TemplateResult|string} The template for the section toggle button
   */
  [sectionToggleTemplate](ctrlProperty) {
    const label = this[ctrlProperty] ? 'Hide' : 'Show';
    return html`
    <anypoint-button class="section-toggle" ?compatibility="${this.anypoint}">
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
    const classes = {
      'params-title': true,
      opened,
    };
    return html`
    <div class="params-section" data-controlled-by="${openedProperty}">
      <div 
        class="${classMap(classes)}"
        data-ctrl-property="${openedProperty}" 
        @click="${this[sectionToggleClickHandler]}"
      >
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
   * @param {string=} dataName Optional data-name for this parameter
   * @return {TemplateResult} The template for the schema item document
   */
  [schemaItemTemplate](model, dataName) {
    return html`
    <api-parameter-document 
      .amf="${this.amf}" 
      .parameter="${model}" 
      class="property-item"
      data-name="${ifDefined(dataName)}"
      ?anypoint="${this.anypoint}"
    ></api-parameter-document>
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
        @click="${this[clickHandler]}"
      >
        <div slot="markdown-html" class="markdown-body"></div>
      </arc-marked>
    </div>`;
  }

  /**
   * @param {ApiCustomDomainProperty[]} customDomainProperties
   * @returns {TemplateResult|string} The template for the custom domain properties
   */
  [customDomainPropertiesTemplate](customDomainProperties=[]) {
    if (!customDomainProperties.length) {
      return '';
    }
    return html`
    <api-annotation-document
      .customProperties="${customDomainProperties}"
    ></api-annotation-document>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the examples section.
   */
  [examplesTemplate]() {
    const examples = this[examplesValue];
    if (!Array.isArray(examples)) {
      return '';
    }
    const filtered = examples.filter((item) => !!item.renderValue);
    if (!filtered.length) {
      return '';
    }
    return html`
    <div class="examples">
    ${filtered.map((item) => this[exampleTemplate](item))}
    </div>
    `;
  }

  /**
   * @param {SchemaExample} item
   * @returns {TemplateResult|string} The template for a single example
   */
  [exampleTemplate](item) {
    const { description, renderValue, label } = item;
    return html`
    <details class="schema-example">
      <summary>Example${label ? `: ${label}` : ''}</summary>
      <div class="example-content">
        ${description ? html`<div class="example-description">${description}</div>` : ''}
        <pre class="code-value"><code>${renderValue}</code></pre>
      </div>
    </details>
    `;
  }
}

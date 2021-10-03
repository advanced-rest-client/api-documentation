/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import '@advanced-rest-client/highlight/arc-marked.js';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiParameter.js';
import schemaStyles from './styles/SchemaCommon.js';
import { readPropertyTypeLabel } from '../lib/Utils.js';
import { paramNameTemplate, typeValueTemplate, detailsTemplate, pillTemplate } from './SchemaCommonTemplates.js';
import { ApiDocumentationBase, descriptionTemplate } from './ApiDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').ApiParameter} ApiParameter */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarNode} ApiScalarNode */

export const queryParameter = Symbol('queryParameter');
export const querySchema = Symbol('querySchema');
export const parameterValue = Symbol('parameterValue');
export const schemaValue = Symbol('schemaValue');
export const computeParamType = Symbol('computeParamType');
export const typeLabelValue = Symbol('typeLabelValue');

/**
 * A web component that renders the documentation for a single request / response parameter.
 */
export default class ApiParameterDocumentElement extends ApiDocumentationBase {
  get styles() {
    return [MarkdownStyles, commonStyles, schemaStyles, elementStyles];
  }

  /**
   * @returns {ApiParameter}
   */
  get parameter() {
    return this[parameterValue];
  }

  /**
   * @param {ApiParameter} value
   */
  set parameter(value) {
    const old = this[parameterValue];
    if (old === value) {
      return;
    }
    this[parameterValue] = value;
    this.processGraph();
  }

  constructor() {
    super();
    /** @type {ApiParameter} */
    this[parameterValue] = undefined;
    /** @type {ApiShapeUnion} */
    this[schemaValue] = undefined;
    /** @type {string} */
    this[typeLabelValue] = undefined;
  }

  /**
   * Prepares the values to be rendered.
   */
  async processGraph() {
    const { parameter } = this;
    if (!parameter) {
      return;
    }
    this[querySchema]();
    this[computeParamType]();
    await this.requestUpdate();
  }

  /**
   * Reads the schema from the parameter.
   */
  [querySchema]() {
    this[schemaValue] = undefined;
    const param = this[parameterValue];
    if (!param || !param.schema) {
      return;
    }
    this[schemaValue] = param.schema;
  }

  /**
   * Computes the schema type label value to render in the type view.
   */
  [computeParamType]() {
    const schema = this[schemaValue];
    const label = readPropertyTypeLabel(schema);
    this[typeLabelValue] = label;
  }

  render() {
    const param = this[parameterValue];
    if (!param) {
      return html``;
    }
    const { name, required } = param;
    const type = this[typeLabelValue];
    const schema = this[schemaValue];
    return html`
    <style>${this.styles}</style>
    <div class="property-container simple">
      <div class="name-column">
        ${paramNameTemplate(name, required)}
        <span class="headline-separator"></span>
        ${typeValueTemplate(type)}
        ${required ? pillTemplate('Required', 'This property is required.') : ''}
      </div>
      <div class="description-column">
        ${this[descriptionTemplate]()}
      </div>
      <div class="details-column">
        ${detailsTemplate(schema)}
      </div>
    </div>
    `;
  }

  /**
   * @return {TemplateResult|string} The template for the parameter description. 
   */
  [descriptionTemplate]() {
    const schema = this[schemaValue];
    if (schema && schema.description) {
      return super[descriptionTemplate](schema.description);
    }
    const param = this[parameterValue];
    return super[descriptionTemplate](param.description);
  }
}

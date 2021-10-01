/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
import { html } from 'lit-element';
import { classMap } from "lit-html/directives/class-map";
import { ns } from '@api-components/amf-helper-mixin';
import { MarkdownStyles } from '@advanced-rest-client/highlight';
import { ApiSchemaGenerator } from '@api-components/api-schema';
import '@advanced-rest-client/highlight/arc-marked.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import { chevronRight } from '@advanced-rest-client/arc-icons';
import commonStyles from './styles/Common.js';
import elementStyles from './styles/ApiSchema.js';
import schemaStyles from './styles/SchemaCommon.js';
import { readPropertyTypeLabel, isScalarUnion, isScalarType } from '../lib/Utils.js';
import { 
  detailsTemplate, 
  paramNameTemplate, 
  typeValueTemplate, 
  fileDetailsTemplate,
  scalarDetailsTemplate,
  unionDetailsTemplate,
  pillTemplate,
} from './SchemaCommonTemplates.js';
import { 
  ApiDocumentationBase,
  serializerValue,
  descriptionTemplate,
  customDomainPropertiesTemplate,
  evaluateExamples,
  examplesTemplate,
  examplesValue,
} from './ApiDocumentationBase.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').Shape} Shape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShape} ApiShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiExample} ApiExample */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiFileShape} ApiFileShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiSchemaShape} ApiSchemaShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiAnyShape} ApiAnyShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiTupleShape} ApiTupleShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiPropertyShape} ApiPropertyShape */
/** @typedef {import('@api-components/api-schema').SchemaExample} SchemaExample */

export const mimeTypeValue = Symbol('mimeTypeValue');
export const querySchema = Symbol('querySchema');
export const schemaValue = Symbol('schemaValue');
export const expandedValue = Symbol('expandedValue');
export const selectedUnionsValue = Symbol('unionsValue');
export const processSchema = Symbol('processSchema');
export const titleTemplate = Symbol('titleTemplate');
export const expandHandler = Symbol('expandHandler');
export const expandKeydownHandler = Symbol('expandKeydownHandler');
export const anyOfSelectedHandler = Symbol('anyOfSelectedHandler');
export const schemaContentTemplate = Symbol('schemaContentTemplate');
export const scalarShapeTemplate = Symbol('scalarSchemaTemplate');
export const nodeShapeTemplate = Symbol('nodeShapeTemplate');
export const unionShapeTemplate = Symbol('unionShapeTemplate');
export const fileShapeTemplate = Symbol('fileShapeTemplate');
export const schemaShapeTemplate = Symbol('schemaShapeTemplate');
export const arrayShapeTemplate = Symbol('arrayShapeTemplate');
export const tupleShapeTemplate = Symbol('tupleShapeTemplate');
export const anyShapeTemplate = Symbol('anyShapeTemplate');
export const shapePropertyTemplate = Symbol('shapePropertyTemplate');
export const shapePropertyWithoutRangeTemplate = Symbol('shapePropertyWithoutRangeTemplate');
export const anyOfUnionTemplate = Symbol('anyOfUnionTemplate');
export const anyOfOptionsTemplate = Symbol('anyOfOptionsTemplate');
export const propertyDescriptionTemplate = Symbol('propertyDescriptionTemplate');
export const propertyDescriptionEditor = Symbol('propertyDescriptionEditor');
export const checkSchemaPropertyUpdate = Symbol('checkSchemaPropertyUpdate');
export const propertyDecoratorTemplate = Symbol('propertyDecoratorTemplate');
export const toggleExpandedProperty = Symbol('toggleExpandedProperty');
export const andUnionItemTemplate = Symbol('andUnionItemTemplate');
export const orderUnion = Symbol('orderUnion');
export const inheritanceNameTemplate = Symbol('inheritanceNameTemplate');
export const nilShapeTemplate = Symbol('nilShapeTemplate');

const complexTypes = [
  ns.w3.shacl.NodeShape,
  ns.aml.vocabularies.shapes.UnionShape,
  ns.aml.vocabularies.shapes.ArrayShape,
  ns.aml.vocabularies.shapes.TupleShape,
  ns.aml.vocabularies.shapes.AnyShape,
];

export default class ApiSchemaDocumentElement extends ApiDocumentationBase {
  get styles() {
    return [commonStyles, schemaStyles, elementStyles, MarkdownStyles];
  }

  get mimeType() {
    return this[mimeTypeValue];
  }

  set mimeType(value) {
    const old = this[mimeTypeValue];
    if (old === value) {
      return;
    }
    this[mimeTypeValue] = value;
    this.requestUpdate('mimeType', old);
    setTimeout(() => {
      this[processSchema]();
      this.requestUpdate();
    });
  }

  /**
   * @returns {ApiShapeUnion}
   */
  get schema() {
    return this[schemaValue];
  }

  /**
   * @param {ApiShapeUnion} value
   */
  set schema(value) {
    const old = this[schemaValue];
    if (old === value) {
      return;
    }
    this[schemaValue] = value;
    this.processGraph();
  }

  static get properties() {
    return {
      /** 
       * The mime type to use to render the examples.
       */
      mimeType: { type: String, reflect: true },
      /** 
       * Generates examples from the schema properties for the given mime type 
       * when examples are not defined in the schema.
       */
      forceExamples: { type: Boolean, reflect: true },
      /** 
       * When set it allows to manipulate the properties.
       * This is to be used with a combination with the `edit` property.
       */
      editProperties: { type: Boolean, reflect: true },
      /** 
       * When set it renders the title with lower emphasis and adding `schema` prefix.
       */
      schemaTitle: { type: Boolean, reflect: true },
      /** 
       * When set it does not render read only items.
       * Read only property is a feature of OAS.
       */
      noReadOnly: { type: Boolean },
    };
  }

  constructor() {
    super();
    /**
     * @type {ApiShapeUnion}
     */
    this[schemaValue] = undefined;
    /**
     * @type {string[]}
     */
    this[expandedValue] = undefined;
    /**
     * @type {Record<string, string>}
     */
    this[selectedUnionsValue] = undefined;
    /**
     * @type {string}
     */
    this[propertyDescriptionEditor] = undefined;
    /**
     * @type {string}
     */
    this.mimeType = undefined;
    /** @type boolean */
    this.forceExamples = undefined;
    /** @type boolean */
    this.editProperties = undefined;
    /** @type boolean */
    this.schemaTitle = undefined;
    /** @type boolean */
    this.noReadOnly = undefined;
    /** @type Shape */
    this.domainModel = undefined;
  }

  /**
   * @returns {Promise<void>}
   */
  async processGraph() {
    const { domainModel, domainId, amf } = this;
    if (domainModel) {
      this[schemaValue] = this[serializerValue].unknownShape(domainModel);
    }
    this[expandedValue] = [];
    this[selectedUnionsValue] = {};

    if (domainId && amf) {
      const declares = this._computeDeclares(amf);
      const references = this._computeReferences(amf);
      const model = this._computeType(declares, references, domainId);
      if (model) {
        this[schemaValue] = this[serializerValue].unknownShape(model);
      }
    }
    
    this[processSchema]();
    await this.requestUpdate();
  }

  /**
   * The logic to perform after schema is ready.
   * This processes examples for the schema.
   */
  [processSchema]() {
    const type = /** @type ApiShapeUnion */ (this[schemaValue]);
    if (!type) {
      this[examplesValue] = undefined;
      return;
    }
    if (isScalarType(type.types)) {
      // we don't want to render examples for a scalar types.
      this[examplesValue] = undefined;
      return;
    }
    const anyShape = /** @type ApiAnyShape */ (type);
    const { examples=[] } = anyShape;
    let examplesCopy = [...examples];
    if (Array.isArray(type.inherits) && type.inherits.length) {
      type.inherits.forEach((item) => {
        const anyParent = /** @type ApiAnyShape */ (item);
        if (Array.isArray(anyParent.examples) && anyParent.examples.length) {
          examplesCopy = examplesCopy.concat([...anyParent.examples]);
        }
      });
    }
    if (Array.isArray(examplesCopy) && examplesCopy.length) {
      examplesCopy = examplesCopy.filter((i) => !!i.value || !!i.structuredValue);
    }
    if (Array.isArray(examplesCopy) && examplesCopy.length) {
      const { mimeType='' } = this;
      this[examplesValue] = this[evaluateExamples](examplesCopy, mimeType);
    } else {
      const { mimeType, forceExamples } = this;
      this[examplesValue] = undefined;
      if (mimeType && forceExamples) {
        const selectedUnions = [];
        const all = this[selectedUnionsValue];
        Object.keys(all).forEach((id) => {
          if (!selectedUnions.includes(all[id])) {
            selectedUnions.push(all[id]);
          }
        });
        const result = ApiSchemaGenerator.asExample(type, mimeType, {
          selectedUnions,
          renderExamples: true,
          renderOptional: true,
        });
        if (result) {
          this[examplesValue] = [result];
        }
      }
    }
  }

  /**
   * Checks the current schema whether it contains a property with the given id
   * and if so it updates its value.
   * @param {ApiShapeUnion} schema
   * @param {string} id
   * @param {any} updated
   */
  [checkSchemaPropertyUpdate](schema, id, updated) {
    if (!schema) {
      return;
    }
    const { types } = schema;
    if (types.includes(ns.w3.shacl.NodeShape)) {
      const type = /** @type ApiNodeShape */ (schema);
      const { properties } = type;
      for (let i = 0, len = properties.length; i < len; i++) {
        const property = properties[i];
        if (property.id === id) {
          properties[i] = updated;
          this.requestUpdate();
          return;
        }
        if (property.range && property.range.id === id) {
          property.range = updated;
          this.requestUpdate();
          return;
        }
      }
      return;
    }
    if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
      const type = /** @type ApiUnionShape */ (schema);
      const { anyOf, or, and } = type;
      if (Array.isArray(anyOf) && anyOf.length) {
        anyOf.forEach((item) => this[checkSchemaPropertyUpdate](item, id, updated));
      }
      if (Array.isArray(or) && or.length) {
        or.forEach((item) => this[checkSchemaPropertyUpdate](item, id, updated));
      }
      if (Array.isArray(and) && and.length) {
        and.forEach((item) => this[checkSchemaPropertyUpdate](item, id, updated));
      }
      return;
    }
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
      const type = /** @type ApiArrayShape */ (schema);
      if (type.items) {
        this[checkSchemaPropertyUpdate](type.items, id, updated)
      }
    }
  }

  /**
   * @param {Event} e
   */
  [expandHandler](e) {
    const button = /** @type HTMLElement */ (e.currentTarget);
    const { id } = button.dataset;
    this[toggleExpandedProperty](id);
  }

  /**
   * @param {KeyboardEvent} e
   */
  [expandKeydownHandler](e) {
    if (e.code !== 'Space') {
      return;
    }
    e.preventDefault();
    const button = /** @type HTMLElement */ (e.currentTarget);
    const { id } = button.dataset;
    this[toggleExpandedProperty](id);
  }

  /**
   * Toggles an "expanded" state for a property children.
   * @param {string} id Parent property id that has children to toggle visibility of.
   */
  [toggleExpandedProperty](id) {
    const list = this[expandedValue];
    const index = list.indexOf(id);
    if (index === -1) {
      list.push(id);
    } else {
      list.splice(index, 1);
    }
    this.requestUpdate();
  }

  [anyOfSelectedHandler](e) {
    const { selected, dataset } = e.target
    const { schema } = dataset;
    if (!schema) {
      return;
    }
    this[selectedUnionsValue][schema] = selected;
    this[processSchema]();
    this.requestUpdate();
  }

  /**
   * Orders union items so the first is the one that has properties defined inline.
   * @param {ApiShapeUnion[]} shapes
   * @return {ApiShapeUnion[]} 
   */
  [orderUnion](shapes) {
    return [...shapes].sort((a, b) => {
      const aHasName = !!a.name && !a.name.startsWith('item');
      const bHasName = !!b.name && !b.name.startsWith('item');
      if (aHasName === bHasName) {
        return 0;
      }
      return aHasName ? 1 : -1;
    });
  }

  render() {
    const schema = this[schemaValue];
    if (!schema) {
      return html``;
    }
    return html`
    <style>${this.styles}</style>
    ${this[titleTemplate]()}
    ${this[descriptionTemplate](schema.description)}
    ${this[customDomainPropertiesTemplate](schema.customDomainProperties)}
    ${this[examplesTemplate]()}
    ${this[schemaContentTemplate](schema)}
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the schema title.
   */
  [titleTemplate]() {
    const schema = this[schemaValue];
    const { name, displayName } = schema;
    const label = displayName || name;
    if (['schema', 'default'].includes(label)) {
      return '';
    }
    const typeName = name && label !== name && name !== 'schema' ? name : undefined;
    const { schemaTitle } = this;
    const headerCss = {
      'schema-title': true,
      'low-emphasis': !!schemaTitle,
    };
    const prefix = schemaTitle ? 'Schema: ' : '';
    return html`
    <div class="schema-header">
      <div class="${classMap(headerCss)}">
        <span class="label">${prefix}${label}</span>
        ${typeName ? html`<span class="type-name" title="Schema name">(${typeName})</span>` : ''}
      </div>
    </div>
    `;
  }

  /**
   * @param {ApiShapeUnion} schema The shape to render.
   * @returns {TemplateResult|string} The template for the schema properties depending on the type
   */
  [schemaContentTemplate](schema) {
    const { noReadOnly } = this;
    if (schema.readOnly && noReadOnly) {
      return '';
    }
    const { types } = schema;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      return this[scalarShapeTemplate](/** @type ApiScalarShape */ (schema));
    }
    if (types.includes(ns.w3.shacl.NodeShape)) {
      return this[nodeShapeTemplate](/** @type ApiNodeShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
      return this[unionShapeTemplate](/** @type ApiUnionShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.FileShape)) {
      return this[fileShapeTemplate](/** @type ApiFileShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.SchemaShape)) {
      return this[schemaShapeTemplate](/** @type ApiSchemaShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.TupleShape)) {
      return this[tupleShapeTemplate](/** @type ApiTupleShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.ArrayShape) || types.includes(ns.aml.vocabularies.shapes.MatrixShape)) {
      return this[arrayShapeTemplate](/** @type ApiArrayShape */ (schema));
    }
    if (types.includes(ns.aml.vocabularies.shapes.NilShape)) {
      return this[nilShapeTemplate](/** @type ApiShape */ (schema));
    }
    return this[anyShapeTemplate](/** @type ApiAnyShape */ (schema));
  }

  /**
   * @param {ApiScalarShape} schema
   * @returns {TemplateResult|string} The template for the scalar shape.
   */
  [scalarShapeTemplate](schema) {
    if (schema.readOnly && this.noReadOnly) {
      return '';
    }
    const type = typeValueTemplate(readPropertyTypeLabel(schema));
    return html`
    <div class="scalar-property">
      ${type}
      ${scalarDetailsTemplate(schema, true)}
    </div>
    `;
    // return scalarDetailsTemplate(schema, true);
  }

  /**
   * @param {ApiNodeShape} schema
   * @returns {TemplateResult|string} The template for the node shape.
   */
  [nodeShapeTemplate](schema) {
    const { properties, inherits, readOnly } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    let items = [...(properties || [])];
    if (Array.isArray(inherits) && inherits.length) {
      inherits.forEach((item) => {
        if (item.types.includes(ns.w3.shacl.NodeShape)) {
          const typed = /** @type ApiNodeShape */ (item);
          items = items.concat([...(typed.properties || [])]);
        }
      });
    }
    if (!items.length) {
      return html`
        <div class="empty-info">Properties are not defined for this schema.</div>
      `;
    }
    return html`
    <div class="params-section">
      ${items.map((item) => this[shapePropertyTemplate](item))}
    </div>
    `;
  }

  // /**
  //  * @param {ApiShapeUnion[]} parents
  //  * @returns {TemplateResult[]|undefined}
  //  */
  // [inheritedTemplate](parents) {
  //   if (!Array.isArray(parents) || !parents.length) {
  //     return undefined;
  //   }
  //   const parts = [];
  //   parents.forEach((item) => {
  //     const tpl = this[schemaContentTemplate](item);
  //     if (tpl) {
  //       parts.push(tpl);
  //     }
  //   });
  //   if (!parts.length) {
  //     return undefined;
  //   }
  //   return parts;
  // }

  /**
   * @param {ApiUnionShape} schema
   * @returns {TemplateResult|string} The template for the union shape.
   */
  [unionShapeTemplate](schema) {
    const unionTemplate = unionDetailsTemplate(schema);
    const allScalar = isScalarUnion(schema);
    if (allScalar) {
      return unionTemplate;
    }
    const { anyOf, or, and, xone } = schema;
    if (Array.isArray(anyOf) && anyOf.length) {
      const schemaContent = this[anyOfUnionTemplate](schema.id, anyOf);
      return html`
      ${unionTemplate}
      ${schemaContent}
      `;
    }
    if (Array.isArray(xone) && xone.length) {
      const schemaContent = this[anyOfUnionTemplate](schema.id, xone);
      return html`
      ${unionTemplate}
      ${schemaContent}
      `;
    }
    if (Array.isArray(or) && or.length) {
      const schemaContent = this[anyOfUnionTemplate](schema.id, or);
      return html`
      ${unionTemplate}
      ${schemaContent}
      `;
    }
    if (Array.isArray(and) && and.length) {
      const items = this[orderUnion](and).map((item) => this[andUnionItemTemplate](item));
      return html`
      <div class="combined-union">
        ${items}
      </div>
      `;
    }
    return unionTemplate;
  }

  /**
   * @param {ApiShapeUnion} shape
   */
  [andUnionItemTemplate](shape) {
    return html`
    <div class="and-union-member">
      ${this[inheritanceNameTemplate](shape)}
      ${this[schemaContentTemplate](shape)}
    </div>
    `;
  }

  /**
   * @param {ApiShapeUnion} shape
   * @returns {TemplateResult|string} The template for the "and" union item's title, if inherited from another type.
   */
  [inheritanceNameTemplate](shape) {
    const { name='' } = shape;
    const hasName = !!name && !name.startsWith('item');
    if (hasName) {
      return html`<p class="inheritance-label">Properties inherited from <b>${name}</b>.</p>`;
    }
    return '';
    // return html`<p class="inheritance-label">Properties defined inline.</p>`;
  }

  /**
   * @param {string} schemaId
   * @param {ApiShapeUnion[]} items
   * @returns {TemplateResult} The template for the `any of` union.
   */
  [anyOfUnionTemplate](schemaId, items) {
    const allSelected = this[selectedUnionsValue];
    let selected = allSelected[schemaId];
    let renderedItem = /** @type ApiShapeUnion */ (null);
    if (selected) {
      renderedItem = items.find((item) => item.id === selected);
    } else {
      [renderedItem] = items;
      selected = renderedItem.id;
    }
    const options = items.map((item) => {
      const label = readPropertyTypeLabel(item);
      // let label = item.name || item.displayName;
      // if (!label && item.types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      //   const { dataType } = /** @type ApiScalarShape */ (item);
      //   label = `${schemaToType(dataType)} (#${index + 1})`;
      // }
      // if (!label) {
      //   label = `Option #${index + 1}`;
      // }
      return {
        label,
        id: item.id,
      }
    });
    return html`
    <div class="union-container">
      ${this[anyOfOptionsTemplate](schemaId, options, selected)}
      ${this[schemaContentTemplate](renderedItem)}
    </div>
    `;
  }

  /**
   * @param {string} schemaId The parent schema id value
   * @param {any[]} options The options to render.
   * @param {string} selected
   * @returns {TemplateResult} The template for the union any of selector.
   */
  [anyOfOptionsTemplate](schemaId, options, selected) {
    return html`
    <div class="union-options">
      <label>Any (one or more) of the following schemas</label>
      <anypoint-radio-group 
        @selected="${this[anyOfSelectedHandler]}" 
        attrForSelected="data-value" 
        .selected="${selected}"
        data-schema="${schemaId}"
      >
        ${options.map((item) => 
          html`<anypoint-radio-button class="union-toggle" name="unionValue" data-value="${item.id}" data-member="${item.label}">${item.label}</anypoint-radio-button>`)}
      </anypoint-radio-group>
    </div>
    `;
  }

  /**
   * @param {ApiFileShape} schema
   * @returns {TemplateResult|string} The template for the file shape.
   */
  [fileShapeTemplate](schema) {
    if (schema.readOnly && this.noReadOnly) {
      return '';
    }
    let noDetail = false;
    if (schema === this[schemaValue]) {
      noDetail = true;
    }
    return fileDetailsTemplate(schema, noDetail);
  }

  /**
   * @param {ApiSchemaShape} schema
   * @returns {TemplateResult|string} The template for the schema shape.
   */
  [schemaShapeTemplate](schema) {
    const { raw, readOnly } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    if (!raw) {
      return html`
      <div class="empty-info">Schema is not defined for this message.</div>
      `;
    }
    return html`
    <div class="schema-content">
    <pre class="code-value"><code>${raw}</code></pre>
    </div>
    `;
  }

  /**
   * @param {ApiArrayShape} schema
   * @returns {TemplateResult|string} The template for the array shape.
   */
  [arrayShapeTemplate](schema) {
    const { items, readOnly } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    if (!items) {
      return html`<div class="empty-info">Items are not defined for this array.</div>`;
    }
    let labelTemplate;
    if (schema === this[schemaValue]) {
      const label = readPropertyTypeLabel(schema, true);
      labelTemplate = html`
      <div class="schema-property-item">
        <div class="schema-property-label">${label}</div>
      </div>
      `;
    }
    return html`
    <div class="params-section">
      ${labelTemplate||''}
      ${this[schemaContentTemplate](items)}
    </div>
    `;
  }

  /**
   * @param {ApiTupleShape} schema
   * @returns {TemplateResult|string} The template for the tuple shape.
   */
  [tupleShapeTemplate](schema) {
    const { items, readOnly } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    if (!items) {
      return html`<div class="empty-info">Items are not defined for this array.</div>`;
    }
    return html`
    <div class="params-section">
      ${items.map((item) => this[schemaContentTemplate](item))}
    </div>
    `;
  }

  /**
   * @param {ApiAnyShape} schema
   * @returns {TemplateResult|string} The template for the Any shape.
   */
  [anyShapeTemplate](schema) {
    const { and=[], or=[], readOnly, xone=[] } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    if (and.length || or.length || xone.length) {
      return this[unionShapeTemplate](/** @type ApiUnionShape */ (schema));
    }
    return html`<p class="any-info">Any schema is accepted as the value here.</p>`;
  }

  /**
   * @param {ApiShape} schema
   * @returns {TemplateResult|string} The template for the Any shape.
   */
  [nilShapeTemplate](schema) {
    if (schema.readOnly && this.noReadOnly) {
      return '';
    }
    return html`<p class="nil-info">The value of this property is <b>nil</b>.</p>`;
  }

  /**
   * @param {ApiPropertyShape} schema
   * @returns {TemplateResult|string} The template for the schema property item.
   */
  [shapePropertyTemplate](schema) {
    const { range, minCount, readOnly } = schema;
    if (readOnly && this.noReadOnly) {
      return '';
    }
    if (!range) {
      return this[shapePropertyWithoutRangeTemplate](schema);
    }
    const { displayName, deprecated } = range;
    if (range.readOnly && this.noReadOnly) {
      return '';
    }
    const required = minCount > 0;
    const type = readPropertyTypeLabel(range);
    const label = displayName || schema.name || range.name;
    const paramLabel = displayName ? schema.name || range.name : undefined;
    const [domainType] = range.types;
    let isComplex = complexTypes.includes(domainType);
    if (isComplex) {
      if (range.types.includes(ns.aml.vocabularies.shapes.TupleShape)) {
        const { items=[] } = /** @type ApiTupleShape */ (range);
        isComplex = complexTypes.includes(items[0].types[0]);
      } else if (range.types.includes(ns.aml.vocabularies.shapes.ArrayShape)) {
        const { items } = /** @type ApiArrayShape */ (range);
        isComplex = complexTypes.includes(items.types[0]);
      } else if (range.types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
        isComplex = !isScalarUnion(/** @type ApiUnionShape */ (range));
      }
    }
    const allExpanded = this[expandedValue];
    const expanded = isComplex && allExpanded.includes(schema.id);
    const containerClasses = {
      'property-container': true,
      complex: isComplex,
      expanded,
    };
    return html`
    <div class="${classMap(containerClasses)}" data-name="${schema.name || range.name}">
      <div class="property-border"></div>
      <div class="property-value">
        <div class="property-headline">
          ${this[propertyDecoratorTemplate](isComplex, expanded, schema.id)}
          ${paramNameTemplate(label, required, deprecated, paramLabel)}
          <span class="headline-separator"></span>
          ${typeValueTemplate(type)}
          ${required ? pillTemplate('Required', 'This property is required.') : ''}
        </div>
        <div class="description-column">
          ${this[propertyDescriptionTemplate](schema)}
        </div>
        <div class="details-column">
          ${detailsTemplate(range)}
        </div>
      </div>
      </div>
    ${expanded ? html`
    <div class="shape-children">
      <div class="property-border"></div>
      ${this[schemaContentTemplate](range)}
    </div>
    ` : ''}
    `;
  }

  /**
   * @param {boolean} isComplex
   * @param {boolean} expanded
   * @param {string} schemaId
   * @returns {TemplateResult} THe template for the line decorator in front of the property name.
   */
  [propertyDecoratorTemplate](isComplex, expanded, schemaId) {
    const toggleIcon = isComplex ? html`
    <span class="object-toggle-icon ${expanded ? 'opened' : ''}">${chevronRight}</span>
    ` : '';
    const decoratorClasses = {
      'property-decorator': true,
      scalar: !isComplex,
      object: !!isComplex,
    };
    const toggleHandler = isComplex ? this[expandHandler] : undefined;
    const keydownHandler = isComplex ? this[expandKeydownHandler] : undefined;
    const tabIndex = isComplex ? '0' : '-1';
    return html`
    <div 
      class="${classMap(decoratorClasses)}" 
      data-id="${schemaId}" 
      @click="${toggleHandler}"
      @keydown="${keydownHandler}"
      tabindex="${tabIndex}"
    ><hr/>${toggleIcon}</div>
    `;
  }

  /**
   * @param {ApiPropertyShape} schema
   * @returns {TemplateResult} The template for the schema property item that has no range information.
   */
  [shapePropertyWithoutRangeTemplate](schema) {
    const { minCount, name, displayName, deprecated } = schema;
    const label = name || displayName || 'Unnamed property';
    const required = minCount > 0;
    return html`
    <div class="property-container">
      <div class="name-column">
        ${paramNameTemplate(label, required, deprecated)}
        <div class="param-type">
          Unknown type
        </div>
      </div>
      <div class="description-column">
        ${this[propertyDescriptionTemplate](schema)}
      </div>
    </div>
    `;
  }

  /**
   * @param {ApiPropertyShape} schema
   */
  [propertyDescriptionTemplate](schema) {
    const { range, description } = schema;
    if (!range || description) {
      return this[descriptionTemplate](description);
    }
    return this[descriptionTemplate](range.description);
  }
}

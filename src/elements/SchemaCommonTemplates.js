import { html } from "lit-element";
import { ns } from '@api-components/amf-helper-mixin';
import { classMap } from "lit-html/directives/class-map";
import { ifDefined } from "lit-html/directives/if-defined";
import '../../api-annotation-document.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarNode} ApiScalarNode */
/** @typedef {import('@api-components/amf-helper-mixin').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiFileShape} ApiFileShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiDataNodeUnion} ApiDataNodeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiRecursiveShape} ApiRecursiveShape */

/**
 * @param {string} label The label to render.
 * @param {string} title The value of the title attribute
 * @param {string[]=} [css=[]] The list of class names to add
 * @return {TemplateResult} The template for a pill visualization object
 */
export function pillTemplate(label, title, css=[]) {
  const classes = {
    'param-pill': true,
    'pill': true,
  };
  css.forEach((item) => { classes[item] = true });
  return html`
  <span class="${classMap(classes)}" title="${title}">
    ${label}
  </span>`;
}

/**
 * @param {TemplateResult[]} pills The pills to render
 * @returns {TemplateResult|string}
 */
function pillsLine(pills) {
  if (!pills.length) {
    return '';
  }
  return html`
  <div class="param-pills">
    ${pills}
  </div>
  `;
}

/**
 * @param {TemplateResult[]} pills The pills to render
 * @param {TemplateResult[]} items The table properties to render.
 * @returns {TemplateResult}
 */
function pillsAndTable(pills, items) {
  return html`
    ${pillsLine(pills)}
    ${items.length ? html`<div class="param-properties">${items}</div>` : ''}
  `;
}

/**
 * @param {ApiDataNodeUnion[]} values
 * @returns {TemplateResult}
 */
function enumValuesTemplate(values) {
  return html`
  <div class="schema-property-item">
  <div class="schema-property-label">Enum:</div>
    <ul class="enum-items">
      ${values.map((item) => html`<li class="code-value inline">${/** @type ApiScalarNode */ (item).value}</li>`)}
    </ul>
  </div>
  `;
}

/**
 * @param {string} name The name of the parameter
 * @param {boolean=} required Whether the parameter is required
 * @param {boolean=} deprecated Whether the parameter is deprecated
 * @param {string=} paramName When set it renders the parameter name. Should be used when `name` is a `display name`.
 * @return {TemplateResult} The template for the property name value. 
 */
export function paramNameTemplate(name, required=false, deprecated=false, paramName) {
  const label = String(name||'');
  const classes = {
    'param-name': true,
    required,
    deprecated,
  };
  return html`
  <div class="${classMap(classes)}">
    <span class="param-label">${label}</span>
  </div>
  ${paramName ? html`<span class="param-name-secondary" title="Schema property name">${paramName}</span>` : ''}
  `;
}

/**
 * @param {string} type The parameter type label to render.
 * @return {TemplateResult|string} The template for the parameter data type. 
 */
export function typeValueTemplate(type) {
  if (!type) {
    return '';
  }
  return html`
  <div class="param-type">
    ${type}
  </div>
  `;
}

/**
 * @param {string} description The description to render.
 * @return {TemplateResult|string} The template for the markdown description
 */
export function descriptionValueTemplate(description) {
  if (!description) {
    return '';
  }
  return html`
  <div class="api-description">
    <arc-marked .markdown="${description}" sanitize>
      <div slot="markdown-html" class="markdown-body"></div>
    </arc-marked>
  </div>
  `;
}

/**
 * @param {string} label The label to render
 * @param {string} value The value to render
 * @param {string=} name Optional data-name attribute value.
 * @return {TemplateResult}
 */
export function tablePropertyTemplate(label, value, name) {
  return html`
  <div class="schema-property-item" data-name="${ifDefined(name)}">
    <div class="schema-property-label">${label}:</div>
    <div class="schema-property-value code-value inline">${value}</div>
  </div>
  `;
}

export function detailSectionTemplate(items) {
  return html`
  <details class="property-details">
    <summary><span class="label">Details</span></summary>
    <div class="details-content">
      ${items}
    </div>
  </details>
  `;
}

/**
 * @param {ApiScalarShape} schema
 * @param {boolean=} noDetail When true it always render all properties, without the detail element.
 * @return {TemplateResult|string} The template for the details of the scalar schema
 */
export function scalarDetailsTemplate(schema, noDetail) {
  const { examples=[], values=[], defaultValueStr, format, maxLength, maximum, minLength, minimum, multipleOf, pattern, readOnly, writeOnly, deprecated, customDomainProperties } = schema;
  const result = [];
  const pills = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (format) {
    result.push(tablePropertyTemplate('Format', format));
  }
  if (pattern) {
    result.push(tablePropertyTemplate('Pattern', pattern));
  }
  if (typeof minimum === 'number') {
    result.push(tablePropertyTemplate('Minimum', String(minimum)));
  }
  if (typeof maximum === 'number') {
    result.push(tablePropertyTemplate('Maximum', String(maximum)));
  }
  if (typeof minLength === 'number') {
    result.push(tablePropertyTemplate('Minimum length', String(minLength)));
  }
  if (typeof maxLength === 'number') {
    result.push(tablePropertyTemplate('Maximum length', String(maxLength)));
  }
  if (typeof multipleOf === 'number') {
    result.push(tablePropertyTemplate('Multiple of', String(multipleOf)));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }
  if (values.length) {
    result[result.length] = enumValuesTemplate(values);
  }
  if (examples.length) {
    result[result.length] = html`
    <div class="schema-property-item">
      <div class="schema-property-label example">Examples:</div>
      <ul class="example-items">
        ${examples.map((item) => html`<li>${item.value}</li>`)}
      </ul>
    </div>
    `;
  }
  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (noDetail && result.length) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  } 
  return pillsLine(pills);
}

/**
 * @param {ApiNodeShape} schema
 * @return {TemplateResult|string} The template for the details of the Node schema
 */
function nodeDetailsTemplate(schema) {
  const { maxProperties, minProperties, readOnly, writeOnly, deprecated, customDomainProperties } = schema;
  const result = [];
  const pills = [];
  if (typeof minProperties === 'number') {
    result.push(tablePropertyTemplate('Minimum properties', String(minProperties)));
  }
  if (typeof maxProperties === 'number') {
    result.push(tablePropertyTemplate('Maximum properties', String(maxProperties)));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }
  // if (examples.length) {
  //   result[result.length] = html`
  //   <div class="schema-property-item">
  //     <div class="schema-property-label example">Examples:</div>
  //     <ul class="example-items">
  //       ${examples.map((item) => html`<li>${item.value}</li>`)}
  //     </ul>
  //   </div>
  //   `;
  // }
  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  } 
  return pillsLine(pills);
}

/**
 * @param {ApiArrayShape} schema
 * @return {TemplateResult|string} The template for the details of the Array schema
 */
function arrayDetailsTemplate(schema) {
  const { readOnly, writeOnly, uniqueItems, defaultValueStr, deprecated, customDomainProperties, items } = schema;
  const result = [];
  const pills = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  } else if (items && items.defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', items.defaultValueStr));
  }
  if (uniqueItems) {
    result.push(tablePropertyTemplate('Unique items', 'true'));
  }
  if (items && items.types && items.types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
    const scalar = /** @type ApiScalarShape */ (schema);
    if (scalar.format) {
      result.push(tablePropertyTemplate('Format', scalar.format));
    }
    if (scalar.pattern) {
      result.push(tablePropertyTemplate('Pattern', scalar.pattern));
    }
    if (typeof scalar.minimum === 'number') {
      result.push(tablePropertyTemplate('Minimum', String(scalar.minimum)));
    }
    if (typeof scalar.maximum === 'number') {
      result.push(tablePropertyTemplate('Maximum', String(scalar.maximum)));
    }
    if (typeof scalar.minLength === 'number') {
      result.push(tablePropertyTemplate('Minimum length', String(scalar.minLength)));
    }
    if (typeof scalar.maxLength === 'number') {
      result.push(tablePropertyTemplate('Maximum length', String(scalar.maxLength)));
    }
  }
  
  if (readOnly || (items && items.readOnly)) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly || (items && items.writeOnly)) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated || (items && items.deprecated)) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }
  // if (examples.length) {
  //   result[result.length] = html`
  //   <div class="schema-property-item">
  //     <div class="schema-property-label example">Examples:</div>
  //     <ul class="example-items">
  //       ${examples.map((item) => html`<li>${item.value}</li>`)}
  //     </ul>
  //   </div>
  //   `;
  // }
  if (items && items.values.length) {
    result[result.length] = enumValuesTemplate(items.values);
  }
  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  } 
  return pillsLine(pills);
}

/**
 * @param {ApiRecursiveShape} schema
 * @return {TemplateResult|string} The template for the recursive shape.
 */
function recursiveDetailsTemplate(schema) {
  const { readOnly, writeOnly, defaultValueStr, deprecated, customDomainProperties, } = schema;
  const result = [];
  const pills = [];
  pills.push(pillTemplate('Recursive', 'This property is is recursive.', ['warning']));
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }
  
  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  } 
  return pillsLine(pills);
}

/**
 * @param {ApiUnionShape} schema
 * @return {TemplateResult|string} The template for the details of the Union schema
 */
export function unionDetailsTemplate(schema) {
  const { readOnly, writeOnly, defaultValueStr, deprecated, customDomainProperties } = schema;
  const result = [];
  const pills = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }
  // if (examples.length) {
  //   result[result.length] = html`
  //   <div class="schema-property-item">
  //     <div class="schema-property-label example">Examples:</div>
  //     <ul class="example-items">
  //       ${examples.map((item) => html`<li>${item.value}</li>`)}
  //     </ul>
  //   </div>
  //   `;
  // }
  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
    // return html`${result}`;
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  } 
  return pillsLine(pills);
}

/**
 * @param {ApiFileShape} schema
 * @param {boolean=} noDetail When true it always render all properties, without the detail element.
 * @return {TemplateResult|string} The template for the details of the File schema
 */
export function fileDetailsTemplate(schema, noDetail) {
  const { customDomainProperties=[], values=[], defaultValueStr, format, maxLength, maximum, minLength, minimum, multipleOf, pattern, readOnly, writeOnly, fileTypes, deprecated } = schema;
  const result = [];
  const pills = [];
  if (defaultValueStr) {
    result.push(tablePropertyTemplate('Default value', defaultValueStr));
  }
  if (fileTypes && fileTypes.length) {
    result.push(tablePropertyTemplate('File types', fileTypes.join(', ')));
  }
  if (readOnly) {
    pills.push(pillTemplate('Read only', 'This property is read only.'));
  }
  if (writeOnly) {
    pills.push(pillTemplate('Write only', 'This property is write only.'));
  }
  if (deprecated) {
    pills.push(pillTemplate('Deprecated', 'This property is marked as deprecated.', ['warning']));
  }
  if (format) {
    result.push(tablePropertyTemplate('Format', format));
  }
  if (pattern) {
    result.push(tablePropertyTemplate('Name pattern', pattern));
  }
  if (typeof minimum === 'number') {
    result.push(tablePropertyTemplate('Minimum size', String(minimum)));
  }
  if (typeof maximum === 'number') {
    result.push(tablePropertyTemplate('Maximum size', String(maximum)));
  }
  if (typeof minLength === 'number') {
    result.push(tablePropertyTemplate('Minimum length', String(minLength)));
  }
  if (typeof maxLength === 'number') {
    result.push(tablePropertyTemplate('Maximum length', String(maxLength)));
  }
  if (typeof multipleOf === 'number') {
    result.push(tablePropertyTemplate('Multiple of', String(multipleOf)));
  }
  if (values.length) {
    result[result.length] = enumValuesTemplate(values);
  }
  // if (examples.length) {
  //   result[result.length] = html`
  //   <div class="schema-property-item">
  //     <div class="schema-property-label example">Examples:</div>
  //     <ul class="example-items">
  //       ${examples.map((item) => html`<li>${item.value}</li>`)}
  //     </ul>
  //   </div>
  //   `;
  // }
  if (Array.isArray(customDomainProperties) && customDomainProperties.length) {
    result[result.length] = html`<api-annotation-document .customProperties="${customDomainProperties}"></api-annotation-document>`;
  }
  if (noDetail && result.length) {
    return pillsAndTable(pills, result);
  }
  if (result.length && result.length < 3) {
    return pillsAndTable(pills, result);
  }
  if (result.length) {
    return html`
    ${pillsLine(pills)}
    ${detailSectionTemplate(result)}
    `;
    // return detailSectionTemplate(result);
  } 
  return pillsLine(pills);
}

/**
 * @param {ApiShapeUnion} schema The schema definition.
 * @return {TemplateResult|string} The template for the property details.
 */
export function detailsTemplate(schema) {
  if (!schema) {
    return '';
  }
  const { types } = schema;
  if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
    return scalarDetailsTemplate(/** @type ApiScalarShape */ (schema));
  }
  if (types.includes(ns.w3.shacl.NodeShape)) {
    return nodeDetailsTemplate(/** @type ApiNodeShape */ (schema));
  }
  if (types.includes(ns.aml.vocabularies.shapes.ArrayShape)) {
    return arrayDetailsTemplate(/** @type ApiArrayShape */ (schema));
  }
  if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
    return unionDetailsTemplate(/** @type ApiUnionShape */ (schema));
  }
  if (types.includes(ns.aml.vocabularies.shapes.FileShape)) {
    return fileDetailsTemplate(/** @type ApiFileShape */ (schema));
  }
  if (types.includes(ns.aml.vocabularies.shapes.RecursiveShape)) {
    return recursiveDetailsTemplate(/** @type ApiRecursiveShape */ (schema));
  }
  return ''
}

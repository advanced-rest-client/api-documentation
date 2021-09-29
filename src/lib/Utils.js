import { ns } from '@api-components/amf-helper-mixin';

/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiTupleShape} ApiTupleShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiParameter} ApiParameter */
/** @typedef {import('@api-components/amf-helper-mixin').ApiPropertyShape} ApiPropertyShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiNodeShape} ApiNodeShape */
/** @typedef {import('../types').OperationParameter} OperationParameter */

/**
 * @param {string[]} types Shape's types
 */
export function isScalarType(types=[]) {
  const { shapes } = ns.aml.vocabularies;
  return types.includes(shapes.ScalarShape) || 
    types.includes(shapes.NilShape) ||
    types.includes(shapes.FileShape);
}

/**
 * @param {string} value The value from the graph model to use to read the value from
 */
export function schemaToType(value) {
  const typed = String(value);
  let index = typed.lastIndexOf('#');
  if (index === -1) {
    index = typed.lastIndexOf('/');
  }
  let v = typed.substr(index + 1);
  if (v) {
    v = `${v[0].toUpperCase()}${v.substr(1)}`
  }
  return v;
}

/**
 * Reads the label for a data type for a shape union.
 * @param {ApiShapeUnion} schema
 * @param {boolean=} [isArray] Used internally
 * @returns {string|undefined} Computed label for a shape.
 */
export function readPropertyTypeLabel(schema, isArray=false) {
  if (!schema) {
    return undefined;
  }
  const { types } = schema;
  if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
    const scalar = /** @type ApiScalarShape */ (schema);
    return schemaToType(scalar.dataType || '');
  }
  if (types.includes(ns.aml.vocabularies.shapes.TupleShape)) {
    const array = /** @type ApiTupleShape */ (schema);
    if (!array.items || !array.items.length) {
      return undefined;
    }
    const label = readPropertyTypeLabel(array.items[0], true);
    return `List of ${label}`;
  }
  if (types.includes(ns.aml.vocabularies.shapes.ArrayShape)) {
    const array = /** @type ApiArrayShape */ (schema);
    if (!array.items) {
      return undefined;
    }
    let label = readPropertyTypeLabel(array.items, true);
    if (label === 'items' && !isScalarType(array.items.types)) {
      label = 'objects';
    }
    return `List of ${label}`;
  }
  if (types.includes(ns.w3.shacl.NodeShape)) {
    let { name } = /** @type ApiNodeShape */ (schema);
    const { properties } = /** @type ApiNodeShape */ (schema);
    if (isArray && properties && properties.length === 1) {
      const potentialScalar = /** @type ApiScalarShape */ (properties[0].range);
      if (potentialScalar.types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
        return schemaToType(potentialScalar.dataType || '');
      }
    }
    if (name === 'type') {
      // AMF seems to put `type` value into a property that is declared inline (?).
      name = undefined;
    }
    return name || 'Object';
  }
  if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
    const union = /** @type ApiUnionShape */ (schema);
    const items = union.anyOf.map(i => readPropertyTypeLabel(i));
    return items.join(' or ');
  }
  if (types.includes(ns.aml.vocabularies.shapes.FileShape)) {
    return 'File';
  }
  return schema.name || 'Unknown';
}

/**
 * @param {ApiShapeUnion[]} shapes
 * @returns {boolean} true when all of passed shapes are scalar.
 */
function isAllScalar(shapes=[]) {
  return !shapes.some(i => !isScalarType(i.types));
}

/**
 * @param {ApiUnionShape} shape
 * @returns {boolean} true when the passed union type consists of scalar values only. Nil counts as scalar.
 */
export function isScalarUnion(shape) {
  const { anyOf=[], or=[], and=[], xone=[] } = shape;
  if (anyOf.length) {
    return isAllScalar(anyOf);
  }
  if (or.length) {
    return isAllScalar(or);
  }
  if (and.length) {
    return isAllScalar(and);
  }
  if (xone.length) {
    return isAllScalar(xone);
  }
  return true;
}

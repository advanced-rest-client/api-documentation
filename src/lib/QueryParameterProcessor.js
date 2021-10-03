/* eslint-disable class-methods-use-this */
import { ns } from '@api-components/amf-helper-mixin';

/** @typedef {import('@api-components/amf-helper-mixin').ApiNodeShape} ApiNodeShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiArrayShape} ApiArrayShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiUnionShape} ApiUnionShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiScalarShape} ApiScalarShape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiParameter} ApiParameter */
/** @typedef {import('@api-components/amf-helper-mixin').ApiPropertyShape} ApiPropertyShape */
/** @typedef {import('../types').OperationParameter} OperationParameter */

/**
 * A library to create a list of ApiParameters from a query string value.
 */
export class QueryParameterProcessor {
  /**
   * @param {ApiShapeUnion} schema
   * @param {string} binding The parameter binding.
   * @param {string=} source Optional parameter source.
   * @returns {OperationParameter[]}
   */
  collectOperationParameters(schema, binding, source) {
    let result = [];
    if (!schema) {
      return result;
    }
    const { types } = schema;
    if (types.includes(ns.aml.vocabularies.shapes.ScalarShape)) {
      result.push(this.scalarShapeOperationParameter(/** @type ApiScalarShape */ (schema), binding, source));
    } else if (types.includes(ns.w3.shacl.NodeShape)) {
      const params = this.nodeShapeOperationParameter(/** @type ApiNodeShape */ (schema), binding, source);
      result = result.concat(params);
    } else if (types.includes(ns.aml.vocabularies.shapes.ArrayShape)) {
      const arrResult = this.arrayShapeOperationParameter(/** @type ApiArrayShape */ (schema), binding, source);
      if (Array.isArray(arrResult)) {
        result = result.concat(arrResult);
      } else if (arrResult) {
        result.push(arrResult);
      }
    } else if (types.includes(ns.aml.vocabularies.shapes.UnionShape)) {
      const params = this.unionShapeOperationParameter(/** @type ApiUnionShape */ (schema), binding, source);
      if (params) {
        result = result.concat(params);
      }
    }
    return result;
  }

  /**
   * @param {ApiScalarShape} shape
   * @param {string} binding The parameter binding.
   * @param {string=} source Optional parameter source.
   * @returns {OperationParameter}
   */
  scalarShapeOperationParameter(shape, binding, source) {
    const { id, name } = shape;
    const constructed = /** @type ApiParameter */ ({
      id,
      binding,
      schema: shape,
      name,
      examples: [],
      payloads: [],
      types: [ns.aml.vocabularies.apiContract.Parameter],
      required: false,
    });
    return {
      binding,
      paramId: id,
      parameter: constructed,
      source,
      schemaId: id,
      // @ts-ignore
      schema: shape,
    };
  }

  /**
   * @param {ApiNodeShape} shape
   * @param {string} binding The parameter binding.
   * @param {string=} source Optional parameter source.
   * @returns {OperationParameter[]}
   */
  nodeShapeOperationParameter(shape, binding, source) {
    const result = [];
    const { properties=[] } = shape;
    if (!properties.length) {
      return result;
    }
    properties.forEach((prop) => {
      result.push(this.parameterOperationParameter(prop, binding, source));
    });
    return result;
  }

  /**
   * @param {ApiPropertyShape} property The property to build the parameter for.
   * @param {string} binding The parameter binding.
   * @param {string=} source Optional parameter source.
   * @returns {OperationParameter}
   */
  parameterOperationParameter(property, binding, source) {
    const { id, range, name, minCount } = property;
    const constructed = /** @type ApiParameter */ ({
      id,
      binding,
      schema: range,
      name,
      examples: [],
      payloads: [],
      types: [ns.aml.vocabularies.apiContract.Parameter],
      required: minCount > 0,
    });
    return {
      binding,
      paramId: id,
      parameter: constructed,
      source,
      schemaId: property.id,
      schema: range,
    };
  }

  /**
   * @param {ApiArrayShape} shape
   * @param {string} binding The parameter binding.
   * @param {string=} source Optional parameter source.
   * @returns {OperationParameter|OperationParameter[]}
   */
  arrayShapeOperationParameter(shape, binding, source) {
    const target = shape.items || shape;
    if (target.types.includes(ns.w3.shacl.NodeShape)) {
      const typed = /** @type ApiNodeShape */ (shape.items);
      return this.collectOperationParameters(typed, binding, source);
    }
    const { id, name,  } = target;
    const constructed = /** @type ApiParameter */ ({
      id,
      binding,
      schema: shape,
      name,
      examples: [],
      payloads: [],
      types: [ns.aml.vocabularies.apiContract.Parameter],
      required: false,
    });
    return {
      binding,
      paramId: id,
      parameter: constructed,
      source,
      schemaId: id,
      schema: shape,
    };
  }

  /**
   * @param {ApiUnionShape} shape
   * @param {string} binding The parameter binding.
   * @param {string=} source Optional parameter source.
   * @returns {OperationParameter[]|undefined}
   */
  unionShapeOperationParameter(shape, binding, source) {
    const { anyOf=[], or=[], and=[], xone=[] } = shape;
    if (and.length) {
      let result = [];
      and.forEach((item) => {
        const itemResult = this.collectOperationParameters(item, binding, source);
        if (itemResult) {
          result = result.concat(itemResult);
        }
      });
      return result;
    }
    const info = anyOf[0] || or[0] || xone[0];
    if (!info) {
      return undefined;
    }
    return this.collectOperationParameters(info, binding, source);
  }
}

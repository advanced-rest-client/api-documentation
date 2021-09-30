/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
import { AmfHelperMixin, AmfSerializer } from '@api-components/amf-helper-mixin';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').EndPoint} EndPoint */
/** @typedef {import('@api-components/amf-helper-mixin').Operation} Operation */
/** @typedef {import('@api-components/amf-helper-mixin').ApiOperation} ApiOperation */
/** @typedef {import('@api-components/amf-helper-mixin').ApiEndPoint} ApiEndPoint */
/** @typedef {import('@api-components/amf-helper-mixin').Payload} Payload */
/** @typedef {import('@api-components/amf-helper-mixin').ApiPayload} ApiPayload */
/** @typedef {import('@api-components/amf-helper-mixin').SecurityRequirement} SecurityRequirement */
/** @typedef {import('@api-components/amf-helper-mixin').ApiSecurityRequirement} ApiSecurityRequirement */
/** @typedef {import('@api-components/amf-helper-mixin').Shape} Shape */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@api-components/amf-helper-mixin').CreativeWork} CreativeWork */
/** @typedef {import('@api-components/amf-helper-mixin').ApiDocumentation} ApiDocumentation */
/** @typedef {import('@api-components/amf-helper-mixin').WebApi} WebApi */
/** @typedef {import('@api-components/amf-helper-mixin').Response} Response */

/**
 * @typedef EndpointOperation
 * @property {EndPoint} endpoint
 * @property {Operation} operation
 */

export class AmfLoader extends AmfHelperMixin(Object) {
  /**
   * Reads AMF graph model as string
   * @param {boolean=} [compact='false']
   * @param {string=} [fileName='demo-api']
   * @returns {Promise<AmfDocument>} 
   */
  async getGraph(compact=false, fileName='demo-api') {
    const suffix = compact ? '-compact' : '';
    const file = `${fileName}${suffix}.json`;
    const url = `${window.location.protocol}//${window.location.host}/demo/models/${file}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Unable to download API data model');
    }
    let result = await  response.json();
    if (Array.isArray(result)) {
      [result] = result;
    }
    return result;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} path
   * @return {EndPoint}
   */
  lookupEndpoint(model, path) {
    this.amf = model;
    const webApi = this._computeWebApi(model);
    return this._computeEndpointByPath(webApi, path);
  }

  /**
   * @param {AmfDocument} model
   * @param {string} path
   * @return {ApiEndPoint}
   */
  getEndpoint(model, path) {
    const op = this.lookupEndpoint(model, path);
    if (!op) {
      throw new Error(`Unknown endpoint for path ${path}`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.endPoint(op);
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {Operation}
   */
  lookupOperation(model, endpoint, operation) {
    const endPoint = this.lookupEndpoint(model, endpoint);
    const opKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    const ops = this._ensureArray(endPoint[opKey]);
    return ops.find((item) => this._getValue(item, this.ns.aml.vocabularies.apiContract.method) === operation);
  }

  /**
   * @param {AmfDocument} model
   * @param {string} path
   * @param {string} operation
   * @return {EndpointOperation}
   */
  lookupEndpointOperation(model, path, operation) {
    const endpoint = this.lookupEndpoint(model, path);
    const opKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation);
    const ops = this._ensureArray(endpoint[opKey]);
    const op = ops.find((item) => this._getValue(item, this.ns.aml.vocabularies.apiContract.method) === operation);
    return {
      endpoint, 
      operation: op,
    };
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {ApiOperation}
   */
  getOperation(model, endpoint, operation) {
    const op = this.lookupOperation(model, endpoint, operation);
    if (!op) {
      throw new Error(`Unknown ${operation} operation for path ${endpoint}`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.operation(op);
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {Payload[]}
   */
  lookupPayloads(model, endpoint, operation) {
    const op = this.lookupOperation(model, endpoint, operation);
    const expects = this._computeExpects(op);
    let payloads = this._computePayload(expects);
    if (payloads && !Array.isArray(payloads)) {
      payloads = [payloads];
    }
    return payloads;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {ApiPayload[]}
   */
  getPayloads(model, endpoint, operation) {
    const payloads = this.lookupPayloads(model, endpoint, operation);
    if (!payloads) {
      throw new Error(`No payloads for path ${endpoint} and operation ${operation}`);
    }
    const serializer = new AmfSerializer(model);
    return payloads.map(i => serializer.payload(i));
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {SecurityRequirement}
   */
  lookupSecurity(model, name) {
    this.amf = model;
    const webApi = this._hasType(model, this.ns.aml.vocabularies.document.Document) ?
      this._computeApi(model) :
      model;
    const declares = this._computeDeclares(webApi) || [];
    let security = declares.find((item) => {
      if (Array.isArray(item)) {
        [item] = item;
      }
      const result = this._getValue(item, this.ns.aml.vocabularies.core.name) === name;
      if (result) {
        return result;
      }
      return this._getValue(item, this.ns.aml.vocabularies.security.name) === name;
    });
    if (Array.isArray(security)) {
      [security] = security;
    }
    if (!security) {
      const references = this._computeReferences(model) || [];
      for (let i = 0, len = references.length; i < len; i++) {
        if (!this._hasType(references[i], this.ns.aml.vocabularies.document.Module)) {
          continue;
        }
        security = this.lookupSecurity(references[i], name);
        if (security) {
          break;
        }
      }
    }
    return security;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} name 
   * @return {ApiSecurityRequirement}
   */
  getSecurity(model, name) {
    const security = this.lookupSecurity(model, name);
    if (!security) {
      throw new Error(`No security named ${name}`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.securityRequirement(security);
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {Shape}
   */
  lookupShape(model, name) {
    let amf = model;
    if (Array.isArray(amf)) {
      [amf] = amf;
    }
    this.amf = amf;
    const declares = (this._computeDeclares(amf) || []);
    let shape = declares.find((item) => {
      if (Array.isArray(item)) {
        [item] = item;
      }
      return this._getValue(item, this.ns.w3.shacl.name) === name;
    });
    if (Array.isArray(shape)) {
      [shape] = shape;
    }
    if (!shape) {
      const references = this._computeReferences(model) || [];
      for (let i = 0, len = references.length; i < len; i++) {
        if (!this._hasType(references[i], this.ns.aml.vocabularies.document.Module)) {
          continue;
        }
        shape = this.lookupShape(references[i], name);
        if (shape) {
          break;
        }
      }
    }
    return shape;
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {ApiShapeUnion}
   */
  getShape(model, name) {
    const shape = this.lookupShape(model, name);
    if (!shape) {
      throw new Error(`No API shape named ${name}`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.unknownShape(shape);
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {CreativeWork}
   */
  lookupDocumentation(model, name) {
    this.amf = model;
    const webApi = this._computeApi(model);
    const key = this._getAmfKey(this.ns.aml.vocabularies.core.documentation);
    const docs = this._ensureArray(webApi[key]);
    return docs.find((item) => {
      if (Array.isArray(item)) {
        [item] = item;
      }
      return this._getValue(item, this.ns.aml.vocabularies.core.title) === name;
    });
  }

  /**
   * @param {AmfDocument} model 
   * @param {string} name 
   * @returns {ApiDocumentation}
   */
  getDocumentation(model, name) {
    const shape = this.lookupDocumentation(model, name);
    if (!shape) {
      throw new Error(`No documentation named ${name}`);
    }
    const serializer = new AmfSerializer(model);
    return serializer.documentation(shape);
  }

  /**
   * @param {AmfDocument} model 
   * @returns {WebApi}
   */
  lookupEncodes(model) {
    if (Array.isArray(model)) {
      [model] = model;
    }
    this.amf = model;
    const key = this._getAmfKey(this.ns.aml.vocabularies.document.encodes);
    let result = model[key];
    if (Array.isArray(result)) {
      [result] = result;
    }
    return result;
  }

  /**
   * @param {AmfDocument} model
   * @param {string} endpoint
   * @param {string} operation
   * @return {Response[]}
   */
  lookupResponses(model, endpoint, operation) {
    const method = this.lookupOperation(model, endpoint, operation);
    return this._computeReturns(method);
  }
}

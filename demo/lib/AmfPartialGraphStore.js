/* eslint-disable no-param-reassign */
import { AmfHelperMixin } from '@api-components/amf-helper-mixin';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */
/** @typedef {import('@api-components/amf-helper-mixin').Api} Api */
/** @typedef {import('@api-components/amf-helper-mixin').EndPoint} EndPoint */
/** @typedef {import('@api-components/amf-helper-mixin').Operation} Operation */

export class AmfPartialGraphStore extends AmfHelperMixin(Object) {
  /**
   * @param {AmfDocument=} graph The full API model.
   */
  constructor(graph) {
    super();
    let amf = graph;
    if (Array.isArray(graph)) {
      [amf] = graph;
    }
    if (amf) {
      this.amf = amf;
    }
  }

  /**
   * @returns {DomainElement} The API base definition 
   */
  summary() {
    const { amf, ns } = this;
    if (!amf) {
      return null;
    }
    const result = {};
    result['@id'] = amf['@id'];
    result['@type'] = amf['@type'];
    if (amf['@context']) {
      result['@context'] = amf['@context'];
    }
    const declaresKey = this._getAmfKey(ns.aml.vocabularies.document.declares);
    const declares = this.summaryDeclares(amf[declaresKey]);
    if (declares) {
      result[declaresKey] = declares;
    }
    const encodesKey = this._getAmfKey(ns.aml.vocabularies.document.encodes);
    const encodes = this.summaryEncodes(amf[encodesKey]);
    if (encodes) {
      result[encodesKey] = encodes;
    }
    const referencesKey = this._getAmfKey(ns.aml.vocabularies.document.references);
    const references = this.summaryReferences(amf[referencesKey]);
    if (references) {
      result[referencesKey] = references;
    }
    return JSON.parse(JSON.stringify(result));
  }

  /**
   * @param {DomainElement[]} declares
   * @returns {DomainElement[]}
   */
  summaryDeclares(declares) {
    if (!Array.isArray(declares) || !declares.length) {
      return null;
    }
    const { ns } = this;
    const closedKey = this._getAmfKey(ns.w3.shacl.closed);
    const nameKey = this._getAmfKey(ns.w3.shacl.name);
    const coreNameKey = this._getAmfKey(ns.aml.vocabularies.core.name);
    const descKey = this._getAmfKey(ns.aml.vocabularies.core.description);
    const examplesKey = this._getAmfKey(ns.aml.vocabularies.apiContract.examples);
    const dataNodeKey = this._getAmfKey(ns.aml.vocabularies.document.dataNode);
    const variableKey = this._getAmfKey(ns.aml.vocabularies.document.variable);
    const smKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources);
    const securitySchemeKey = this._getAmfKey(ns.aml.vocabularies.security.SecurityScheme);
    const result = [];
    const allowedKeys = ['@id', '@type', closedKey, nameKey, coreNameKey, descKey];
    declares.forEach((item) => {
      if (item['@type'].includes(securitySchemeKey)) {
        result.push(this.summarySecurity(item));
        return;
      }
      const cp = { };
      allowedKeys.forEach((key) => {
        if (key in item) {
          cp[key] = item[key];
        }
      });
      const sm = this.sourceMap(item[smKey]);
      if (sm) {
        cp[smKey] = sm;
      }
      if (examplesKey in item) {
        cp[examplesKey] = item[examplesKey].map(example => ({ '@id': example['@id'] }));
      }
      if (dataNodeKey in item) {
        cp[dataNodeKey] = item[dataNodeKey].map(dn => ({ '@id': dn['@id'] }));
      }
      if (variableKey in item) {
        cp[variableKey] = item[variableKey].map(variable => variable['@value']);
      }
      result.push(cp);
    });
    return result;
  }

  /**
   * @param {DomainElement[]} encodes
   * @returns {Api[]}
   */
  summaryEncodes(encodes) {
    if (!Array.isArray(encodes) || !encodes.length) {
      return null;
    }
    const { ns } = this;
    const result = [];
    const acceptsKey = this._getAmfKey(ns.aml.vocabularies.apiContract.accepts);
    const contentTypeKey = this._getAmfKey(ns.aml.vocabularies.apiContract.contentType);
    const mediaTypeKey = this._getAmfKey(ns.aml.vocabularies.core.mediaType);
    const schemeKey = this._getAmfKey(ns.aml.vocabularies.apiContract.scheme);
    const serverKey = this._getAmfKey(ns.aml.vocabularies.apiContract.server);
    const endpointKey = this._getAmfKey(ns.aml.vocabularies.apiContract.endpoint);
    const descKey = this._getAmfKey(ns.aml.vocabularies.core.description);
    const nameKey = this._getAmfKey(ns.aml.vocabularies.core.name);
    const versionKey = this._getAmfKey(ns.aml.vocabularies.core.version);
    const smKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources);
    const allowedKeys = ['@id', '@type', acceptsKey, contentTypeKey, schemeKey, descKey, nameKey, versionKey, mediaTypeKey];

    encodes.forEach((item) => {
      const cp = {};
      allowedKeys.forEach((key) => {
        if (key in item) {
          cp[key] = item[key];
        }
      });
      const sm = this.sourceMap(item[smKey]);
      if (sm) {
        cp[smKey] = sm;
      }
      if (serverKey in item) {
        cp[serverKey] = item[serverKey].map((server) => {
          const srv = { ...server };
          const srvSm = this.sourceMap(srv[smKey]);
          if (srvSm) {
            srv[smKey] = srvSm;
          }
          return srv;
        });
      }
      if (Array.isArray(item[endpointKey])) {
        cp[endpointKey] = item[endpointKey].map(endpoint => this.summaryEndpoint(endpoint));
      }
      result.push(cp);
    });
    return result;
  }

  /**
   * @param {DomainElement[]} references
   * @returns {DomainElement[]}
   */
  summaryReferences(references) {
    if (!Array.isArray(references) || !references.length) {
      return null;
    }
    const result = [];

    const { ns } = this;
    const rootKey = this._getAmfKey(ns.aml.vocabularies.document.root);
    const usageKey = this._getAmfKey(ns.aml.vocabularies.document.usage);
    const versionKey = this._getAmfKey(ns.aml.vocabularies.document.version);
    const smKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources);
    const allowedKeys = ['@id', '@type', rootKey, usageKey, versionKey];
    
    const encodesKey = this._getAmfKey(ns.aml.vocabularies.document.encodes);
    const declaresKey = this._getAmfKey(ns.aml.vocabularies.document.declares);
    const referencesKey = this._getAmfKey(ns.aml.vocabularies.document.references);

    references.forEach((item) => {
      const unit = {};
      allowedKeys.forEach((key) => {
        if (key in item) {
          unit[key] = item[key];
        }
      });
      const sm = this.sourceMap(item[smKey]);
      if (sm) {
        unit[smKey] = sm;
      }
      const declares = this.summaryDeclares(item[declaresKey]);
      if (declares) {
        unit[declaresKey] = declares;
      }
      const encodes = this.summaryEncodes(item[encodesKey]);
      if (encodes) {
        unit[encodesKey] = encodes;
      }
      const refs = this.summaryReferences(item[referencesKey]);
      if (refs) {
        result[referencesKey] = refs;
      }
      result.push(unit);
    });
    return result;
  }

  /**
   * @param {EndPoint} endpoint
   * @returns {EndPoint}
   */
  summaryEndpoint(endpoint) {
    const { ns } = this;
    const pathKey = this._getAmfKey(ns.aml.vocabularies.apiContract.path);
    const operationsKey = this._getAmfKey(ns.aml.vocabularies.apiContract.supportedOperation);
    const smKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources);
    const allowedKeys = ['@id', '@type', pathKey];
    const result = /** @type EndPoint */ ({ '@id': '', '@type': [] });
    allowedKeys.forEach((key) => {
      if (key in endpoint) {
        result[key] = endpoint[key];
      }
    });
    const sm = this.sourceMap(endpoint[smKey]);
    if (sm) {
      result[smKey] = sm;
    }
    if (Array.isArray(endpoint[operationsKey])) {
      result[operationsKey] = endpoint[operationsKey].map(op => this.summaryOperation(op));
    }
    return result;
  }

  /**
   * @param {Operation} operation
   * @returns {Operation}
   */
  summaryOperation(operation) {
    const { ns } = this;
    const methodKey = this._getAmfKey(ns.aml.vocabularies.apiContract.method);
    const expectsKey = this._getAmfKey(ns.aml.vocabularies.apiContract.expects);
    const securityKey = this._getAmfKey(ns.aml.vocabularies.security.security);
    const descKey = this._getAmfKey(ns.aml.vocabularies.core.description);
    const nameKey = this._getAmfKey(ns.aml.vocabularies.core.name);
    const smKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources);
    const allowedKeys = ['@id', '@type', methodKey, nameKey, descKey];
    const result = /** @type Operation */ ({ '@id': '', '@type': [] });
    allowedKeys.forEach((key) => {
      if (key in operation) {
        result[key] = operation[key];
      }
    });
    const sm = this.sourceMap(operation[smKey]);
    if (sm) {
      result[smKey] = sm;
    }
    if (Array.isArray(operation[expectsKey])) {
      result[expectsKey] = operation[expectsKey].map(i => ({ '@id': i['@id'] }));
    }
    if (Array.isArray(operation[securityKey])) {
      result[securityKey] = operation[securityKey].map(i => ({ '@id': i['@id'] }));
    }
    return result;
  }

  /**
   * @param {DomainElement[]} items
   */
  sourceMap(items) {
    if (!Array.isArray(items) || !items.length) {
      return null;
    }
    const { ns } = this;
    const result = [];
    const lexicalKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.lexical);
    const declaredElementKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.declaredElement);
    const elementKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.element);
    const trackedElementKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.trackedElement);
    const valueKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.value);
    const synthesizedFieldKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.synthesizedField);
    const allowedKeys = ['@id', lexicalKey, declaredElementKey, elementKey, trackedElementKey, valueKey, synthesizedFieldKey];
    items.forEach((item) => {
      const cp = { };
      allowedKeys.forEach((key) => {
        if (key in item) {
          if (key === lexicalKey) {
            cp[key] = item[key].map((field) => this._getValue(field, valueKey));
            return;
          }
          if (key === declaredElementKey) {
            cp[key] = item[key].map((field) => this._getValue(field, elementKey));
            return;
          }
          if (key === trackedElementKey) {
            cp[key] = item[key].map((field) => this._getValue(field, valueKey));
            return;
          }
          cp[key] = item[key];
        }
      });
      result.push(cp);
    });
    return result;
  }

  /**
   * @param {DomainElement} security
   * @returns {DomainElement}
   */
  summarySecurity(security) {
    const { ns } = this;
    const coreNameKey = this._getAmfKey(ns.aml.vocabularies.core.name);
    const coreDisplayNameKey = this._getAmfKey(ns.aml.vocabularies.core.displayName);
    const descKey = this._getAmfKey(ns.aml.vocabularies.core.description);
    const typeKey = this._getAmfKey(ns.aml.vocabularies.security.type);
    const smKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources);
    const allowedKeys = ['@id', '@type', coreNameKey, coreDisplayNameKey, descKey, typeKey];

    const result = /** @type DomainElement */ ({});
    Object.keys(security).forEach((key) => {
      if (allowedKeys.includes(key)) {
        result[key] = security[key];
        return;
      }
      if (key === smKey) {
        result[smKey] = this.sourceMap(security[key]);
        return;
      }
      if (Array.isArray(security[key])) {
        const values = [];
        security[key].forEach((value) => {
          if (typeof value === 'object' && value['@id']) {
            values.push(value['@id']);
          }
        });
        if (values.length) {
          result[key] = values;
        }
      }
    });

    return result;
  }

  /**
   * @param {string} domainId
   * @param {object} context
   * @returns {DomainElement|undefined} Model definition for a type.
   */
  endpoint(domainId, context) {
    const webApi = this._computeApi(this.amf);
    const ep = this._computeEndpointModel(webApi, domainId);
    if (!ep) {
      return undefined;
    }
    const result = { ...ep };
    const { ns } = this;
    const smKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources);
    const operationsKey = this._getAmfKey(ns.aml.vocabularies.apiContract.supportedOperation);
    const sm = this.sourceMap(result[smKey]);
    if (sm) {
      result[smKey] = sm;
    }
    if (Array.isArray(result[operationsKey])) {
      result[operationsKey] = result[operationsKey].map((op) => {
        const item = { ...op };
        const opSm = this.sourceMap(item[smKey]);
        if (opSm) {
          item[smKey] = opSm;
        }
        return item;
      });
    }
    if (context) {
      result['@context'] = context;
    }
    return JSON.parse(JSON.stringify(result));
  }

  /**
   * @param {string} domainId
   * @param {object} context
   * @returns {DomainElement|undefined} Model definition for a type.
   */
  schema(domainId, context) {
    const schema = this.computeTypeApiModel(this.amf, domainId);
    if (!schema) {
      return undefined;
    }
    const result = { ...schema };
    const { ns } = this;
    const propertyKey = this._getAmfKey(ns.w3.shacl.property);
    const smKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources);
    const sm = this.sourceMap(result[smKey]);
    if (sm) {
      result[smKey] = sm;
    }
    if (Array.isArray(result[propertyKey])) {
      result[propertyKey] = result[propertyKey].map(r => this.summaryProperty(r));
    }
    if (context) {
      result['@context'] = context;
    }
    return JSON.parse(JSON.stringify(result));
  }

  /**
   * @param {string} domainId
   * @param {object} context
   * @returns {DomainElement|undefined} Model definition for a type.
   */
  securityRequirement(domainId, context) {
    const schema = this.computeSecurityApiModel(this.amf, domainId);
    if (!schema) {
      return undefined;
    }
    const result = { ...schema };
    const { ns } = this;
    const smKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources);
    const sm = this.sourceMap(result[smKey]);
    if (sm) {
      result[smKey] = sm;
    }
    if (context) {
      result['@context'] = context;
    }
    return JSON.parse(JSON.stringify(result));
  }

  /**
   * @param {DomainElement} property
   * @returns {DomainElement}
   */
  summaryProperty(property) {
    const result = {...property};
    const { ns } = this;
    const rangeKey = this._getAmfKey(ns.w3.shacl.property);
    const smKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources);
    const sm = this.sourceMap(result[smKey]);
    if (sm) {
      result[smKey] = sm;
    }
    if (Array.isArray(property[rangeKey])) {
      result[rangeKey] = property[rangeKey].map(r => this.summaryRange(r));
    }
    return result;
  }

  /**
   * @param {DomainElement} property
   * @returns {DomainElement}
   */
  summaryRange(property) {
    const result = {...property};
    const { ns } = this;
    const smKey = this._getAmfKey(ns.aml.vocabularies.docSourceMaps.sources);
    const sm = this.sourceMap(result[smKey]);
    if (sm) {
      result[smKey] = sm;
    }
    return result;
  }

  /**
   * Computes type definition model from web API and current selection.
   * It looks for the definition in both `declares` and `references` properties.
   * Returned value is already resolved AMF model (references are resolved).
   *
   * @param {AmfDocument} model WebApi AMF model. Do not use an array here.
   * @param {string} domainId Currently selected `@id`.
   * @returns {DomainElement|undefined} Model definition for a type.
   */
  computeTypeApiModel(model, domainId) {
    const declares = this._computeDeclares(model);
    const references = this._computeReferences(model);
    return this._computeType(declares, references, domainId);
  }

  /**
   * Computes security scheme definition model from web API and current selection.
   * It looks for the definition in both `declares` and `references` properties.
   * Returned value is already resolved AMF model (references are resolved).
   *
   * @param {AmfDocument} model WebApi AMF model. Do not use an array here.
   * @param {string} domainId Currently selected `@id`.
   * @returns {DomainElement|undefined} Model definition for the security scheme.
   */
  computeSecurityApiModel(model, domainId) {
    const declares = this._computeDeclares(model);
    if (declares) {
      const result = declares.find((item) => item['@id'] === domainId);
      if (result) {
        return this._resolve(result);
      }
    }
    const references = this._computeReferences(model);
    if (Array.isArray(references) && references.length) {
      for (const reference of references) {
        if (this._hasType(reference, this.ns.aml.vocabularies.document.Module)) {
          const result = this.computeReferenceSecurity(reference, domainId);
          if (result) {
            return this._resolve(result);
          }
        } 
      }
    }
    return undefined;
  }

  /**
   * Computes a security model from a reference (library for example).
   * @param {AmfDocument} reference AMF model for a reference to extract the data from
   * @param {string} domainId Node ID to look for
   * @returns {DomainElement|undefined} Type definition or undefined if not found.
   */
  computeReferenceSecurity(reference, domainId) {
    const declare = this._computeDeclares(reference);
    if (!declare) {
      return undefined;
    }
    let result = declare.find((item) => {
      if (Array.isArray(item)) {
        [item] = item;
      }
      return item['@id'] === domainId;
    });
    if (Array.isArray(result)) {
      [result] = result;
    }
    return this._resolve(result);
  }
}

/* eslint-disable no-shadow */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { LitElement } from 'lit-element';

export const AmfLoader = {};

class HelperElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('helper-element', HelperElement);

const helper = new HelperElement();

AmfLoader.load = async (fileName='demo-api', compact=false) => {
  const suffix = compact ? '-compact' : '';
  const file = `${fileName}${suffix}.json`;
  const url = `${window.location.protocol}//${window.location.host}/base/demo/${file}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to download API data model from ${url}`);
  }
  return response.json();
};

AmfLoader.lookupEndpoint = (model, endpoint) => {
  helper.amf = model;
  const webApi = helper._computeApi(model);
  return helper._computeEndpointByPath(webApi, endpoint);
};

AmfLoader.lookupOperation = (model, endpoint, operation) => {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint);
  const opKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) === operation);
};

AmfLoader.lookupPayload = (model, endpoint, operation) => {
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const expects = helper._computeExpects(op);
  return helper._ensureArray(helper._computePayload(expects));
};

AmfLoader.lookupEndpointOperation = (model, endpoint, operation) => {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint);
  const opKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  const op = ops.find((item) => helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) === operation);
  return [endPoint, op];
};

AmfLoader.lookupSecurity = (model, name) => {
  helper.amf = model;
  const webApi = helper._hasType(model, helper.ns.aml.vocabularies.document.Document) ?
    helper._computeApi(model) :
    model;
  const declares = helper._computeDeclares(webApi) || [];
  let result = declares.find((item) => {
    if (item instanceof Array) {
      item = item[0];
    }
    const result = helper._getValue(item, helper.ns.aml.vocabularies.core.name) === name;
    if (result) {
      return result;
    }
    return helper._getValue(item, helper.ns.aml.vocabularies.security.name) === name;
  });
  if (result instanceof Array) {
    result = result[0];
  }
  if (!result) {
    const references = helper._computeReferences(model) || [];
    for (let i = 0, len = references.length; i < len; i++) {
      if (!helper._hasType(references[i], helper.ns.aml.vocabularies.document.Module)) {
        continue;
      }
      result = AmfLoader.lookupSecurity(references[i], name);
      if (result) {
        break;
      }
    }
  }
  return result;
};

AmfLoader.lookupType = (model, name) => {
  helper.amf = model;
  const webApi = helper._hasType(model, helper.ns.aml.vocabularies.document.Document) ?
    helper._computeApi(model) :
    model;
  const declares = helper._computeDeclares(webApi) || [];
  let result = declares.find((item) => {
    if (item instanceof Array) {
      item = item[0];
    }
    return helper._getValue(item, helper.ns.w3.shacl.name) === name;
  });
  if (result instanceof Array) {
    result = result[0];
  }
  if (!result) {
    const references = helper._computeReferences(model) || [];
    for (let i = 0, len = references.length; i < len; i++) {
      if (!helper._hasType(references[i], helper.ns.aml.vocabularies.document.Module)) {
        continue;
      }
      result = AmfLoader.lookupType(references[i], name);
      if (result) {
        break;
      }
    }
  }
  return result;
};

AmfLoader.lookupDocumentation = (model, name) => {
  helper.amf = model;
  const webApi = helper._computeApi(model);
  const key = helper._getAmfKey(helper.ns.aml.vocabularies.core.documentation);
  const docs = helper._ensureArray(webApi[key]);
  return docs.find((item) => {
    if (item instanceof Array) {
      item = item[0];
    }
    return helper._getValue(item, helper.ns.aml.vocabularies.core.title) === name;
  });
};

AmfLoader.lookupEncodes = (model) => {
  if (model instanceof Array) {
    model = model[0];
  }
  helper.amf = model;
  const key = helper._getAmfKey(helper.ns.aml.vocabularies.document.encodes);
  return helper._ensureArray(model[key]);
};

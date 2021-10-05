import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import sinon from 'sinon';
import { AmfLoader } from '../AmfLoader.js';
import '../../api-operation-document.js';
import '../../api-request-document.js';

/** @typedef {import('../../').ApiOperationDocumentElement} ApiOperationDocumentElement */
/** @typedef {import('../../').ApiRequestDocumentElement} ApiRequestDocumentElement */
/** @typedef {import('../../').ApiParameterDocumentElement} ApiParameterDocumentElement */
/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */
/** @typedef {import('@api-components/amf-helper-mixin').Operation} Operation */
/** @typedef {import('@anypoint-web-components/anypoint-tabs').AnypointTabs} AnypointTabs */

describe('ApiOperationDocumentElement', () => {
  const loader = new AmfLoader();

  /**
   * @param {AmfDocument} amf
   * @param {Operation=} shape
   * @returns {Promise<ApiOperationDocumentElement>}
   */
  async function basicFixture(amf, shape) {
    const element = await fixture(html`<api-operation-document 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}" 
      .domainModel="${shape}"
    ></api-operation-document>`);
    await aTimeout(0);
    return /** @type ApiOperationDocumentElement */ (element);
  }

  /**
   * @param {AmfDocument} amf
   * @param {Operation=} shape
   * @returns {Promise<ApiOperationDocumentElement>}
   */
  async function tryItFixture(amf, shape) {
    const element = await fixture(html`<api-operation-document 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}" 
      .domainModel="${shape}"
      tryItButton
    ></api-operation-document>`);
    await aTimeout(0);
    return /** @type ApiOperationDocumentElement */ (element);
  }

  /**
   * @param {AmfDocument} amf
   * @param {Operation=} shape
   * @returns {Promise<ApiOperationDocumentElement>}
   */
  async function snippetsFixture(amf, shape) {
    const element = await fixture(html`<api-operation-document 
      .queryDebouncerTimeout="${0}" 
      renderCodeSnippets
      .amf="${amf}" 
      .domainModel="${shape}"
    ></api-operation-document>`);
    await aTimeout(0);
    return /** @type ApiOperationDocumentElement */ (element);
  }

  /**
   * @param {AmfDocument} amf
   * @param {Operation=} shape
   * @returns {Promise<ApiOperationDocumentElement>}
   */
  async function asyncFixture(amf, shape) {
    const element = await fixture(html`<api-operation-document 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}" 
      .domainModel="${shape}"
      renderCodeSnippets
      asyncApi
    ></api-operation-document>`);
    await aTimeout(0);
    return /** @type ApiOperationDocumentElement */ (element);
  }

  /**
   * @param {AmfDocument} amf
   * @param {Operation=} shape
   * @returns {Promise<ApiOperationDocumentElement>}
   */
  async function securityFixture(amf, shape) {
    const element = await fixture(html`<api-operation-document 
      .queryDebouncerTimeout="${0}" 
      renderSecurity
      .amf="${amf}" 
      .domainModel="${shape}"
    ></api-operation-document>`);
    await aTimeout(0);
    return /** @type ApiOperationDocumentElement */ (element);
  }

  [false, true].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      describe('basic AMF computations', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact);
        });

        /** @type ApiOperationDocumentElement */
        let element;
        beforeEach(async () => {
          const data = loader.lookupOperation(model, '/people', 'get');
          element = await basicFixture(model, data);
        });

        it('sets the operation property', () => {
          const { operation } = element;
          assert.typeOf(operation, 'object', 'has the operation')
          assert.equal(operation.method, 'get', 'has the operation properties')
        });

        it('sets the parent endpoint property', () => {
          const { endpoint } = element;
          assert.typeOf(endpoint, 'object', 'has the endpoint')
          assert.equal(endpoint.path, '/people', 'has the endpoint properties')
        });

        it('sets the list of servers', () => {
          const { servers } = element;
          assert.typeOf(servers, 'array', 'has the servers')
          assert.lengthOf(servers, 1, 'has the only server')
          assert.equal(servers[0].url, 'http://{instance}.domain.com/');
        });

        it('returns the first server in the #server getter', () => {
          const { server } = element;
          assert.typeOf(server, 'object', 'has the server')
          assert.equal(server.url, 'http://{instance}.domain.com/');
        });

        it('computes value for the #snippetsUri getter', () => {
          const { snippetsUri } = element;
          assert.typeOf(snippetsUri, 'string', 'has the snippetsUri')
          assert.equal(snippetsUri, 'http://{instance}.domain.com/people');
        });

        it('computes the list of responses', () => {
          const { responses } = element;
          assert.typeOf(responses, 'array', 'has the responses')
          assert.lengthOf(responses, 2, 'has all responses');
        });

        it('the responses are ordered', () => {
          const { responses } = element;
          const [r1, r2] = responses;
          assert.equal(r1.statusCode, '200');
          assert.equal(r2.statusCode, '400');
        });

        it('pre-selects the response status code', () => {
          const { selectedStatus } = element;
          assert.equal(selectedStatus, '200');
        });

        it('computes the endpoint URI', () => {
          const { endpointUri } = element;
          assert.equal(endpointUri, 'http://{instance}.domain.com/people');
        });
      });

      describe('Data rendering', () => {
        /** @type AmfDocument */
        let demoModel;
        /** @type AmfDocument */
        let asyncModel;
        /** @type AmfDocument */
        let oasCallbacksModel;
        /** @type AmfDocument */
        let petStoreModel;
        before(async () => {
          demoModel = await loader.getGraph(compact);
          asyncModel = await loader.getGraph(compact, 'async-api');
          oasCallbacksModel = await loader.getGraph(compact, 'oas-callbacks');
          petStoreModel = await loader.getGraph(compact, 'Petstore-v2');
        });

        it('renders the operation name, when defined', async () => {
          const data = loader.lookupOperation(demoModel, '/people', 'get');
          const element = await basicFixture(demoModel, data);
          const header = element.shadowRoot.querySelector('.operation-header');
          const label = header.querySelector('.label');
          assert.equal(label.textContent.trim(), 'List people');
        });

        it('renders the operation method, when name not defined', async () => {
          const data = loader.lookupOperation(demoModel, '/orgs/{orgId}', 'put');
          const element = await basicFixture(demoModel, data);
          const header = element.shadowRoot.querySelector('.operation-header');
          const label = header.querySelector('.label');
          assert.equal(label.textContent.trim(), 'put');
        });

        it('renders the operation sub-title for sync API', async () => {
          const data = loader.lookupOperation(demoModel, '/orgs/{orgId}', 'put');
          const element = await basicFixture(demoModel, data);
          const header = element.shadowRoot.querySelector('.operation-header');
          const label = header.querySelector('.sub-header');
          assert.equal(label.textContent.trim(), 'API operation');
        });

        it('renders the operation sub-title for async API', async () => {
          const data = loader.lookupOperation(asyncModel, 'hello', 'publish');
          const element = await asyncFixture(asyncModel, data);
          const header = element.shadowRoot.querySelector('.operation-header');
          const label = header.querySelector('.sub-header');
          assert.equal(label.textContent.trim(), 'Async operation');
        });

        it('renders the operation summary', async () => {
          const data = loader.lookupOperation(petStoreModel, '/pets', 'get');
          const element = await basicFixture(petStoreModel, data);
          const summary = element.shadowRoot.querySelector('.summary');
          assert.ok(summary, 'has the summary');
          assert.equal(summary.textContent.trim(), 'Finds pets by tag');
        });

        it('renders the operation id', async () => {
          const data = loader.lookupOperation(petStoreModel, '/pets', 'get');
          const element = await basicFixture(petStoreModel, data);
          const field = element.shadowRoot.querySelector('.schema-property-item[data-name="operation-id"]');
          assert.ok(field, 'has the operation id label');
          const value = field.querySelector('.schema-property-value');
          assert.equal(value.textContent.trim(), 'findPets');
        });

        it('renders the endpoint URI', async () => {
          const data = loader.lookupOperation(demoModel, '/people/{personId}', 'get');
          const element = await basicFixture(demoModel, data);
          const section = element.shadowRoot.querySelector('.endpoint-url');
          assert.ok(section, 'has the url section');
          const node = section.querySelector('.url-value');
          assert.equal(node.textContent.trim(), 'http://{instance}.domain.com/people/{personId}');
        });

        it('renders the method with the endpoint URI', async () => {
          const data = loader.lookupOperation(demoModel, '/people/{personId}', 'get');
          const element = await basicFixture(demoModel, data);
          const section = element.shadowRoot.querySelector('.endpoint-url');
          assert.ok(section, 'has the url section');
          const node = section.querySelector('.method-label');
          assert.equal(node.textContent.trim(), 'get');
        });

        it('does not render the URI when async API', async () => {
          const data = loader.lookupOperation(asyncModel, 'hello', 'publish');
          const element = await asyncFixture(asyncModel, data);
          const section = element.shadowRoot.querySelector('.endpoint-url');
          assert.notOk(section, 'has no url section');
        });

        it('renders the traits', async () => {
          const data = loader.lookupOperation(demoModel, '/people', 'get');
          const element = await asyncFixture(demoModel, data);
          const section = element.shadowRoot.querySelector('.extensions');
          assert.ok(section, 'has the traits line');
          assert.equal(section.textContent.trim(), 'Mixes in Paginated.', 'has the traits content');
        });

        it('renders the annotations', async () => {
          const data = loader.lookupOperation(demoModel, '/test-parameters/{feature}', 'get');
          const element = await asyncFixture(demoModel, data);
          const section = element.shadowRoot.querySelector('api-annotation-document');
          assert.ok(section, 'has the annotations');
          assert.equal(section.getAttribute('aria-hidden'), 'false', 'renders the content');
        });

        it('renders the request document', async () => {
          const data = loader.lookupOperation(demoModel, '/test-parameters/{feature}', 'get');
          const element = await asyncFixture(demoModel, data);
          const section = /** @type ApiRequestDocumentElement */ (element.shadowRoot.querySelector('api-request-document'));
          assert.ok(section, 'has the request document');
          assert.isTrue(section.amf === demoModel, 'passes the amf model');
          assert.typeOf(section.request, 'object', 'passes the request model');
          assert.typeOf(section.endpoint, 'object', 'passes the endpoint model');
          assert.typeOf(section.server, 'object', 'passes the server model');
        });

        it('renders the deprecated message', async () => {
          const data = loader.lookupOperation(petStoreModel, '/pets', 'get');
          const element = await basicFixture(petStoreModel, data);
          const message = element.shadowRoot.querySelector('.deprecated-message');
          assert.ok(message, 'has the message');
          assert.equal(message.querySelector('.message').textContent.trim(), 'This operation is marked as deprecated.');
        });

        it('renders the callbacks section', async () => {
          const data = loader.lookupOperation(oasCallbacksModel, '/subscribe', 'post');
          const element = await basicFixture(oasCallbacksModel, data);
          const callbacksSection = element.shadowRoot.querySelector('[data-controlled-by="callbacksOpened"]');
          assert.ok(callbacksSection, 'has the message');

          const callbacks = callbacksSection.querySelectorAll('.callback-section');
          assert.lengthOf(callbacks, 3, 'has 3 callbacks rendered');

          const first = callbacks[0];
          assert.ok(first.querySelector('.table-title'), 'has the title');
          assert.ok(first.querySelector('api-operation-document'), 'has the operation definition');
        });

        it('renders the links section', async () => {
          const data = loader.lookupOperation(oasCallbacksModel, '/subscribe', 'post');
          const element = await basicFixture(oasCallbacksModel, data);
          const response = element.shadowRoot.querySelector('api-response-document');
          assert.ok(response, 'has the response');

          const title = response.shadowRoot.querySelector('.links-header');
          assert.ok(title, 'has the links title');
          assert.equal(title.textContent.trim(), 'Links', 'has the links title content');

          const linkHeaders = response.shadowRoot.querySelectorAll('.link-header');
          assert.lengthOf(linkHeaders, 2, 'has link title for each link');
          
          const linkTable = response.shadowRoot.querySelectorAll('.link-table');
          assert.lengthOf(linkTable, 2, 'has link content for each link');
          
          const linkOperations = response.shadowRoot.querySelectorAll('.operation-id');
          assert.lengthOf(linkOperations, 1, 'has a single link to operation id');
        });

        it('renders the responses section', async () => {
          const data = loader.lookupOperation(oasCallbacksModel, '/subscribe', 'post');
          const element = await basicFixture(oasCallbacksModel, data);
          const response = element.shadowRoot.querySelector('api-response-document');
          assert.ok(response, 'has the response');

          assert.isTrue(response.amf === oasCallbacksModel, 'passes the amf model');
          assert.typeOf(response.response, 'object', 'passes the response model');
        });

        it('does not render responses when not defined', async () => {
          const data = loader.lookupOperation(demoModel, '/query-params/bool', 'get');
          const element = await basicFixture(demoModel, data);
          const response = element.shadowRoot.querySelector('api-response-document');
          assert.notOk(response, 'has not response documentation');
        });
      });

      describe('try it button', () => {
        /** @type AmfDocument */
        let demoModel;
        before(async () => {
          demoModel = await loader.getGraph(compact);
        });

        it('does not render the try-it by default', async () => {
          const data = loader.lookupOperation(demoModel, '/orgs/{orgId}', 'put');
          const element = await basicFixture(demoModel, data);
          const header = element.shadowRoot.querySelector('.operation-header');
          const button = header.querySelector('.action-button');
          assert.notOk(button, 'has no button in the header');
        });

        it('renders the try-it when configured', async () => {
          const data = loader.lookupOperation(demoModel, '/orgs/{orgId}', 'put');
          const element = await tryItFixture(demoModel, data);
          const header = element.shadowRoot.querySelector('.operation-header');
          const button = header.querySelector('.action-button');
          assert.ok(button, 'has the button');
          assert.equal(button.textContent.trim(), 'Try it')
        });

        it('dispatches the bubbling tryit event when clicking on the button', async () => {
          const data = loader.lookupOperation(demoModel, '/orgs/{orgId}', 'put');
          const element = await tryItFixture(demoModel, data);
          const header = element.shadowRoot.querySelector('.operation-header');
          const button = /** @type HTMLElement */ (header.querySelector('.action-button'));
          const spy = sinon.spy();
          document.body.addEventListener('tryit', spy);
          button.click();
          assert.isTrue(spy.calledOnce, 'the event was dispatched');
          const {detail} = spy.args[0][0];
          assert.typeOf(detail, 'object', 'the event has the detail');
          assert.typeOf(detail.id, 'string', 'has the operation id');
        });

        it('dispatches the bubbling legacy tryit-requested event when clicking on the button', async () => {
          const data = loader.lookupOperation(demoModel, '/orgs/{orgId}', 'put');
          const element = await tryItFixture(demoModel, data);
          const header = element.shadowRoot.querySelector('.operation-header');
          const button = /** @type HTMLElement */ (header.querySelector('.action-button'));
          const spy = sinon.spy();
          document.body.addEventListener('tryit-requested', spy);
          button.click();
          assert.isTrue(spy.calledOnce, 'the event was dispatched');
          const {detail} = spy.args[0][0];
          assert.typeOf(detail, 'object', 'the event has the detail');
          assert.typeOf(detail.id, 'string', 'has the operation id');
        });
      });

      describe('responses template', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact);
        });

        it('renders the response status code selector', async () => {
          const data = loader.lookupOperation(model, '/people', 'get');
          const element = await basicFixture(model, data);

          const selector = element.shadowRoot.querySelector('.status-codes-selector');
          assert.ok(selector, 'has the selector section');

          const tabsSection = selector.querySelector('anypoint-tabs');
          assert.ok(tabsSection, 'has the tabs element');

          const tabs = tabsSection.querySelectorAll('anypoint-tab');
          assert.lengthOf(tabs, 2, 'has both status codes');

          assert.equal(tabs[0].textContent.trim(), '200');
          assert.equal(tabs[1].textContent.trim(), '400');
        });

        it('renders the response for the status', async () => {
          const data = loader.lookupOperation(model, '/people', 'get');
          const element = await basicFixture(model, data);

          const doc = element.shadowRoot.querySelector('api-response-document');
          assert.ok(doc);

          assert.isTrue(doc.amf === model, 'passes the amf model');
          assert.typeOf(doc.response, 'object', 'passes the response model');
          assert.typeOf(doc.response.id, 'string', 'passes the serialized response model');
        });

        it('switches the response when selecting a status code', async () => {
          const data = loader.lookupOperation(model, '/people', 'get');
          const element = await basicFixture(model, data);

          const requestBefore = element.shadowRoot.querySelector('api-response-document').response.id;

          const selector = element.shadowRoot.querySelector('.status-codes-selector');
          const tabs = selector.querySelectorAll('anypoint-tab');
          tabs[1].click();

          await nextFrame();

          assert.equal(element.selectedStatus, '400', 'changes the selectedStatus');
          const requestAfter = element.shadowRoot.querySelector('api-response-document').response.id;

          assert.typeOf(requestAfter, 'string', 'has the response after the change');
          assert.notEqual(requestBefore, requestAfter, 'has a changed response');
        });

        it('does not render responses section when no responses in the model', async () => {
          const data = loader.lookupOperation(model, '/scalarArrays', 'get');
          const element = await basicFixture(model, data);

          const doc = element.shadowRoot.querySelector('api-response-document');
          assert.notOk(doc);
        });
      });

      describe('response status codes', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact);
        });

        /** @type ApiOperationDocumentElement */
        let element;
        beforeEach(async () => {
          const data = loader.lookupOperation(model, '/people', 'put');
          element = await basicFixture(model, data);
        });

        it('renders the status codes section', () => {
          const node = element.shadowRoot.querySelector('.status-codes-selector');
          assert.ok(node);
        });

        it('renders the status codes options', async () => {
          const nodes = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll('.status-codes-selector anypoint-tab'));
          assert.lengthOf(nodes, 3,  'has 3 tabs');
          assert.equal(nodes[0].innerText.trim(), '200',  '200 status is rendered');
          assert.equal(nodes[1].innerText.trim(), '204',  '204 status is rendered');
          assert.equal(nodes[2].innerText.trim(), '400',  '400 status is rendered');
        });

        it('renders anypoint-tabs with scrollable', () => {
          const node = /** @type AnypointTabs */ (element.shadowRoot.querySelector('.status-codes-selector anypoint-tabs'));

          assert.isTrue(node.scrollable);
        });

        it('computes the selectedStatus', () => {
          assert.deepEqual(element.selectedStatus, '200');
        });

        it('changes the status code', async () => {
          const nodes = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll('.status-codes-selector anypoint-tab'));
          nodes[1].click();
          await nextFrame();

          assert.deepEqual(element.selectedStatus, '204');

          const response = element.shadowRoot.querySelector('api-response-document');
          assert.equal(response.response.statusCode, '204', 'the response element has the new status code');
        });
      });

      describe('security rendering', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'secured-api');
        });

        it('preselects the first security', async () => {
          const data = loader.lookupOperation(model, '/basic', 'get');
          const element = await securityFixture(model, data);
          assert.typeOf(element.securityId, 'string', 'has the securityId');
        });

        it('renders a single security', async () => {
          const data = loader.lookupOperation(model, '/basic', 'get');
          const element = await securityFixture(model, data);

          const selector = element.shadowRoot.querySelector('.security-selector');
          assert.notOk(selector, 'has no security selector');

          const doc = element.shadowRoot.querySelector('api-security-requirement-document');
          assert.ok(doc, 'has the security documentation');

          assert.isTrue(doc.amf === model, 'passes the model');
          assert.typeOf(doc.domainId, 'string', 'passes the security id');
        });

        it('renders multiple security options', async () => {
          const data = loader.lookupOperation(model, '/combo-types', 'get');
          const element = await securityFixture(model, data);

          const selector = element.shadowRoot.querySelector('.security-selector');
          assert.ok(selector, 'has the security selector');

          const doc = element.shadowRoot.querySelector('api-security-requirement-document');
          assert.ok(doc, 'has the security documentation');

          assert.isTrue(doc.amf === model, 'passes the model');
          assert.typeOf(doc.domainId, 'string', 'passes the security id');
        });

        it('switches between the security schemes', async () => {
          const data = loader.lookupOperation(model, '/combo-types', 'get');
          const element = await securityFixture(model, data);

          const selector = element.shadowRoot.querySelector('.security-selector');
          const tabs = selector.querySelectorAll('anypoint-tab');
          assert.lengthOf(tabs, 6, 'has all schemes rendered in the selector');

          tabs[1].click();
          await nextFrame();

          const doc = element.shadowRoot.querySelector('api-security-requirement-document');
          assert.ok(doc, 'has the security documentation');

          assert.equal(doc.domainId, tabs[1].dataset.id, 'passes the security id');
        });
      });

      describe('SE-12752 - query string', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'SE-12752');
        });

        it('renders parameters table with query parameters as a NodeShape', async () => {
          const data = loader.lookupOperation(model, '/test', 'get');
          const element = await basicFixture(model, data);
          const requestDoc = /** @type HTMLElement */ (element.shadowRoot.querySelector('api-request-document'));
          const params = requestDoc.shadowRoot.querySelectorAll('api-parameter-document[data-name="query"]');
          assert.lengthOf(params, 2, 'has both parameters from the query string');
        });
  
        it('renders parameters table with query parameters as an ArrayShape', async () => {
          const data = loader.lookupOperation(model, '/array', 'get');
          const element = await basicFixture(model, data);
          const requestDoc = /** @type HTMLElement */ (element.shadowRoot.querySelector('api-request-document'));
          const params = requestDoc.shadowRoot.querySelectorAll('api-parameter-document[data-name="query"]');
          assert.lengthOf(params, 1, 'has the single parameter item');
        });
  
        it('renders parameters table with query parameters as an UnionShape', async () => {
          const data = loader.lookupOperation(model, '/union', 'get');
          const element = await basicFixture(model, data);
          const requestDoc = /** @type HTMLElement */ (element.shadowRoot.querySelector('api-request-document'));
          const params = requestDoc.shadowRoot.querySelectorAll('api-parameter-document[data-name="query"]');
          assert.lengthOf(params, 2, 'has both parameters from the query string');
        });
  
        it('renders parameters table with query parameters as an ScalarShape', async () => {
          const data = loader.lookupOperation(model, '/scalar', 'get');
          const element = await basicFixture(model, data);
          const requestDoc = /** @type HTMLElement */ (element.shadowRoot.querySelector('api-request-document'));
          const params = requestDoc.shadowRoot.querySelectorAll('api-parameter-document[data-name="query"]');
          assert.lengthOf(params, 1, 'has the single parameter item');
        });
      });

      describe('SE-12957', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'SE-12957');
        });

        /** @type ApiOperationDocumentElement */
        let element;
        /** @type ApiRequestDocumentElement */
        let request;
        beforeEach(async () => {
          const data = loader.lookupOperation(model, '/api/v1/alarm/{scada-object-key}', 'get');
          element = await basicFixture(model, data);
          request = element.shadowRoot.querySelector('api-request-document');
        });

        it('renders all parameters', async () => {
          const params = request.shadowRoot.querySelectorAll('api-parameter-document');
          assert.lengthOf(params, 2);
        });

        it('renders the query parameter', async () => {
          const params = request.shadowRoot.querySelectorAll('api-parameter-document[data-name="query"]');
          assert.lengthOf(params, 1, 'has a single query parameter');
          const param = /** @type ApiParameterDocumentElement */ (params[0]);
          assert.equal(param.parameter.name, 'time-on', 'has the model defined parameter');
        });

        it('renders the path parameter', async () => {
          const params = request.shadowRoot.querySelectorAll('api-parameter-document[data-name="uri"]');
          assert.lengthOf(params, 1, 'has a single path parameter');
          const param = /** @type ApiParameterDocumentElement */ (params[0]);
          assert.equal(param.parameter.name, 'scada-object-key', 'has the model defined parameter');
        });
      });

      describe('SE-12959: Summary rendering', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'SE-12959');
        });

        it('has no summary by default', async () => {
          const data = loader.lookupOperation(model, '/api/v1/alarm/{scada-object-key}', 'get');
          const element = await basicFixture(model, data);
          const summary = element.shadowRoot.querySelector('.summary');
          assert.notOk(summary, 'has no summary field');
        });

        it('renders the summary', async () => {
          const data = loader.lookupOperation(model, '/api/v1/downtime/site/{site-api-key}', 'get');
          const element = await basicFixture(model, data);
          const summary = element.shadowRoot.querySelector('.summary');
          assert.ok(summary, 'has the summary field');
          assert.equal(summary.textContent.trim(), 'Get a list of downtime events for a site that overlap with a time period');
        });
      });

      describe('APIC-553: Code snippets query parameters', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'APIC-553');
        });

        it('sets the code snippets with endpoint uri and no query params', async () => {
          const data = loader.lookupOperation(model, '/cmt', 'get');
          const element = await snippetsFixture(model, data);
          assert.equal(element.snippetsUri, 'http://domain.org/cmt');
          assert.equal(element.shadowRoot.querySelector('http-code-snippets').url, 'http://domain.org/cmt');
        });

        it('sets the code snippets with endpoint uri and a query params', async () => {
          const data = loader.lookupOperation(model, '/cmt-with-qp-example', 'get');
          const element = await snippetsFixture(model, data);
          assert.equal(element.snippetsUri, 'http://domain.org/cmt-with-qp-example?orx=foo');
          assert.equal(element.shadowRoot.querySelector('http-code-snippets').url, 'http://domain.org/cmt-with-qp-example?orx=foo');
        });
      });

      describe('APIC-582: Async API rendering', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'APIC-582');
        });

        it('does not render code snippets', async () => {
          const data = loader.lookupOperation(model, 'user/signedup', 'subscribe');
          const element = await asyncFixture(model, data);
          const node = element.shadowRoot.querySelector('http-code-snippets');
          assert.notOk(node);
        });

        it('does not render request parameters', async () => {
          const data = loader.lookupOperation(model, 'user/signedup', 'subscribe');
          const element = await snippetsFixture(model, data);
          const requestDoc = /** @type HTMLElement */ (element.shadowRoot.querySelector('api-request-document'));
          const params = requestDoc.shadowRoot.querySelectorAll('.params-section');
          assert.lengthOf(params, 0);
        });
      });

      describe('APIC-650: Path parameters', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'APIC-650');
        });

        /** @type ApiOperationDocumentElement */
        let element;
        /** @type ApiRequestDocumentElement */
        let request;
        beforeEach(async () => {
          const data = loader.lookupOperation(model, '/testEndpoint1/{uriParam1}', 'get');
          element = await basicFixture(model, data);
          request = element.shadowRoot.querySelector('api-request-document');
        });
    
        it('renders path parameter for the endpoint', () => {
          const params = request.shadowRoot.querySelectorAll('api-parameter-document[data-name="uri"]');
          assert.lengthOf(params, 1, 'has a single path parameter');
          const param = /** @type ApiParameterDocumentElement */ (params[0]);
          assert.equal(param.parameter.name, 'uriParam1');
        });
    
        it('endpointVariables updated after selection changes', async () => {
          const data = loader.lookupOperation(model, '/testEndpoint2/{uriParam2}', 'get');
          element.domainModel = data;
          await aTimeout(1);
          
          const params = request.shadowRoot.querySelectorAll('api-parameter-document[data-name="uri"]');
          assert.lengthOf(params, 1, 'has a single path parameter');
          const param = /** @type ApiParameterDocumentElement */ (params[0]);
          assert.equal(param.parameter.name, 'uriParam2');
        });
      });
    });
  });
});

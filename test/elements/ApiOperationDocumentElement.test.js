import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
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

  [false, true].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
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

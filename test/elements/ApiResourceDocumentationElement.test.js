import { fixture, assert, html, aTimeout, nextFrame } from '@open-wc/testing';
import { requestValues } from '../../src/elements/ApiResourceDocumentationElement.js';
import { AmfLoader } from '../AmfLoader.js';
import { loadMonaco } from '../MonacoSetup.js';
import '../../api-resource-document.js';

/** @typedef {import('../../').ApiResourceDocumentationElement} ApiResourceDocumentationElement */
/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */
/** @typedef {import('@api-components/amf-helper-mixin').Response} Response */

describe('ApiResourceDocumentationElement', () => {
  const loader = new AmfLoader();

  before(async () => loadMonaco());

  /**
   * @param {AmfDocument} amf
   * @param {string=} domainId
   * @param {string=} operationId
   * @returns {Promise<ApiResourceDocumentationElement>}
   */
  async function basicFixture(amf, domainId, operationId) {
    const element = await fixture(html`<api-resource-document 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}" 
      .domainId="${domainId}"
      .operationId="${operationId}"
    ></api-resource-document>`);
    await aTimeout(0);
    return /** @type ApiResourceDocumentationElement */ (element);
  }

  /**
   * @param {AmfDocument} amf
   * @param {string=} domainId
   * @returns {Promise<ApiResourceDocumentationElement>}
   */
  async function asyncFixture(amf, domainId) {
    const element = await fixture(html`<api-resource-document 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}" 
      .domainId="${domainId}"
      asyncApi
    ></api-resource-document>`);
    await aTimeout(0);
    return /** @type ApiResourceDocumentationElement */ (element);
  }

  /**
   * @param {AmfDocument} amf
   * @param {string=} domainId
   * @returns {Promise<ApiResourceDocumentationElement>}
   */
  async function tryItPanelFixture(amf, domainId) {
    const element = await fixture(html`<api-resource-document 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}" 
      .domainId="${domainId}"
      tryItPanel
    ></api-resource-document>`);
    await aTimeout(0);
    return /** @type ApiResourceDocumentationElement */ (element);
  }

  [false, true].forEach((compact) => {
    /** @type AmfDocument */
    let demoModel;
    /** @type AmfDocument */
    let asyncModel;
    /** @type AmfDocument */
    let petStoreModel;
    before(async () => {
      demoModel = await loader.getGraph(compact);
      asyncModel = await loader.getGraph(compact, 'async-api');
      petStoreModel = await loader.getGraph(compact, 'Petstore-v2');
    });

    describe('graph processing', () => {
      it('sets the endpoint value', async () => {
        const data = loader.lookupEndpoint(demoModel, '/messages');
        const element = await basicFixture(demoModel, data['@id']);

        const { endpoint } = element;
        assert.typeOf(endpoint, 'object', 'has the endpoint');
        assert.equal(endpoint.path, '/messages', 'has the endpoint model');
      });

      it('sets the endpointUri value', async () => {
        const data = loader.lookupEndpoint(demoModel, '/messages');
        const element = await basicFixture(demoModel, data['@id']);

        const { endpointUri } = element;
        assert.equal(endpointUri, 'http://{instance}.domain.com/messages');
      });

      it('sets the servers value', async () => {
        const data = loader.lookupEndpoint(demoModel, '/messages');
        const element = await basicFixture(demoModel, data['@id']);

        const { servers } = element;
        assert.typeOf(servers, 'array', 'has the servers array');
        assert.lengthOf(servers, 1, 'has a single server');
        const [srv] = servers;
        assert.equal(srv.url, 'http://{instance}.domain.com/', 'has the server model');
      });

      // this is unreliable...
      it.skip('scrolls to the selected operation when initializing', async () => {
        const data = loader.lookupEndpoint(demoModel, '/people');
        const op = loader.getOperation(demoModel, '/people', 'put');
        await basicFixture(demoModel, data['@id'], op.id);
        assert.equal(window.scrollY, 0, 'initial scroll is 0');
        await aTimeout(400);
        assert.notEqual(window.scrollY, 0, 'the window is scrolled')
      });
    });

    describe('title are rendering', () => {
      it('renders the endpoint name, when defined', async () => {
        const data = loader.lookupEndpoint(demoModel, '/people');
        const element = await basicFixture(demoModel, data['@id']);
        const header = element.shadowRoot.querySelector('.endpoint-header');
        const label = header.querySelector('.label');
        assert.equal(label.textContent.trim(), 'People');
      });

      it('renders the endpoint path, when name not defined', async () => {
        const data = loader.lookupEndpoint(demoModel, '/orgs/{orgId}');
        const element = await basicFixture(demoModel, data['@id']);
        const header = element.shadowRoot.querySelector('.endpoint-header');
        const label = header.querySelector('.label');
        assert.equal(label.textContent.trim(), '/orgs/{orgId}');
      });

      it('renders the endpoint sub-title for sync API', async () => {
        const data = loader.lookupEndpoint(demoModel, '/orgs/{orgId}');
        const element = await basicFixture(demoModel, data['@id']);
        const header = element.shadowRoot.querySelector('.endpoint-header');
        const label = header.querySelector('.sub-header');
        assert.equal(label.textContent.trim(), 'API endpoint');
      });

      it('renders the endpoint sub-title for async API', async () => {
        const data = loader.lookupEndpoint(asyncModel, 'hello');
        const element = await asyncFixture(asyncModel, data['@id']);
        const header = element.shadowRoot.querySelector('.endpoint-header');
        const label = header.querySelector('.sub-header');
        assert.equal(label.textContent.trim(), 'API channel');
      });
    });

    describe('URL rendering', () => {
      it('renders the endpoint uri for a synchronous API', async () => {
        const data = loader.lookupEndpoint(petStoreModel, '/pets');
        const element = await basicFixture(petStoreModel, data['@id']);
        const value = element.shadowRoot.querySelector('.endpoint-url .url-value');
        assert.equal(value.textContent.trim(), 'http://petstore.swagger.io/api/pets');
      });

      it('renders the channel uri for an async API', async () => {
        const data = loader.lookupEndpoint(asyncModel, 'goodbye');
        const element = await basicFixture(asyncModel, data['@id']);
        const value = element.shadowRoot.querySelector('.endpoint-url .url-value');
        assert.equal(value.textContent.trim(), 'amqp://broker.mycompany.com/goodbye');
      });
    });

    describe('Extensions rendering', () => {
      it('renders resource type extension', async () => {
        const data = loader.lookupEndpoint(demoModel, '/people/{personId}');
        const element = await basicFixture(demoModel, data['@id']);
        const value = element.shadowRoot.querySelector('.extensions');
        assert.equal(value.textContent.trim(), 'Implements ResourceNotFound.');
      });

      it('renders traits extension', async () => {
        const data = loader.lookupEndpoint(demoModel, '/orgs/{orgId}');
        const element = await basicFixture(demoModel, data['@id']);
        const value = element.shadowRoot.querySelector('.extensions');
        assert.equal(value.textContent.trim(), 'Mixes in RateLimited.');
      });

      it('renders both the traits and the response type extension', async () => {
        const data = loader.lookupEndpoint(demoModel, '/people');
        const element = await basicFixture(demoModel, data['@id']);
        const value = element.shadowRoot.querySelector('.extensions');
        assert.equal(value.textContent.trim(), 'Implements RequestErrorResponse. Mixes in RateLimited.');
      });
    });

    describe('Description rendering', () => {
      it('renders the description', async () => {
        const data = loader.lookupEndpoint(demoModel, '/people/{personId}');
        const element = await basicFixture(demoModel, data['@id']);
        const desc = element.shadowRoot.querySelector('.api-description');
        assert.ok(desc, 'has the description');
        const marked = desc.querySelector('arc-marked');
        assert.equal(marked.markdown, 'The endpoint to access information about the person');
      });

      it('renders traits extension', async () => {
        const data = loader.lookupEndpoint(demoModel, '/people');
        const element = await basicFixture(demoModel, data['@id']);
        const desc = element.shadowRoot.querySelector('.api-description');
        assert.notOk(desc, 'has no description');
      });
    });

    describe('renders operations', () => {
      it('renders all operations in the endpoint', async () => {
        const data = loader.lookupEndpoint(demoModel, '/people');
        const element = await basicFixture(demoModel, data['@id']);
        const elements = element.shadowRoot.querySelectorAll('api-operation-document');
        assert.lengthOf(elements, 3);
      });

      it('sets a minimum properties', async () => {
        const data = loader.lookupEndpoint(demoModel, '/messages');
        const element = await basicFixture(demoModel, data['@id']);
        const op = element.shadowRoot.querySelector('api-operation-document');
        assert.typeOf(op.amf, 'object', 'amf is set')
        assert.typeOf(op.domainId, 'string', 'domainId is set')
        assert.typeOf(op.dataset.domainId, 'string', 'domainId is set')
        assert.isTrue(op.responsesOpened, 'responsesOpened is set')
        assert.isTrue(op.renderSecurity, 'renderSecurity is set')
      });

      it('sets the baseUri', async () => {
        const data = loader.lookupEndpoint(demoModel, '/messages');
        const element = await basicFixture(demoModel, data['@id']);
        element.baseUri = 'https://api.domain.com';
        await nextFrame();
        const op = element.shadowRoot.querySelector('api-operation-document');
        assert.equal(op.baseUri, 'https://api.domain.com');
      });

      it('sets the tryItButton', async () => {
        const data = loader.lookupEndpoint(demoModel, '/messages');
        const element = await basicFixture(demoModel, data['@id']);
        element.tryItButton = true;
        await nextFrame();
        const op = element.shadowRoot.querySelector('api-operation-document');
        assert.isTrue(op.tryItButton);
      });

      it('always sets tryItButton to false when tryItPanel is set', async () => {
        const data = loader.lookupEndpoint(demoModel, '/messages');
        const element = await basicFixture(demoModel, data['@id']);
        element.tryItButton = true;
        element.tryItPanel = true;
        await nextFrame();
        const op = element.shadowRoot.querySelector('api-operation-document');
        assert.notOk(op.tryItButton);
      });``

      it('sets the asyncApi', async () => {
        const data = loader.lookupEndpoint(demoModel, '/messages');
        const element = await basicFixture(demoModel, data['@id']);
        element.asyncApi = true;
        await nextFrame();
        const op = element.shadowRoot.querySelector('api-operation-document');
        assert.isTrue(op.asyncApi);
      });
    });

    describe('Rendering HTTP editors', () => {
      it('renders HTTP request editors for all operations', async () => {
        const data = loader.lookupEndpoint(demoModel, '/people');
        const element = await tryItPanelFixture(demoModel, data['@id']);
        const elements = element.shadowRoot.querySelectorAll('api-request-panel');
        assert.lengthOf(elements, 3);
      });

      it('collects request panel values for the code snippets', async () => {
        const data = loader.lookupEndpoint(demoModel, '/people');
        const element = await tryItPanelFixture(demoModel, data['@id']);
        await aTimeout(201);
        const values = element[requestValues];
        assert.typeOf(values, 'object', 'has the [requestValues] property');
        assert.lengthOf(Object.keys(values), 3, 'has values for each request');
      });

      it('renders the code snippets', async () => {
        const data = loader.lookupEndpoint(demoModel, '/people');
        const element = await tryItPanelFixture(demoModel, data['@id']);
        await aTimeout(201);
        const elements = element.shadowRoot.querySelectorAll('http-code-snippets');
        assert.lengthOf(elements, 3);
      });

      it('sets the initial request values on the code snippets', async () => {
        const data = loader.lookupEndpoint(demoModel, '/people');
        const element = await tryItPanelFixture(demoModel, data['@id']);
        await aTimeout(201);
        const editor = element.shadowRoot.querySelector('api-request-panel');
        const { selected } = editor;
        const values = element[requestValues][selected];
        assert.typeOf(values, 'object', 'has values for a request editor');
        const snippets = editor.parentElement.querySelector('http-code-snippets');
        assert.equal(snippets.url, values.url, 'snippets.url is set');
        assert.equal(snippets.method, values.method, 'snippets.method is set');
        assert.equal(snippets.headers, values.headers, 'snippets.headers is set');
        assert.equal(snippets.payload, values.payload, 'snippets.payload is set');
      });
    });
  });
});

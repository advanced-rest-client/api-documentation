import { fixture, assert, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import '../../api-resource-document.js';

/** @typedef {import('../../').ApiResourceDocumentationElement} ApiResourceDocumentationElement */
/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */
/** @typedef {import('@api-components/amf-helper-mixin').Response} Response */

describe('ApiResourceDocumentationElement', () => {
  const loader = new AmfLoader();

  /**
   * @param {AmfDocument} amf
   * @param {string=} domainId
   * @returns {Promise<ApiResourceDocumentationElement>}
   */
  async function basicFixture(amf, domainId) {
    const element = await fixture(html`<api-resource-document 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}" 
      .domainId="${domainId}"
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
        const data = loader.lookupEndpoint(asyncModel, '/orgs/{orgId}');
        const element = await basicFixture(asyncModel, data['@id']);
        const value = element.shadowRoot.querySelector('.extensions');
        assert.equal(value.textContent.trim(), 'Mixes in RateLimited.');
      });

      it('renders both the traits and the response type extension', async () => {
        const data = loader.lookupEndpoint(asyncModel, '/people');
        const element = await basicFixture(asyncModel, data['@id']);
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
        const data = loader.lookupEndpoint(asyncModel, '/people');
        const element = await basicFixture(asyncModel, data['@id']);
        const desc = element.shadowRoot.querySelector('.api-description');
        assert.notOk(desc, 'has no description');
      });
    });
  });
});

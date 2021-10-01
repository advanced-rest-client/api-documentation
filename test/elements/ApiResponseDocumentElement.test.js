import { fixture, assert, nextFrame, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import '../../api-response-document.js';

/** @typedef {import('../../').ApiResponseDocumentElement} ApiResponseDocumentElement */
/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */
/** @typedef {import('@api-components/amf-helper-mixin').Response} Response */

describe('ApiResponseDocumentElement', () => {
  const loader = new AmfLoader();

  /**
   * @param {AmfDocument} amf
   * @param {Response=} shape
   * @param {string=} mimeType
   * @returns {Promise<ApiResponseDocumentElement>}
   */
  async function basicFixture(amf, shape, mimeType) {
    const element = await fixture(html`<api-response-document 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}" 
      .domainModel="${shape}"
      .mimeType="${mimeType}"
    ></api-response-document>`);
    await aTimeout(0);
    return /** @type ApiResponseDocumentElement */ (element);
  }

  [false, true].forEach((compact) => {
    describe('response headers', () => {
      /** @type AmfDocument */
      let model;
      before(async () => {
        model = await loader.getGraph(compact);
      });

      it('renders the response headers', async () => {
        const data = loader.lookupResponses(model, '/people', 'put')[1];
        const element = await basicFixture(model, data);

        assert.isTrue(element.hasHeaders, 'hasHeaders is true');

        const section = element.shadowRoot.querySelector('.params-section [data-ctrl-property="headersOpened"]');
        assert.ok(section, 'the section is rendered');

        const params = element.shadowRoot.querySelectorAll('api-parameter-document');
        assert.lengthOf(params, 1, 'has the parameter');
      });

      it('ignores headers section when no headers', async () => {
        const data = loader.lookupResponses(model, '/people', 'get')[1];
        const element = await basicFixture(model, data);

        assert.isFalse(element.hasHeaders, 'hasHeaders is true');

        const section = element.shadowRoot.querySelector('.params-section [data-ctrl-property="headersOpened"]');
        assert.notOk(section, 'the section is not rendered');
      });
    });

    describe('annotations rendering', () => {
      /** @type AmfDocument */
      let model;
      before(async () => {
        model = await loader.getGraph(compact);
      });

      it('renders the annotations when in the object', async () => {
        const data = loader.lookupResponses(model, '/people', 'put')[1];
        const element = await basicFixture(model, data);

        const node = element.shadowRoot.querySelector('api-annotation-document');
        assert.ok(node);
      });

      it('ignores annotations when not defined', async () => {
        const data = loader.lookupResponses(model, '/people', 'get')[1];
        const element = await basicFixture(model, data);

        const node = element.shadowRoot.querySelector('api-annotation-document');
        assert.notOk(node);
      });
    });

    describe('description rendering', () => {
      /** @type AmfDocument */
      let model;
      before(async () => {
        model = await loader.getGraph(compact);
      });

      it('renders the description when defined', async () => {
        const data = loader.lookupResponses(model, '/people', 'put')[1];
        const element = await basicFixture(model, data);

        const node = element.shadowRoot.querySelector('arc-marked');
        assert.ok(node);
      });

      it('ignores annotations when not defined', async () => {
        const data = loader.lookupResponses(model, '/people/{personId}', 'get')[1];
        const element = await basicFixture(model, data);

        const node = element.shadowRoot.querySelector('arc-marked');
        assert.notOk(node);
      });
    });

    describe('payload rendering', () => {
      /** @type AmfDocument */
      let model;
      before(async () => {
        model = await loader.getGraph(compact);
      });

      it('renders the payload schema', async () => {
        const data = loader.lookupResponses(model, '/people', 'put')[1];
        const element = await basicFixture(model, data);

        const node = element.shadowRoot.querySelector('api-payload-document');
        assert.ok(node, 'has the payload document');
      });

      it('ignores the payload when not defined', async () => {
        const data = loader.lookupResponses(model, '/people/{personId}', 'put')[1];
        const element = await basicFixture(model, data);

        const node = element.shadowRoot.querySelector('api-payload-document');
        assert.notOk(node);
      });
    });

    describe('response media type selector', () => {
      /** @type AmfDocument */
      let model;
      before(async () => {
        model = await loader.getGraph(compact);
      });

      it('renders the response media type selector', async () => {
        const data = loader.lookupResponses(model, '/people', 'put')[1];
        const element = await basicFixture(model, data);

        const section = element.shadowRoot.querySelectorAll('.params-section')[1];
        const selector = section.querySelector('.media-type-selector');
        assert.ok(selector, 'has the payload document');

        const buttons = selector.querySelectorAll('anypoint-radio-button');
        assert.lengthOf(buttons, 2, 'has 2 media types to select');
      });

      it('ignores the media type when not defined', async () => {
        const data = loader.lookupResponses(model, '/people', 'get')[1];
        const element = await basicFixture(model, data);

        const section = element.shadowRoot.querySelectorAll('.params-section')[0];
        const selector = section.querySelector('.media-type-selector');
        assert.notOk(selector, 'has the payload document');
      });

      it('selecting a mime type changes the payload', async () => {
        const data = loader.lookupResponses(model, '/people', 'put')[1];
        const element = await basicFixture(model, data);

        const section = element.shadowRoot.querySelectorAll('.params-section')[1];
        const selector = section.querySelector('.media-type-selector');

        const buttons = selector.querySelectorAll('anypoint-radio-button');

        buttons[1].click();

        await nextFrame();

        assert.equal(element.mimeType, 'application/xml', 'media type is changed');
      });
    });

    describe('links rendering', () => {
      /** @type AmfDocument */
      let model;
      before(async () => {
        model = await loader.getGraph(compact, 'oas-callbacks');
      });

      it('renders the links table', async () => {
        const data = loader.lookupResponses(model, '/subscribe', 'post')[1];
        const element = await basicFixture(model, data);

        const title = element.shadowRoot.querySelector('.links-header');
        assert.ok(title, 'has the links title');
        assert.equal(title.textContent.trim(), 'Links');
      });

      it('renders titles for each link', async () => {
        const data = loader.lookupResponses(model, '/subscribe', 'post')[0];
        const element = await basicFixture(model, data);

        const titles = element.shadowRoot.querySelectorAll('.link-header');
        assert.lengthOf(titles, 2, 'has 2 links');

        assert.equal(titles[0].textContent.trim(), 'unsubscribeOp', 'has link #1 title');
        assert.equal(titles[1].textContent.trim(), 'otherOp', 'has link #2 title');
      });

      it('renders a single header', async () => {
        const data = loader.lookupResponses(model, '/subscribe', 'post')[1];
        const element = await basicFixture(model, data);

        const nodes = /** @type NodeListOf<HTMLElement> */ (element.shadowRoot.querySelectorAll('.link-header'));
        assert.lengthOf(nodes, 1);
        assert.equal(nodes[0].innerText.trim(), 'paymentUrl');
      });

      it('renders the operation id', async () => {
        const data = loader.lookupResponses(model, '/subscribe', 'post')[0];
        const element = await basicFixture(model, data);

        const nodes = element.shadowRoot.querySelectorAll('.operation-id');
        assert.lengthOf(nodes, 1, 'has only a single operationId');

        const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.operation-id .operation-name'));
        assert.equal(node.innerText.trim(), 'unsubscribeOperation');
      });

      it('does no render operation id when missing', async () => {
        const data = loader.lookupResponses(model, '/subscribe', 'post')[1];
        const element = await basicFixture(model, data);

        const node = element.shadowRoot.querySelector('.operation-id');
        assert.notOk(node);
      });

      it('renders mapping table', async () => {
        const data = loader.lookupResponses(model, '/subscribe', 'post')[0];
        const element = await basicFixture(model, data);

        const nodes = element.shadowRoot.querySelectorAll('.mapping-table');
        assert.lengthOf(nodes, 2);
      });

      it('renders single mapping', async () => {
        const data = loader.lookupResponses(model, '/subscribe', 'post')[0];
        const element = await basicFixture(model, data);

        const node = element.shadowRoot.querySelectorAll('.mapping-table')[0];
        const rows = node.querySelectorAll('tr');
        // header + single row
        assert.lengthOf(rows, 2);
      });

      it('renders multiple mapping', async () => {
        const data = loader.lookupResponses(model, '/subscribe', 'post')[0];
        const element = await basicFixture(model, data);

        const node = element.shadowRoot.querySelectorAll('.mapping-table')[1];
        const rows = node.querySelectorAll('tr');
        // header + two rows
        assert.lengthOf(rows, 3);
      });

      it('renders mapping values', async () => {
        const data = loader.lookupResponses(model, '/subscribe', 'post')[0];
        const element = await basicFixture(model, data);

        const node = element.shadowRoot.querySelectorAll('.mapping-table')[0];
        const row = node.querySelectorAll('tr')[1];
        const cols = row.querySelectorAll('td');

        assert.equal(cols[0].innerText.trim(), 'Id', 'variable is rendered');
        assert.equal(cols[1].innerText.trim(), '$response.body#/subscriberId', 'expression is rendered');
      });
    });

    describe('Inline type name (stevetest)', () => {
      /** @type AmfDocument */
      let model;
      before(async () => {
        model = await loader.getGraph(compact, 'stevetest');
      });

      it('does not render type name when it is "default"', async () => {
        const data = loader.lookupResponse(model, '/legal/termsConditionsAcceptReset', 'delete', '400');
        const element = await basicFixture(model, data);
        
        const doc = element.shadowRoot.querySelector('api-payload-document');
        const schema = doc.shadowRoot.querySelector('api-schema-document');
        assert.notExists(schema.shadowRoot.querySelector('.schema-title'));
      });
    });
  });
});

import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import '../../api-operation-document.js';

/** @typedef {import('../../').ApiOperationDocumentElement} ApiOperationDocumentElement */
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
    });
  });
});

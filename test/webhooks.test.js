import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import '../api-documentation.js';
import { AmfLoader } from './amf-loader.js';

/** @typedef {import('..').ApiDocumentationElement} ApiDocumentationElement */

/**
 * Try-It is suppressed per-operation for OAS 3.1/3.2 top-level webhooks, exactly
 * as it is for gRPC operations. Suppression is per-operation (not app-wide):
 * a webhook API may still expose invokable REST endpoints, which keep Try-It.
 *
 * A webhook compiles to an `apiContract#EndPoint` node identical to a regular
 * endpoint; the WebAPI root references it via `apiContract#webhooks`. There is
 * no operation-level flag, so `effectiveNoTryIt` resolves membership from the
 * model root through the mixin's `_computeWebhooks`.
 *
 * These tests drive the REAL generated model (`demo/oas31-webhooks`, from
 * `demo/oas31-webhooks/oas31-webhooks.yaml`) rather than hand-built AMF, so a
 * regression in the generator's `apiContract#webhooks` predicate or in the
 * webhook-aware amf-helper-mixin fails here instead of silently passing an
 * inline fixture.
 */
describe('ApiDocumentationElement webhooks (OAS 3.1/3.2)', () => {
  /**
   * @param {any} amf
   * @returns {Promise<ApiDocumentationElement>}
   */
  async function elementFixture(amf) {
    const el = /** @type ApiDocumentationElement */ (
      await fixture(html`<api-documentation .amf="${amf}"></api-documentation>`)
    );
    await nextFrame();
    return el;
  }

  [true, false].forEach((compact) => {
    describe(`${compact ? 'compact' : 'full'} model`, () => {
      let model;
      let webhookOperation;
      let restOperation;

      beforeEach(async () => {
        model = await AmfLoader.load('oas31-webhooks', compact);
        webhookOperation = AmfLoader.lookupWebhookOperation(model, 'newPet', 'post');
        restOperation = AmfLoader.lookupOperation(model, '/pets', 'get');
      });

      it('resolves the top-level webhook operation from the generated model', () => {
        assert.ok(webhookOperation, 'webhook operation is present in the model');
        assert.ok(restOperation, 'REST operation is present in the model');
      });

      it('flags a top-level webhook operation via _isWebhookOperation', async () => {
        const el = await elementFixture(model);
        assert.isTrue(el._isWebhookOperation(webhookOperation));
      });

      it('does not flag a regular endpoint operation as a webhook', async () => {
        const el = await elementFixture(model);
        assert.isFalse(el._isWebhookOperation(restOperation));
      });

      it('suppresses Try-It for a selected webhook operation', async () => {
        const el = await elementFixture(model);
        el._docsModel = webhookOperation;
        el._selectedType = 'method';
        assert.isTrue(el.effectiveNoTryIt, 'effectiveNoTryIt is true for a webhook op');
      });

      it('keeps Try-It for a selected REST endpoint operation (per-operation suppression)', async () => {
        const el = await elementFixture(model);
        el._docsModel = restOperation;
        el._selectedType = 'method';
        assert.isFalse(el.effectiveNoTryIt, 'effectiveNoTryIt is false for a REST op');
      });

      it('still respects an explicit noTryIt for a REST op', async () => {
        const el = await elementFixture(model);
        el.noTryIt = true;
        el._docsModel = restOperation;
        el._selectedType = 'method';
        assert.isTrue(el.effectiveNoTryIt, 'explicit noTryIt wins');
      });

      it('does not suppress Try-It when nothing is selected', async () => {
        const el = await elementFixture(model);
        assert.isFalse(el.effectiveNoTryIt);
      });
    });
  });
});

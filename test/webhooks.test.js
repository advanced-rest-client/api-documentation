/* eslint-disable no-shadow */
import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import '../api-documentation.js';

/** @typedef {import('..').ApiDocumentationElement} ApiDocumentationElement */

/**
 * Try-It is suppressed per-operation for OAS 3.1/3.2 top-level webhooks, exactly
 * as it is for gRPC operations. Suppression is per-operation (not app-wide):
 * a webhook API may still expose invokable REST endpoints, which keep Try-It.
 *
 * A webhook compiles to an `apiContract#EndPoint` node identical to a regular
 * endpoint; the WebAPI root references it via `apiContract#webhooks`. There is
 * no operation-level flag, so `effectiveNoTryIt` resolves membership from the
 * model root through `_computeWebhooks`.
 *
 * The model is built inline (expanded AMF, no `@context`) so this test does not
 * depend on the model generator. The shared amf-helper-mixin is versioned
 * independently; where the installed build predates `_computeWebhooks`, this
 * test supplies the method on the element instance to mirror the production
 * (webhook-aware) mixin — the webhook-endpoint resolution fallback itself is
 * covered by the amf-helper-mixin suite.
 */
describe('ApiDocumentationElement webhooks (OAS 3.1/3.2)', () => {
  const DOC = 'http://a.ml/vocabularies/document#Document';
  const ENCODES = 'http://a.ml/vocabularies/document#encodes';
  const WEBAPI = 'http://a.ml/vocabularies/apiContract#WebAPI';
  const ENDPOINT = 'http://a.ml/vocabularies/apiContract#endpoint';
  const WEBHOOKS = 'http://a.ml/vocabularies/apiContract#webhooks';
  const ENDPOINT_T = 'http://a.ml/vocabularies/apiContract#EndPoint';
  const OPERATION_T = 'http://a.ml/vocabularies/apiContract#Operation';
  const SUPPORTED_OP = 'http://a.ml/vocabularies/apiContract#supportedOperation';
  const PATH = 'http://a.ml/vocabularies/apiContract#path';
  const METHOD = 'http://a.ml/vocabularies/apiContract#method';
  const NAME = 'http://a.ml/vocabularies/core#name';

  function buildModel() {
    return {
      '@type': [DOC],
      [ENCODES]: [{
        '@id': 'amf://id#1',
        '@type': [WEBAPI],
        [ENDPOINT]: [{
          '@id': 'amf://id#10',
          '@type': [ENDPOINT_T],
          [PATH]: [{ '@value': '/pets' }],
          [SUPPORTED_OP]: [{
            '@id': 'amf://id#11',
            '@type': [OPERATION_T],
            [METHOD]: [{ '@value': 'get' }],
          }],
        }],
        [WEBHOOKS]: [{
          '@id': 'amf://id#20',
          '@type': [ENDPOINT_T],
          [PATH]: [{ '@value': 'newPet' }],
          [NAME]: [{ '@value': 'newPet' }],
          [SUPPORTED_OP]: [{
            '@id': 'amf://id#21',
            '@type': [OPERATION_T],
            [METHOD]: [{ '@value': 'post' }],
          }],
        }],
      }],
    };
  }

  /**
   * @returns {Promise<ApiDocumentationElement>}
   */
  async function elementFixture(amf) {
    const el = /** @type ApiDocumentationElement */ (
      await fixture(html`<api-documentation .amf="${amf}"></api-documentation>`)
    );
    // Ensure `_computeWebhooks` is available regardless of the installed mixin
    // build, mirroring the production (webhook-aware) amf-helper-mixin.
    if (typeof el._computeWebhooks !== 'function') {
      el._computeWebhooks = function _computeWebhooks(webApi) {
        if (!webApi) {
          return [];
        }
        const key = this._getAmfKey('http://a.ml/vocabularies/apiContract#webhooks');
        return this._ensureArray(webApi[key]);
      };
    }
    await nextFrame();
    return el;
  }

  let model;
  let webhookOperation;
  let restOperation;

  beforeEach(() => {
    model = buildModel();
    const webApi = model[ENCODES][0];
    webhookOperation = webApi[WEBHOOKS][0][SUPPORTED_OP][0];
    restOperation = webApi[ENDPOINT][0][SUPPORTED_OP][0];
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

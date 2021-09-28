import { fixture, assert, nextFrame, html } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import '../../api-annotation-document.js';

/** @typedef {import('../../').ApiAnnotationDocumentElement} ApiAnnotationDocumentElement */
/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */

describe('ApiAnnotationDocumentElement', () => {
  const loader = new AmfLoader();
  const apiFile = 'annotated-api';
  /**
   * @param {AmfDocument} amf
   * @param {DomainElement=} shape
   * @returns {Promise<ApiAnnotationDocumentElement>}
   */
  async function basicFixture(amf, shape) {
    return fixture(html`<api-annotation-document .amf="${amf}" .shape="${shape}"></api-annotation-document>`);
  }

  describe('a11y', () => {
    /** @type ApiAnnotationDocumentElement */
    let element;
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph(true, apiFile);
    });

    beforeEach(async () => {
      const shape = loader.lookupShape(model, 'ComplexAnnotations');
      element = await basicFixture(model, shape);
      await nextFrame();
    });

    it('is accessible', async () => {
      await assert.isAccessible(element);
    });
  });

  [false, true].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      describe('Model computations', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, apiFile);
        });

        /** @type ApiAnnotationDocumentElement */
        let element;
        beforeEach(async () => {
          element = await basicFixture(model);
        });

        it('computes hasCustomProperties when no annotations', () => {
          const shape = loader.lookupShape(model, 'NoAnnotations');
          element.shape = shape;
          assert.isFalse(element.hasCustomProperties);
        });

        it('computes hasCustomProperties when has the annotations', () => {
          const shape = loader.lookupShape(model, 'ComboType');
          element.shape = shape;
          assert.isTrue(element.hasCustomProperties);
        });

        it('computes the list of annotations', () => {
          const shape = loader.lookupShape(model, 'ComboType');
          element.shape = shape;
          assert.typeOf(element.customProperties, 'array');
          assert.lengthOf(element.customProperties, 3);
        });

        it('renders a nil annotation', async () => {
          const shape = loader.lookupShape(model, 'notRequiredRepeatable');
          element.shape = shape;
          await nextFrame();
          const node = element.shadowRoot.querySelectorAll('.custom-property')[0];
          assert.ok(node, 'Annotation container is rendered');
          const label = /** @type HTMLElement */ (node.querySelector('.name'));
          assert.ok(label, 'Annotation label is rendered');
          const labelValue = label.innerText.toLowerCase();
          assert.equal(labelValue, 'annotationtest');
        });

        // APIMF-1710
        it.skip('does not render a value for a nil annotation', async () => {
          const shape = loader.lookupShape(model, 'notRequiredRepeatable');
          element.shape = shape;
          await nextFrame();
          const node = element.shadowRoot.querySelector('.custom-property');
          assert.ok(node, 'Annotation container is rendered');
          const value = node.querySelector('.scalar-value');
          assert.notOk(value, 'Annotation value is not rendered');
        });

        it('renders a scalar annotation', async () => {
          const shape = loader.lookupShape(model, 'ErrorResource');
          element.shape = shape;
          await nextFrame();
          const node = element.shadowRoot.querySelector('.custom-property');
          assert.ok(node, 'Annotation container is rendered');
          const label = /** @type HTMLElement */ (node.querySelector('.name'));
          assert.ok(label, 'Annotation label is rendered');
          const labelValue = label.innerText.toLowerCase();
          assert.equal(labelValue, 'deprecated');
          const value = node.querySelector('.scalar-value');
          assert.ok(value, 'Annotation value is rendered');
          const scalarList = node.querySelectorAll('.scalar-value');
          assert.equal(scalarList.length, 1, 'Scalar value is rendered');
        });

        it('renders a complex annotation', async () => {
          const shape = loader.lookupShape(model, 'ComplexAnnotations');
          element.shape = shape;
          await nextFrame();
          const node = element.shadowRoot.querySelector('.custom-property');
          assert.ok(node, 'Annotation container is rendered');
          const label = /** @type HTMLElement */ (node.querySelector('.name'));
          assert.ok(label, 'Annotation label is rendered');
          const labelValue = label.innerText.toLowerCase();
          assert.equal(labelValue, 'clearancelevel');
          const objectNodes = node.querySelectorAll('.object-property');
          assert.equal(objectNodes.length, 2, 'has all properties rendered');
        });
      });
    });
  });
});

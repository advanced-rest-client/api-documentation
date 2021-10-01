import { fixture, assert, nextFrame, html, aTimeout } from '@open-wc/testing';
import { AmfLoader } from '../AmfLoader.js';
import { 
  schemaValue,
  expandedValue,
  selectedUnionsValue,
} from '../../src/elements/ApiSchemaDocumentElement.js';
import '../../api-schema-document.js';

/** @typedef {import('../../').ApiSchemaDocumentElement} ApiSchemaDocumentElement */
/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */
/** @typedef {import('@api-components/amf-helper-mixin').ApiShapeUnion} ApiShapeUnion */
/** @typedef {import('@anypoint-web-components/anypoint-radio-button/index').AnypointRadioButtonElement} AnypointRadioButtonElement */

describe('ApiSchemaDocumentElement', () => {
  const loader = new AmfLoader();
  const JsonType = 'application/json';

  /**
   * @param {AmfDocument} amf
   * @param {DomainElement=} shape
   * @param {string=} mime
   * @returns {Promise<ApiSchemaDocumentElement>}
   */
  async function basicFixture(amf, shape, mime) {
    const element = await fixture(html`<api-schema-document 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}" 
      .domainModel="${shape}"
      .mimeType="${mime}"></api-schema-document>`);
    await aTimeout(0);
    return /** @type ApiSchemaDocumentElement */ (element);
  }

  /**
   * @param {AmfDocument} amf
   * @param {DomainElement=} shape
   * @param {string=} mime
   * @returns {Promise<ApiSchemaDocumentElement>}
   */
  async function examplesFixture(amf, shape, mime) {
    const element = await fixture(html`<api-schema-document 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}" 
      .domainModel="${shape}"
      .mimeType="${mime}"
      forceExamples></api-schema-document>`);
    await aTimeout(0);
    return /** @type ApiSchemaDocumentElement */ (element);
  }

  /**
   * @param {AmfDocument} amf
   * @param {ApiShapeUnion} shape
   * @param {string=} mime
   * @returns {Promise<ApiSchemaDocumentElement>}
   */
  async function schemaFixture(amf, shape, mime) {
    const element = await fixture(html`<api-schema-document 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}" 
      .mimeType="${mime}"
      .schema="${shape}"
      forceExamples></api-schema-document>`);
    await aTimeout(0);
    return /** @type ApiSchemaDocumentElement */ (element);
  }

  [false, true].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      describe('a11y', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact);
        });

        /** @type ApiSchemaDocumentElement */
        let element;
        beforeEach(async () => {
          element = await basicFixture(model);
        });

        it('is accessible for scalar type', async () => {
          const data = loader.lookupShape(model, 'ScalarType');
          element.domainModel = data;
          element.processGraph();
          await nextFrame();
          await assert.isAccessible(element);
        });

        it('is accessible for NilShape type', async () => {
          const data = loader.lookupShape(model, 'NilType');
          element.domainModel = data;
          element.processGraph();
          await nextFrame();
          await assert.isAccessible(element);
        });

        it('is accessible for AnyShape type', async () => {
          const data = loader.lookupShape(model, 'AnyType');
          element.domainModel = data;
          element.processGraph();
          await nextFrame();
          await assert.isAccessible(element);
        });

        it('is accessible for UnionShape type', async () => {
          const data = loader.lookupShape(model, 'Unionable');
          element.domainModel = data;
          element.processGraph();
          await nextFrame();
          await assert.isAccessible(element);
        });

        it('is accessible for ArrayShape type', async () => {
          const data = loader.lookupShape(model, 'ArrayType');
          element.domainModel = data;
          element.processGraph();
          await nextFrame();
          await assert.isAccessible(element);
        });

        it('is accessible for ArrayShape type', async () => {
          const data = loader.lookupShape(model, 'ComplexRecursive');
          element.domainModel = data;
          element.processGraph();
          await nextFrame();
          await assert.isAccessible(element);
        });
      });

      describe('processGraph()', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact);
        });

        /** @type ApiSchemaDocumentElement */
        let element;
        beforeEach(async () => {
          const data = loader.lookupShape(model, 'ScalarType');
          element = await basicFixture(model, data);
        });

        it('sets the [schemaValue]', async () => {
          element.processGraph();
          assert.ok(element[schemaValue], 'has the value');
          assert.equal(element[schemaValue].name, 'ScalarType', 'has the processed shape');
        });

        it('sets the [expandedValue]', async () => {
          element[expandedValue] = ['test'];
          element.processGraph();
          assert.deepEqual(element[expandedValue], []);
        });

        it('sets the [selectedUnionsValue]', async () => {
          element[selectedUnionsValue] = { a: 'test' };
          element.processGraph();
          assert.deepEqual(element[selectedUnionsValue], {});
        });

        it('computes the schema from the domainId property', () => {
          const id = element.domainModel['@id'];
          element[schemaValue] = undefined;
          element.domainId = id;
          element.processGraph();
          assert.ok(element[schemaValue], 'has the value');
          assert.equal(element[schemaValue].name, 'ScalarType', 'has the processed shape');
        });
      });

      describe('Schema rendering', () => {
        describe('Scalar type (RAML)', () => {
          /** @type AmfDocument */
          let model;
          before(async () => {
            model = await loader.getGraph(compact);
          });

          /** @type ApiSchemaDocumentElement */
          let element;

          it('renders a scalar with properties', async () => {
            const data = loader.lookupShape(model, 'DescribedScalar');
            element = await basicFixture(model, data);
            const titleLabel = element.shadowRoot.querySelector('.schema-header .schema-title .label');
            assert.equal(titleLabel.textContent.trim(), 'DescribedScalar', 'has the schema title');
            const markdown = element.shadowRoot.querySelector('.api-description arc-marked');
            assert.ok(markdown, 'has the markdown processor element');
            assert.typeOf(/** @type any */(markdown).markdown, 'string', 'passes the markdown property to the markdown renderer');
            const type = element.shadowRoot.querySelector('.param-type');
            assert.equal(type.textContent.trim(), 'String', 'renders the schema type');
            const props = element.shadowRoot.querySelectorAll('.schema-property-item');
            assert.lengthOf(props, 2, 'has two additional properties');
          });

          it('renders a simple scalar without properties', async () => {
            const data = loader.lookupShape(model, 'BooleanType');
            element = await basicFixture(model, data);
            const titleLabel = element.shadowRoot.querySelector('.schema-header .schema-title .label');
            assert.equal(titleLabel.textContent.trim(), 'BooleanType', 'has the schema title');
            const markdown = element.shadowRoot.querySelector('.api-description arc-marked');
            assert.notOk(markdown, 'has no markdown processor');
            const type = element.shadowRoot.querySelector('.param-type');
            assert.equal(type.textContent.trim(), 'Boolean', 'renders the schema type');
            const props = element.shadowRoot.querySelectorAll('.schema-property-item');
            assert.lengthOf(props, 0, 'has no additional properties');
          });
        });

        describe('Nil type (RAML)', () => {
          /** @type AmfDocument */
          let model;
          before(async () => {
            model = await loader.getGraph(compact);
          });

          /** @type ApiSchemaDocumentElement */
          let element;

          it('renders the NIL type description', async () => {
            const data = loader.lookupShape(model, 'NilType');
            element = await basicFixture(model, data);
            const titleLabel = element.shadowRoot.querySelector('.schema-header .schema-title .label');
            assert.equal(titleLabel.textContent.trim(), 'NilType', 'has the schema title');
            const markdown = element.shadowRoot.querySelector('.api-description arc-marked');
            assert.notOk(markdown, 'has no markdown processor element');
            const info = element.shadowRoot.querySelector('.nil-info');
            assert.ok(info, 'has the info node');
            assert.equal(info.textContent.trim(), 'The value of this property is nil.', 'renders the info content');
          });
        });

        describe('Object type (RAML)', () => {
          /** @type AmfDocument */
          let model;
          before(async () => {
            model = await loader.getGraph(compact);
          });

          /** @type ApiSchemaDocumentElement */
          let element;

          it('renders the base properties', async () => {
            const data = loader.lookupShape(model, 'AppPerson');
            element = await basicFixture(model, data, JsonType);
            const titleLabel = element.shadowRoot.querySelector('.schema-header .schema-title .label');
            assert.equal(titleLabel.textContent.trim(), 'A person resource', 'has the schema title');
            const markdown = element.shadowRoot.querySelector('.api-description arc-marked');
            assert.ok(markdown, 'has the markdown processor element');
            assert.typeOf(/** @type any */(markdown).markdown, 'string', 'passes the markdown property to the markdown renderer');
            const info = element.shadowRoot.querySelector('.examples');
            assert.ok(info, 'has the examples');
            const params = element.shadowRoot.querySelector('.params-section');
            assert.ok(params, 'has the params list');
          });

          it('renders the example', async () => {
            const data = loader.lookupShape(model, 'AppPerson');
            element = await basicFixture(model, data, JsonType);

            const examples = element.shadowRoot.querySelectorAll('.schema-example');
            assert.lengthOf(examples, 1, 'has a single example');

            const detail = /** @type HTMLDetailsElement */ (examples[0]);
            assert.isFalse(detail.open, 'the example is not opened by default');

            const code = detail.querySelector('.code-value');
            assert.ok(code, 'has the code value');

            assert.isNotEmpty(code.textContent.trim(), 'code has a value');
          });

          it('renders object properties', async () => {
            const data = loader.lookupShape(model, 'AppPerson');
            element = await basicFixture(model, data, JsonType);

            const properties = element.shadowRoot.querySelectorAll('.property-container');
            // this is to be changed if the # of properties in the AppPerson type change.
            assert.lengthOf(properties, 16, 'has 16 properties');
          });

          it('renders the name and the display name', async () => {
            const data = loader.lookupShape(model, 'AppPerson');
            element = await basicFixture(model, data, JsonType);

            const property = element.shadowRoot.querySelector('.property-container[data-name="favouriteTime"]');
            const name = property.querySelector('.param-name');
            assert.equal(name.textContent.trim(), 'Some example', 'renders the display name');
            const secondary = property.querySelector('.param-name-secondary');
            assert.equal(secondary.textContent.trim(), 'favouriteTime', 'renders the property name');
          });

          it('renders a required property', async () => {
            const data = loader.lookupShape(model, 'AppPerson');
            element = await basicFixture(model, data, JsonType);

            const property = element.shadowRoot.querySelector('.property-container[data-name="favouriteTime"]');
            const name = property.querySelector('.param-name');
            assert.isTrue(name.classList.contains('required'), 'the title has the required CSS class name');
            
            const { content } = getComputedStyle(name, '::after');
            assert.equal(content, '"*"', 'renders the asterisk after the name');

            const pill = property.querySelector('.property-headline .param-pill');
            assert.ok(pill, 'renders the "required" pill');
            assert.equal(pill.textContent.trim(), 'Required', 'the pill has the label');
          });

          it('renders a property type', async () => {
            const data = loader.lookupShape(model, 'AppPerson');
            element = await basicFixture(model, data, JsonType);

            const property = element.shadowRoot.querySelector('.property-container[data-name="favouriteTime"]');
            const type = property.querySelector('.param-type');
            
            assert.ok(type, 'has the type element');
            assert.equal(type.textContent.trim(), 'Time', 'the type has the value');
          });

          it('rendering complex properties', async () => {
            const data = loader.lookupShape(model, 'AppPerson');
            element = await basicFixture(model, data);

            const complexProperty = element.shadowRoot.querySelector('.property-container.complex');
            assert.ok(complexProperty, 'has a complex property');

            const next = complexProperty.nextElementSibling;
            assert.isFalse(next.classList.contains('shape-children'), 'has no children');

            const decorator = complexProperty.querySelector('.property-decorator');
            assert.ok(decorator, 'has the decorator element');
            assert.isTrue(decorator.classList.contains('object'), 'has the object decorator');
          });

          it('toggling complex properties', async () => {
            const data = loader.lookupShape(model, 'AppPerson');
            element = await basicFixture(model, data);

            const complexProperty = element.shadowRoot.querySelector('.property-container.complex');
            const decorator = /** @type HTMLElement */ (complexProperty.querySelector('.property-decorator'));
            decorator.click();
            
            await nextFrame();

            const next = complexProperty.nextElementSibling;
            assert.isTrue(next.classList.contains('shape-children'), 'renders the children');

            assert.deepEqual(element[expandedValue], [decorator.dataset.id], 'updated the [expandedValue]');
          });

          it('renders a closed detail with a property properties', async () => {
            const data = loader.lookupShape(model, 'AppPerson');
            element = await basicFixture(model, data);

            const property = element.shadowRoot.querySelector('.property-container[data-name="favouriteNumber"]');
            const detail = /** @type HTMLDetailsElement */ (property.querySelector('.property-details'));
            
            assert.isFalse(detail.open, 'the properties are not opened by default');
            
            const properties = detail.querySelectorAll('.schema-property-item');
            assert.lengthOf(properties, 4, 'the detail has the properties');

            assert.equal(properties[0].textContent.trim(), 'Minimum:\n    0', 'has the minimum property');
            assert.equal(properties[1].textContent.trim(), 'Maximum:\n    9999', 'has the maximum property');
            assert.equal(properties[2].textContent.trim(), 'Multiple of:\n    5', 'has the multiple property');
            assert.equal(properties[3].textContent.trim(), 'Examples:\n      \n        25', 'has the example');
          });

          it('renders properties inline when less than 3', async () => {
            const data = loader.lookupShape(model, 'AppPerson');
            element = await basicFixture(model, data);

            const property = element.shadowRoot.querySelector('.property-container[data-name="name"]');
            const detail = /** @type HTMLDetailsElement */ (property.querySelector('.property-details'));
            assert.notOk(detail, 'has no detail element');
            
            const properties = property.querySelectorAll('.details-column > .param-properties > .schema-property-item');
            assert.lengthOf(properties, 2, 'has the properties');
          });

          it('renders the description', async () => {
            const data = loader.lookupShape(model, 'AppPerson');
            element = await basicFixture(model, data);

            const property = element.shadowRoot.querySelector('.property-container[data-name="favouriteTime"]');
            const desc = property.querySelector('.api-description');
            assert.ok(desc, 'has the property description');
          });

          it('renders array properties', async () => {
            const data = loader.lookupShape(model, 'PropertyArray');
            element = await basicFixture(model, data);

            const property = element.shadowRoot.querySelector('.property-container[data-name="data"]');

            const type = property.querySelector('.param-type');
            assert.equal(type.textContent.trim(), 'List of Product', 'renders the schema type');
          });

          it('renders array property that is an complex', async () => {
            const data = loader.lookupShape(model, 'PropertyArray');
            element = await basicFixture(model, data);

            const property = element.shadowRoot.querySelector('.property-container[data-name="complex"]');

            const type = property.querySelector('.param-type');
            assert.equal(type.textContent.trim(), 'List of String or Number or Product', 'renders the schema type');
          });

          it('renders a union property', async () => {
            const data = loader.lookupShape(model, 'PropertyArray');
            element = await basicFixture(model, data);

            const property = element.shadowRoot.querySelector('.property-container[data-name="complex"]');
            const decorator = /** @type HTMLElement */ (property.querySelector('.property-decorator'));
            decorator.click();

            await nextFrame();

            const children = element.shadowRoot.querySelector('.shape-children');
            assert.ok(children, 'has children');

            const selector = children.querySelector('.union-options');
            assert.ok(selector, 'has union selector');

            const buttons = selector.querySelectorAll('anypoint-radio-button');
            assert.lengthOf(buttons, 3, 'has all 3 options');

            const defaultRendered = children.querySelector('.union-container .scalar-property');
            assert.ok(defaultRendered, 'has the rendered property');
            assert.equal(defaultRendered.querySelector('.param-type').textContent.trim(), 'String', 'has the scalar type');

            /** @type HTMLElement */ (buttons[2]).click();

            await nextFrame();

            const objectRendered = children.querySelector('.union-container .params-section');
            assert.ok(objectRendered, 'renders selected union object');
          });
        });

        describe('Union type (RAML)', () => {
          /** @type AmfDocument */
          let model;
          before(async () => {
            model = await loader.getGraph(compact);
          });

          /** @type ApiSchemaDocumentElement */
          let element;
          beforeEach(async () => {
            const data = loader.lookupShape(model, 'Unionable');
            element = await basicFixture(model, data, JsonType);
          });

          it('renders the union selector', () => {
            const container = element.shadowRoot.querySelector(':host > .union-container');
            assert.ok(container, 'has the selector\'s container');

            const selector = container.querySelector('.union-options');
            assert.ok(selector, 'has union selector');

            const buttons = selector.querySelectorAll('anypoint-radio-button');
            assert.lengthOf(buttons, 2, 'has all 2 options');

            assert.equal(buttons[0].textContent.trim(), 'ErrorResource', 'has the ErrorResource option');
            assert.equal(buttons[1].textContent.trim(), 'Product', 'has the Product option');
          });

          it('renders union default selection', () => {
            const container = element.shadowRoot.querySelector(':host > .union-container');
            assert.ok(container, 'has the selector\'s container');

            const button = /** @type AnypointRadioButtonElement */ (container.querySelector('.union-options anypoint-radio-button'));
            assert.isTrue(button.checked, 'the first union item is checked');

            const properties = container.querySelectorAll('.params-section .schema-property-item');
            assert.lengthOf(properties, 2, 'has all properties');
          });

          it('changes the selection', async () => {
            const container = element.shadowRoot.querySelector(':host > .union-container');

            const button = /** @type AnypointRadioButtonElement */ (container.querySelector('.union-options anypoint-radio-button[data-member="Product"]'));
            button.click();

            await nextFrame();

            const properties = container.querySelectorAll('.params-section .schema-property-item');
            assert.lengthOf(properties, 7, 'renders properties for another member');
          });

          it('renders the default example', async () => {
            element.forceExamples = true;
            element.processGraph();

            await nextFrame();

            const code = element.shadowRoot.querySelector(':host .examples code');
            const txt = code.textContent.trim();
            const data = JSON.parse(txt);
            
            assert.deepEqual(data, {
              "error": true,
              "message": ""
            });
          });

          it('renders the example for the changed member', async () => {
            element.forceExamples = true;
            element.processGraph();

            const container = element.shadowRoot.querySelector(':host > .union-container');

            const button = /** @type AnypointRadioButtonElement */ (container.querySelector('.union-options anypoint-radio-button[data-member="Product"]'));
            button.click();

            await nextFrame();

            const code = element.shadowRoot.querySelector(':host .examples code');
            const txt = code.textContent.trim();
            const data = JSON.parse(txt);
            
            assert.deepEqual(data, {
              "etag": "",
              "upc": "042100005264",
              "name": "Acme product - menthol flavor, 500 ml.",
              "id": "",
              "unit": "ml",
              "available": true,
              "quantity": 500
            });
          });
        });

        describe('Union property (RAML)', () => {
          /** @type AmfDocument */
          let model;
          before(async () => {
            model = await loader.getGraph(compact);
          });

          /** @type ApiSchemaDocumentElement */
          let element;
          /** @type HTMLElement */
          let container;
          beforeEach(async () => {
            const data = loader.lookupShape(model, 'PropertyArray');
            element = await basicFixture(model, data, JsonType);

            const property = element.shadowRoot.querySelector('.property-container[data-name="complex"]');
            const decorator = /** @type HTMLElement */ (property.querySelector('.property-decorator'));
            decorator.click();

            await nextFrame();

            container = /** @type HTMLElement */ (property.nextElementSibling);
          });

          it('renders the union selector', () => {
            const selector = container.querySelector('.union-options');
            assert.ok(selector, 'has union selector');

            const buttons = selector.querySelectorAll('anypoint-radio-button');
            assert.lengthOf(buttons, 3, 'has all 2 options');

            assert.equal(buttons[0].textContent.trim(), 'String', 'has the ErrorResource option');
            assert.equal(buttons[1].textContent.trim(), 'Number', 'has the Product option');
            assert.equal(buttons[2].textContent.trim(), 'Product', 'has the Product option');
          });

          it('renders union default selection', () => {
            const button = /** @type AnypointRadioButtonElement */ (container.querySelector('.union-options anypoint-radio-button'));
            assert.isTrue(button.checked, 'the first union item is checked');

            const node = container.querySelector('.params-section .scalar-property');
            assert.ok(node, 'has the scalar property');
          });

          it('changes the selection', async () => {
            const button = /** @type AnypointRadioButtonElement */ (container.querySelector('.union-options anypoint-radio-button[data-member="Product"]'));
            button.click();

            await nextFrame();

            const properties = container.querySelectorAll('.params-section .schema-property-item');
            assert.lengthOf(properties, 7, 'renders properties for another member');
          });

          it('renders the default example', async () => {
            element.forceExamples = true;
            element.processGraph();

            await nextFrame();

            const code = element.shadowRoot.querySelector(':host .examples code');
            const txt = code.textContent.trim();
            const data = JSON.parse(txt);
            
            assert.deepEqual(data.complex, ['']);
          });

          it('renders the example for the changed member', async () => {
            element.forceExamples = true;
            element.processGraph();

            const button = /** @type AnypointRadioButtonElement */ (container.querySelector('.union-options anypoint-radio-button[data-member="Product"]'));
            button.click();

            await nextFrame();

            const code = element.shadowRoot.querySelector(':host .examples code');
            const txt = code.textContent.trim();
            const data = JSON.parse(txt);
            
            assert.deepEqual(data.complex, [{
              "id": "we2322-4f4f4f-f4f4ff-f4f4ff4",
              "name": "Acme Product",
              "quantity": 200,
              "unit": "ml",
              "upc": "123456789101",
              "available": true,
              "etag": "Wsd3deef3rgrgf4r"
            }]);
          });
        });

        describe('Array type', () => {
          /** @type AmfDocument */
          let model;
          before(async () => {
            model = await loader.getGraph(compact);
          });

          /** @type ApiSchemaDocumentElement */
          let element;
          beforeEach(async () => {
            const data = loader.lookupShape(model, 'ArrayType');
            element = await examplesFixture(model, data, JsonType);
          });

          it('renders array example', () => {
            const code = element.shadowRoot.querySelector(':host .examples code');
            const txt = code.textContent.trim();
            const data = JSON.parse(txt);

            assert.typeOf(data, 'array');
            const [item] = data;

            assert.deepEqual(item, {
              "url": "https://domain.com/profile/pawel.psztyc/image",
              "thumb": "https://domain.com/profile/pawel.psztyc/image/thumb"
            });
          });

          it('renders "items" title', () => {
            const label = element.shadowRoot.querySelector(':host > .params-section .schema-property-label');
            /*
             * This looks like some issue with AMF graph model as this should render "image" and not "imageProperty".
             * However in the graph model it is in fact "imageProperty". This may be related to another type having 
             * an "imageProperty" which references the "Image" type. I suspect for some kind of optimisation 
             * these type is referenced only once but the name changed after referencing it again.
             */
            assert.equal(label.textContent.trim(), 'List of imageProperty');
          });

          it('renders "items" properties', () => {
            const properties = element.shadowRoot.querySelectorAll(':host > .params-section > .params-section .property-container');
            assert.lengthOf(properties, 2, 'has 2 properties');

            // here I am testing only one property as this is recursive.
            const url = properties[0];
            assert.equal(url.querySelector('.param-label').textContent.trim(), 'url');
            assert.equal(url.querySelector('.param-type').textContent.trim(), 'String');
            assert.equal(url.querySelector('.param-pill').textContent.trim(), 'Required');
            assert.ok(url.querySelector('.api-description arc-marked'), 'Renders the description');
            assert.equal(url.querySelector('.details-column').textContent.trim(), '', 'has no properties');
          });
        });

        describe('And type (OAS)', () => {
          /** @type AmfDocument */
          let model;
          before(async () => {
            model = await loader.getGraph(compact, 'Petstore-v2');
          });

          /** @type ApiSchemaDocumentElement */
          let element;
          beforeEach(async () => {
            const data = loader.lookupShape(model, 'Pet');
            element = await examplesFixture(model, data, JsonType);
          });

          it('renders a group for each member', () => {
            const sections = element.shadowRoot.querySelectorAll('.and-union-member');
            assert.lengthOf(sections, 3, 'has 3 members rendered');
          });

          it('does not render inheritance info for inline items', () => {
            const sections = element.shadowRoot.querySelectorAll('.and-union-member');
            const inline = sections[0];
            assert.notOk(inline.querySelector('.inheritance-label'));
          });

          it('renders inheritance info for members', () => {
            const sections = element.shadowRoot.querySelectorAll('.and-union-member');
            const newPet = sections[1];
            const error = sections[2];
            assert.equal(newPet.querySelector('.inheritance-label').textContent.trim(), 'Properties inherited from NewPet.');
            assert.equal(error.querySelector('.inheritance-label').textContent.trim(), 'Properties inherited from Error.');
          });

          it('renders combined example', () => {
            const code = element.shadowRoot.querySelector(':host .examples code');
            const txt = code.textContent.trim();
            const data = JSON.parse(txt);

            assert.deepEqual(data, {
              "name": "",
              "tag": "",
              "code": 0,
              "message": "",
              "id": 0,
              "test": ""
            });
          });
        });

        describe('Recursive properties', () => {
          /** @type AmfDocument */
          let model;
          before(async () => {
            model = await loader.getGraph(compact);
          });

          /** @type ApiSchemaDocumentElement */
          let element;
          beforeEach(async () => {
            const data = loader.lookupShape(model, 'RecursiveShape');
            element = await examplesFixture(model, data, JsonType);
          });

          it('renders the recursive pill in the property', () => {
            const container = element.shadowRoot.querySelector('.property-container[data-name="relatedTo"]');
            const pill = container.querySelector('.details-column .param-pill');
            assert.ok(pill, 'has the pill');
            assert.isTrue(pill.classList.contains('warning'), 'the pill has the warning class');
            assert.equal(pill.textContent.trim(), 'Recursive', 'the pill has the content');
          });

          it('ignores recursive types in the generated example', () => {
            const code = element.shadowRoot.querySelector(':host .examples code');
            const txt = code.textContent.trim();
            const data = JSON.parse(txt);

            assert.deepEqual(data, {
              id: ""
            });
          });
        });

        describe('File shape', () => {
          /** @type AmfDocument */
          let model;
          before(async () => {
            model = await loader.getGraph(compact);
          });

          /** @type ApiSchemaDocumentElement */
          let element;

          it('renders the file shape', async () => {
            const data = loader.lookupShape(model, 'FileType');
            element = await examplesFixture(model, data, JsonType);
            
            const detail = /** @type HTMLDetailsElement */ (element.shadowRoot.querySelector('.property-details'));
            assert.notOk(detail, 'has no detail element');

            const props = element.shadowRoot.querySelectorAll('.schema-property-item');
            assert.lengthOf(props, 3, 'has all file properties');

            assert.equal(props[0].querySelector('.schema-property-label').textContent.trim(), 'File types:');
            assert.equal(props[0].querySelector('.schema-property-value').textContent.trim(), 'application/mulesoft+modeling, application/data-model');

            assert.equal(props[1].querySelector('.schema-property-label').textContent.trim(), 'Minimum length:');
            assert.equal(props[1].querySelector('.schema-property-value').textContent.trim(), '1024');

            assert.equal(props[2].querySelector('.schema-property-label').textContent.trim(), 'Maximum length:');
            assert.equal(props[2].querySelector('.schema-property-value').textContent.trim(), '2048');
          });

          it('renders the file property', async () => {
            const data = loader.lookupShape(model, 'FilePropertyType');
            element = await examplesFixture(model, data, JsonType);

            const container = element.shadowRoot.querySelector('.property-container[data-name="filetype"]');

            assert.equal(container.querySelector('.param-label').textContent.trim(), 'filetype');
            assert.equal(container.querySelector('.param-type').textContent.trim(), 'File');
            
            const props = element.shadowRoot.querySelectorAll('.schema-property-item');
            assert.lengthOf(props, 3, 'has all file properties');

            assert.equal(props[0].querySelector('.schema-property-label').textContent.trim(), 'File types:');
            assert.equal(props[0].querySelector('.schema-property-value').textContent.trim(), 'image/png, image/jpeg');

            assert.equal(props[1].querySelector('.schema-property-label').textContent.trim(), 'Minimum length:');
            assert.equal(props[1].querySelector('.schema-property-value').textContent.trim(), '100');

            assert.equal(props[2].querySelector('.schema-property-label').textContent.trim(), 'Maximum length:');
            assert.equal(props[2].querySelector('.schema-property-value').textContent.trim(), '300');
          });
        });
      });

      describe('Read only properties', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'read-only-properties');
        });

        /** @type ApiSchemaDocumentElement */
        let element;
        beforeEach(async () => {
          const data = loader.lookupShape(model, 'Article');
          element = await basicFixture(model, data);
        });

        it('renders the readonly property by default', () => {
          const property = element.shadowRoot.querySelector('.property-container[data-name="id"]');
          assert.ok(property, 'has the property');

          const pill = property.querySelector('.param-pill');
          assert.ok(pill, 'has the read-only pill');
          assert.equal(pill.textContent.trim(), 'Read only', 'pill has the label');
        });

        it('does not render the readonly property when configured', async () => {
          element.noReadOnly = true;
          await nextFrame();

          const property = element.shadowRoot.querySelector('.property-container[data-name="id"]');
          assert.notOk(property, 'the property is not rendered');
        });
      });

      describe('APIC-631', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'APIC-631');
        });

        /** @type ApiSchemaDocumentElement */
        let element;

        it('renders first union options as "List of String"', async () => {
          const data = loader.lookupShape(model, 'test2');
          element = await basicFixture(model, data);
          
          const firstToggle = element.shadowRoot.querySelector('.union-toggle');
          assert.equal(firstToggle.textContent.trim().toLowerCase(), 'list of string');
        });

        it('does not render name for inline type', async () => {
          const data = loader.lookupShape(model, 'test3');
          element = await basicFixture(model, data);

          const propertyName = element.shadowRoot.querySelector('.param-label');
          assert.notExists(propertyName);

          const propertyType = element.shadowRoot.querySelector('.schema-property-label');
          assert.equal(propertyType.textContent.trim(), 'List of String');
        });

        it('renders "List of Number" data type', async () => {
          const data = loader.lookupShape(model, 'test8');
          element = await basicFixture(model, data);

          const property = element.shadowRoot.querySelector('.property-container[data-name="names8"]');
          const dataType = property.querySelector('.param-type');
          assert.equal(dataType.textContent.trim(), 'List of Number');
        });
      });

      describe('AAP-1698', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'aap-1698');
        });

        /** @type ApiSchemaDocumentElement */
        let element;
        beforeEach(async () => {
          const [payload] = loader.getPayloads(model, '/not-working', 'post');
          const { schema } = payload;
          element = await schemaFixture(model, schema, JsonType);
        });

        it('renders enum values with the array property', () => {
          // this has only one property
          const property = element.shadowRoot.querySelector('.params-section .schema-property-item');
          const list = property.querySelector('.enum-items');
          assert.ok(list, 'renders the list');
          assert.equal(list.children[0].textContent.trim(), 'lookup');
          assert.equal(list.children[1].textContent.trim(), 'ml');
          assert.equal(list.children[2].textContent.trim(), 'fasttext');
        });

        it('renders an example with enum value', () => {
          const code = element.shadowRoot.querySelector(':host .examples code');
          const txt = code.textContent.trim();
          const data = JSON.parse(txt);

          assert.deepEqual(data.mappers, ["lookup"]);
        });
      });

      describe('APIC-332', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'APIC-332');
        });

        /** @type ApiSchemaDocumentElement */
        let element;
        beforeEach(async () => {
          const [payload] = loader.getPayloads(model, '/organization', 'post');
          const { schema } = payload;
          element = await schemaFixture(model, schema, JsonType);
        });

        it('renders description for an example', () => {
          const description = /** @type HTMLElement */ (element.shadowRoot.querySelector('.example-description'));
          assert.equal(description.innerText, 'This description for the example is never shown');
        });
      });
    });
  });
});

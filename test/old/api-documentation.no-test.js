/* eslint-disable no-shadow */
import { fixture, assert, html, aTimeout, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { AmfLoader } from '../amf-loader.js';
import '../../api-documentation.js';

/** @typedef {import('../..').ApiDocumentationElement} ApiDocumentationElement */

describe('ApiDocumentationElement', () => {
  /**
   * @returns {Promise<ApiDocumentationElement>}
   */
  async function basicFixture() {
    return fixture(html`<api-documentation></api-documentation>`);
  }

  /**
   * @returns {Promise<ApiDocumentationElement>}
   */
  async function inlineFixture(amf, type, selected) {
    return fixture(html`
      <api-documentation
        .amf="${amf}"
        .selectedType="${type}"
        .selected="${selected}"
        inlineMethods
      ></api-documentation>
    `);
  }

  /**
   * @returns {Promise<ApiDocumentationElement>}
   */
  async function modelFixture(amf, type, selected) {
    return fixture(html`
      <api-documentation .amf="${amf}" .selectedType="${type}" .selected="${selected}"></api-documentation>
    `);
  }

  /**
   * @returns {Promise<ApiDocumentationElement>}
   */
  async function partialFixture(amf) {
    return fixture(html`
      <api-documentation .amf="${amf}"></api-documentation>
    `);
  }

  const demoApi = 'demo-api';
  const multiServerApi = 'multi-server';
  const libraryFragment = 'lib-fragment';
  const securityFragment = 'oauth2-fragment';

  describe('Initialization', () => {
    function testNotPresent(item) {
      it(`does not render ${item} in shadow root`, async () => {
        const element = await basicFixture();
        const node = element.shadowRoot.querySelector(item);
        assert.notOk(node);
      });
    }
    [
      'api-summary',
      'api-endpoint-documentation',
      'api-method-documentation',
      'api-documentation-document',
      'api-type-documentation',
      'api-security-documentation'
    ].forEach((item) => testNotPresent(item));

    it('can be initialized with document.createElement', () => {
      const result = document.createElement('api-documentation');
      assert.ok(result);
    });
  });

  [
    ['Compact model', true],
    ['Full model', false]
  ].forEach(([label, compact]) => {
    describe(String(label), () => {
      describe('Basic DOM rendering', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, Boolean(compact));
        });

        function testPresent(item) {
          const [nodeName, type] = item;
          it(`renders ${nodeName} for ${type} type`, async () => {
            const element = await modelFixture(amf, type, 'test');
            await aTimeout(0);
            const node = element.shadowRoot.querySelector(nodeName);
            assert.ok(node);
          });
        }

        [
          ['api-summary', 'summary'],
          ['api-endpoint-documentation', 'endpoint'],
          ['api-method-documentation', 'method'],
          ['api-documentation-document', 'documentation'],
          ['api-type-documentation', 'type'],
          ['api-security-documentation', 'security']
        ].forEach((item) => testPresent(item));
      });

      describe('Changing properties', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, Boolean(compact));
        });

        let element;
        beforeEach(async () => {
          element = await basicFixture();
        });

        it('calls _processModelChange() when amf is set', async () => {
          const spy = sinon.spy(element, '_processModelChange');
          element.amf = amf;
          await aTimeout(0);
          assert.isTrue(spy.called);
        });

        it('calls _processModelChange() when selected is set', async () => {
          const spy = sinon.spy(element, '_processModelChange');
          element.selected = 'test';
          await aTimeout(0);
          assert.isTrue(spy.called);
        });

        it('calls _processModelChange() when selectedType is set', async () => {
          const spy = sinon.spy(element, '_processModelChange');
          element.selectedType = 'method';
          await aTimeout(0);
          assert.isTrue(spy.called);
        });

        it('calls _processModelChange() when inlineMethods is set', async () => {
          const spy = sinon.spy(element, '_processModelChange');
          element.inlineMethods = true;
          await aTimeout(0);
          assert.isTrue(spy.called);
        });

        it('sets __amfProcessingDebouncer', async () => {
          element.inlineMethods = true;
          assert.isTrue(element.__amfProcessingDebouncer);
        });

        it('Eventually resets __amfProcessingDebouncer', async () => {
          element.inlineMethods = true;
          await aTimeout(0);
          assert.isFalse(element.__amfProcessingDebouncer);
        });
      });

      describe('API model processing', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, Boolean(compact));
        });

        it('renders summary', async () => {
          const element = await modelFixture(amf, 'summary', 'summary');
          element.baseUri = 'https://test.com';
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-summary');
          assert.ok(node, 'summary is rendered');
          // @ts-ignore
          assert.typeOf(node.amf, 'object', 'amf is set');
          // @ts-ignore
          assert.equal(node.baseUri, element.baseUri, 'baseUri is set');
        });
        
        it('renders security', async () => {
          const security = AmfLoader.lookupSecurity(amf, 'basic');
          const element = await modelFixture(amf, 'security', security['@id']);
          element.narrow = true;
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-security-documentation');
          assert.ok(node, 'security is rendered');
          // @ts-ignore
          assert.typeOf(node.amf, 'array', 'amf is set');
          // @ts-ignore
          assert.isTrue(node.security === security, 'security model is set');
          // @ts-ignore
          assert.equal(node.narrow, element.narrow, 'narrow is set');
        });

        it('renders type', async () => {
          const type = AmfLoader.lookupType(amf, 'Image');
          const element = await modelFixture(amf, 'type', type['@id']);
          element.narrow = true;
          element.compatibility = true;
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-type-documentation');
          assert.ok(node, 'type is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.type === type, 'type model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
          // @ts-ignore
          assert.equal(node.compatibility, element.compatibility, 'compatibility is set');
          assert.deepEqual(node.mediaTypes, ['application/json', 'application/xml'], 'mediaTypes is set');
        });

        it('renders documentation', async () => {
          const model = AmfLoader.lookupDocumentation(amf, 'Test doc');
          const element = await modelFixture(amf, 'documentation', model['@id']);
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-documentation-document');
          assert.ok(node, 'documentation is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.shape === model, 'type model is set');
        });

        it('renders endpoint', async () => {
          const model = AmfLoader.lookupEndpoint(amf, '/people');
          const element = await modelFixture(amf, 'endpoint', model['@id']);
          element.narrow = true;
          element.compatibility = true;
          element.baseUri = 'https://test.com';
          element.noBottomNavigation = true;
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-endpoint-documentation');
          assert.ok(node, 'endpoint is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.endpoint === model, 'type model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
          assert.equal(node.compatibility, element.compatibility, 'compatibility is set');
          assert.equal(node.selected, model['@id'], 'selected is set');
          assert.equal(node.baseUri, element.baseUri, 'baseUri is set');
          assert.typeOf(node.next, 'object', 'next is set');
          assert.typeOf(node.previous, 'object', 'previous is set');
          // notryit is only set when inlining methods
          assert.isUndefined(node.noTryIt, 'notryit is not set');
          assert.isTrue(node.noNavigation, 'noNavigation is set');
        });

        it('renders method', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people');
          const model = AmfLoader.lookupOperation(amf, '/people', 'post');
          const element = await modelFixture(amf, 'method', model['@id']);
          element.narrow = true;
          element.compatibility = true;
          element.noTryIt = true;
          element.baseUri = 'https://test.com';
          element.noBottomNavigation = true;
          await aTimeout(0);
          const node = /** @type any */ (element.shadowRoot.querySelector('api-method-documentation'));
          assert.ok(node, 'method is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.equal(node.endpoint['@id'], endpoint['@id'], 'endpoint model is set');
          assert.equal(node.method['@id'], model['@id'], 'method model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
          assert.equal(node.compatibility, element.compatibility, 'compatibility is set');
          assert.equal(node.baseUri, element.baseUri, 'baseUri is set');
          assert.typeOf(node.next, 'object', 'next is set');
          assert.typeOf(node.previous, 'object', 'previous is set');
          assert.isTrue(node.noTryIt, 'noTryIt is set');
          assert.isTrue(node.noNavigation, 'noNavigation is set');
        });

        it('renders inline method endpoint selection', async () => {
          const model = AmfLoader.lookupEndpoint(amf, '/people');
          const element = await inlineFixture(amf, 'endpoint', model['@id']);
          element.narrow = true;
          element.compatibility = true;
          element.noTryIt = true;
          element.baseUri = 'https://test.com';
          element.redirectUri = 'https://auth.com';
          element.scrollTarget = window;
          element.noUrlEditor = true;
          element.outlined = true;
          element.noBottomNavigation = true;
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-endpoint-documentation');
          assert.ok(node, 'endpoint is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.equal(node.selected, model['@id'], 'selected is set');
          assert.equal(node.endpoint['@id'], model['@id'], 'endpoint model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
          assert.equal(node.compatibility, element.compatibility, 'compatibility is set');
          assert.equal(node.outlined, element.outlined, 'outlined is set');
          assert.equal(node.baseUri, element.baseUri, 'baseUri is set');
          assert.typeOf(node.next, 'object', 'next is set');
          assert.typeOf(node.previous, 'object', 'previous is set');
          assert.isTrue(node.noTryIt, 'noTryIt is set');
          assert.isTrue(node.noUrlEditor, 'noUrlEditor is set');
          assert.isTrue(node.noTryIt, 'noTryIt is set');
          assert.isTrue(node.inlineMethods, 'inlineMethods is set');
          assert.isTrue(node.noNavigation, 'noNavigation is set');
        });

        it('renders inline method for method selection', async () => {
          const endpoint = AmfLoader.lookupEndpoint(amf, '/people');
          const model = AmfLoader.lookupOperation(amf, '/people', 'post');
          const element = await inlineFixture(amf, 'method', model['@id']);
          element.narrow = true;
          element.compatibility = true;
          element.noTryIt = true;
          element.baseUri = 'https://test.com';
          element.redirectUri = 'https://auth.com';
          element.scrollTarget = window;
          element.noUrlEditor = true;
          element.outlined = true;
          element.noBottomNavigation = true;
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-endpoint-documentation');
          assert.ok(node, 'endpoint is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.equal(node.selected, model['@id'], 'selected is set');
          assert.equal(node.endpoint['@id'], endpoint['@id'], 'endpoint model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
          assert.equal(node.compatibility, element.compatibility, 'compatibility is set');
          assert.equal(node.outlined, element.outlined, 'outlined is set');
          assert.equal(node.baseUri, element.baseUri, 'baseUri is set');
          assert.typeOf(node.next, 'object', 'next is set');
          assert.typeOf(node.previous, 'object', 'previous is set');
          assert.isTrue(node.noTryIt, 'noTryIt is set');
          assert.isTrue(node.noUrlEditor, 'noUrlEditor is set');
          assert.isTrue(node.noTryIt, 'noTryIt is set');
          assert.isTrue(node.inlineMethods, 'inlineMethods is set');
          assert.isTrue(node.noNavigation, 'noNavigation is set');
        });
      });

      describe('API library processing', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(libraryFragment, Boolean(compact));
        });

        it('renders a type from a library', async () => {
          const type = AmfLoader.lookupType(amf, 'myType');
          const element = await modelFixture(amf, 'type', type['@id']);
          element.narrow = true;
          element.compatibility = true;
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-type-documentation');
          assert.ok(node, 'security is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.type === type, 'type model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
          // @ts-ignore
          assert.equal(node.compatibility, element.compatibility, 'compatibility is set');
          // libraries do not have media type
          assert.isUndefined(node.mediaTypes, 'mediaTypes is not set');
        });

        it('renders a security from a library', async () => {
          const security = AmfLoader.lookupSecurity(amf, 'OAuth1');
          const element = await modelFixture(amf, 'security', security['@id']);
          element.narrow = true;
          await aTimeout(0);
          const node = /** @type any */ (element.shadowRoot.querySelector('api-security-documentation'));
          assert.ok(node, 'security is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.security === security, 'security model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
        });
      });

      describe('Security fragment processing', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(securityFragment, Boolean(compact));
        });

        it('renders a security from a fragment', async () => {
          const encodes = AmfLoader.lookupEncodes(amf);
          const security = encodes[0];
          const element = await modelFixture(amf, 'security', security['@id']);
          element.narrow = true;
          await aTimeout(0);
          const node = /** @type any */ (element.shadowRoot.querySelector('api-security-documentation'));
          assert.ok(node, 'security is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.security === security, 'security model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
        });
      });

      describe('Documentation fragment processing', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load('documentation-fragment', Boolean(compact));
        });

        it('renders a documentation from a fragment', async () => {
          const encodes = AmfLoader.lookupEncodes(amf);
          const model = encodes[0];
          const element = await modelFixture(amf, 'documentation', model['@id']);
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-documentation-document');
          assert.ok(node, 'documentation is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.shape === model, 'type model is set');
        });
      });

      describe('Type fragment processing', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load('type-fragment', Boolean(compact));
        });

        it('renders a type from a fragment', async () => {
          const encodes = AmfLoader.lookupEncodes(amf);
          const model = encodes[0];
          const element = await modelFixture(amf, 'from', model['@id']);
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-type-documentation');
          assert.ok(node, 'type is rendered');

          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.type === model, 'type model is set');
        });
      });

      describe('Rendering for library', () => {
        let element = /** @type ApiDocumentationElement */ (null);
        let libraryAmf;

        before(async () => {
          // @ts-ignore
          libraryAmf = await AmfLoader.load('APIC-711', compact);
        });

        beforeEach(async () => {
          element = await basicFixture();
          await nextFrame();
        });

        it('should clear everything when changing to amf for RAML library', async () => {
          // @ts-ignore
          const demoAmf = await AmfLoader.load(demoApi, compact);
          element.amf = demoAmf;
          element.selected = 'summary';
          element.selectedType = 'summary';
          const oldDocsModel = element._docsModel;
          await aTimeout(10);
          element.amf = libraryAmf;
          await aTimeout(10);
          assert.notEqual(element._docsModel, oldDocsModel);
        });
      });
    });
  });

  describe.skip('Documentation partial model', () => {
    let amf;
    before(async () => {
      amf = await AmfLoader.load('partial-model/documentation', false);
    });

    it('renders a documentation', async () => {
      const element = await partialFixture(amf);
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('api-documentation-document');
      assert.ok(node, 'documentation is rendered');
      assert.typeOf(node.amf, 'object', 'amf is set');
      assert.isTrue(node.shape === amf, 'type model is set');
    });
  });

  describe.skip('Security partial model', () => {
    let amf;
    before(async () => {
      amf = await AmfLoader.load('partial-model/security', false);
    });

    it('renders a security', async () => {
      const element = await partialFixture(amf);
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('api-security-documentation');
      assert.ok(node, 'security is rendered');
      // @ts-ignore
      assert.typeOf(node.amf, 'object', 'amf is set');
      // @ts-ignore
      assert.isTrue(node.security === amf, 'security model is set');
    });
  });

  describe.skip('Type partial model', () => {
    let amf;
    before(async () => {
      amf = await AmfLoader.load('partial-model/type', false);
    });

    it('renders a type', async () => {
      const element = await partialFixture(amf);
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('api-type-documentation');
      assert.ok(node, 'type is rendered');
      assert.typeOf(node.amf, 'object', 'amf is set');
      assert.isTrue(node.type === amf, 'type model is set');
    });
  });

  describe.skip('Endpoint partial model', () => {
    let amf;
    before(async () => {
      amf = await AmfLoader.load('partial-model/endpoint', false);
    });

    it('renders an endpoint', async () => {
      const element = await partialFixture(amf);
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('api-endpoint-documentation');
      assert.ok(node, 'endpoint is rendered');
      assert.typeOf(node.amf, 'object', 'amf is set');
    });

    it('renders a method', async () => {
      const element = await partialFixture(amf);
      const opKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.supportedOperation);
      const ops = element._ensureArray(amf[opKey]);
      element.selected = ops[0]['@id'];
      element.selectedType = 'method';
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('api-method-documentation');
      assert.ok(node, 'method is rendered');
      // @ts-ignore
      assert.typeOf(node.amf, 'object', 'amf is set');
    });
  });

  describe('navigation events', () => {
    let amf;
    before(async () => {
      amf = await AmfLoader.load(demoApi, true);
    });

    it('changes selection when event occurs', async () => {
      const element = await partialFixture(amf);
      element.handleNavigationEvents = true;
      await aTimeout(0);
      assert.isTrue(element.handleNavigationEvents, 'getter returns the value');
      const op = AmfLoader.lookupOperation(amf, '/people', 'get');
      const e = new CustomEvent('api-navigation-selection-changed', {
        bubbles: true,
        detail: {
          passive: false,
          selected: op['@id'],
          type: 'method'
        }
      });

      document.body.dispatchEvent(e);
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('api-method-documentation');
      assert.ok(node, 'method is rendered');
    });

    it('ignores passive navigation', async () => {
      const element = await partialFixture(amf);
      element.handleNavigationEvents = true;
      await aTimeout(0);
      const op = AmfLoader.lookupOperation(amf, '/people', 'get');
      const e = new CustomEvent('api-navigation-selection-changed', {
        bubbles: true,
        detail: {
          passive: true,
          selected: op['@id'],
          type: 'method'
        }
      });

      document.body.dispatchEvent(e);
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('api-method-documentation');
      assert.notOk(node, 'method is not rendered');
    });

    it('removes listener when changing state', async () => {
      const element = await partialFixture(amf);
      element.handleNavigationEvents = true;
      await aTimeout(0);
      element.handleNavigationEvents = false;
      const op = AmfLoader.lookupOperation(amf, '/people', 'get');

      const e = new CustomEvent('api-navigation-selection-changed', {
        bubbles: true,
        detail: {
          passive: false,
          selected: op['@id'],
          type: 'method'
        }
      });

      document.body.dispatchEvent(e);
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('api-method-documentation');
      assert.notOk(node, 'method is not rendered');
    });
  });

  [
    ['Compact model', true],
    ['Regular model', false]
  ].forEach(([name, compact]) => {
    describe(String(name), () => {
      describe('Server selection', () => {
        const selectedType = 'method';

        describe('basics', () => {
          let element;
          let amf;

          before(async () => {
            amf = await AmfLoader.load(undefined, Boolean(compact));
          });

          beforeEach(async () => {
            element = await fixture(html`
              <api-documentation .amf="${amf}" selectedType="${selectedType}">
                <anypoint-item slot="custom-base-uri" value="http://customServer.com">
                  Server 1 - http://customServer.com
                </anypoint-item>
                <anypoint-item slot="custom-base-uri" value="http://customServer.com/{version}">
                  Server 2 - http://customServer.com/{version}
                </anypoint-item>
              </api-documentation>
            `);

            await nextFrame();
          });

          it('should set serversCount', () => {
            assert.equal(element.serversCount, 3);
          });

          it('should update serverValue and serverType using the first available server', () => {
            assert.equal(element.serverValue, 'http://{instance}.domain.com/');
            assert.equal(element.serverType, 'server');
          });

          it('should not change the baseUri property', () => {
            assert.isUndefined(element.baseUri);
          });

          it('should render api-server-selector', () => {
            assert.exists(element.shadowRoot.querySelector('api-server-selector'));
          });

          it('should not hide api-server-selector', () => {
            assert.isFalse(element.shadowRoot.querySelector('api-server-selector').hidden);
          });
        });

        describe('serverCount changes to less than 2', () => {
          let serverSelector;
          let element;
          let amf;

          before(async () => {
            amf = await AmfLoader.load(undefined, Boolean(compact));
          });

          beforeEach(async () => {
            element = await fixture(html`
              <api-documentation .amf="${amf}" .selectedType="${selectedType}" narrow></api-documentation>
            `);

            serverSelector = element.shadowRoot.querySelector('api-server-selector');
            serverSelector.servers = [];

            await nextFrame();
          });

          it('should set serversCount', () => {
            assert.equal(element.serversCount, 0);
          });

          it('should hide api-server-selector', () => {
            assert.isTrue(serverSelector.hidden);
          });
        });

        describe('witht allowCustomBaseUri attribute', () => {
          let serverSelector;
          let element;
          let amf;

          before(async () => {
            amf = await AmfLoader.load(undefined, Boolean(compact));
          });

          beforeEach(async () => {
            element = await fixture(html`
              <api-documentation
                .amf="${amf}"
                .selectedType="${selectedType}"
                narrow
                allowcustombaseuri
              ></api-documentation>
            `);

            serverSelector = element.shadowRoot.querySelector('api-server-selector');
            serverSelector.servers = [];

            await nextFrame();
          });

          it('should set serversCount to one', () => {
            assert.equal(element.serversCount, 1);
          });

          it('should show api-server-selector', () => {
            assert.isFalse(serverSelector.hidden);
          });
        });

        describe('selecting a slot server', () => {
          let serverSelector;
          let element;
          let amf;

          before(async () => {
            amf = await AmfLoader.load(undefined, Boolean(compact));
          });

          beforeEach(async () => {
            element = await fixture(html`
              <api-documentation .amf="${amf}" selectedType="${selectedType}">
                <anypoint-item slot="custom-base-uri" value="http://customServer.com">
                  Server 1 - http://customServer.com
                </anypoint-item>
                <anypoint-item slot="custom-base-uri" value="http://customServer.com/{version}">
                  Server 2 - http://customServer.com/{version}
                </anypoint-item>
              </api-documentation>
            `);

            await nextFrame();

            const event = {
              detail: {
                value: 'http://customServer.com',
                type: 'uri'
              }
            };

            serverSelector = element.shadowRoot.querySelector('api-server-selector');
            serverSelector.dispatchEvent(new CustomEvent('apiserverchanged', event));

            await nextFrame();
          });

          it('should update serverValue and serverType', () => {
            assert.equal(element.serverValue, 'http://customServer.com');
            assert.equal(element.serverType, 'uri');
          });
        });

        describe('selecting a custom base uri', () => {
          let serverSelector;
          let element;

          let amf;

          before(async () => {
            amf = await AmfLoader.load(undefined, Boolean(compact));
          });

          beforeEach(async () => {
            const event = {
              detail: {
                value: 'https://www.google.com',
                type: 'custom'
              }
            };

            element = await fixture(html`
              <api-documentation .amf="${amf}" selectedType="${selectedType}">
                <anypoint-item slot="custom-base-uri" value="http://customServer.com">
                  Server 1 - http://customServer.com
                </anypoint-item>
                <anypoint-item slot="custom-base-uri" value="http://customServer.com/{version}">
                  Server 2 - http://customServer.com/{version}
                </anypoint-item>
              </api-documentation>
            `);

            serverSelector = element.shadowRoot.querySelector('api-server-selector');
            serverSelector.dispatchEvent(new CustomEvent('apiserverchanged', event));
          });

          it('should update serverValue and serverType', () => {
            assert.equal(element.serverValue, 'https://www.google.com');
            assert.equal(element.serverType, 'custom');
          });

          describe('clearing the selection', () => {
            beforeEach(() => {
              const event = {
                detail: {
                  value: undefined,
                  type: undefined
                }
              };

              serverSelector.dispatchEvent(new CustomEvent('apiserverchanged', event));
            });

            it('should update serverValue and serverType', () => {
              assert.equal(element.serverValue, undefined);
              assert.equal(element.serverType, undefined);
            });

            describe('selecting an existing server', () => {
              beforeEach(() => {
                const event = {
                  detail: {
                    value: 'http://{instance}.domain.com/',
                    type: 'server'
                  }
                };

                serverSelector.dispatchEvent(new CustomEvent('apiserverchanged', event));
              });

              it('should update serverValue and serverType', () => {
                assert.equal(element.serverValue, 'http://{instance}.domain.com/');
                assert.equal(element.serverType, 'server');
              });
            });
          });
        });

        describe('when serverType is not server', () => {
          let server;
          let element;
          let amf;

          before(async () => {
            amf = await AmfLoader.load(undefined, Boolean(compact));
          });

          beforeEach(async () => {
            element = await fixture(html`
              <api-documentation .amf="${amf}" selectedType="custom">
                <anypoint-item slot="custom-base-uri" value="http://customServer.com">
                  Server 1 - http://customServer.com
                </anypoint-item>
                <anypoint-item slot="custom-base-uri" value="http://customServer.com/{version}">
                  Server 2 - http://customServer.com/{version}
                </anypoint-item>
              </api-documentation>
            `);

            // @ts-ignore
            server =  element.server;
          });

          it('should return server null', () => {
            assert.equal(server, null);
          })
        });

        describe('navigating to something other than a method or an endpoint', () => {
          let server;
          let element;
          let amf;

          before(async () => {
            amf = await AmfLoader.load(undefined, Boolean(compact));
          });

          beforeEach(async () => {
            element = await fixture(html`
              <api-documentation .amf="${amf}" selectedType="summary" selected="summary">
                <anypoint-item slot="custom-base-uri" value="http://customServer.com">
                  Server 1 - http://customServer.com
                </anypoint-item>
                <anypoint-item slot="custom-base-uri" value="http://customServer.com/{version}">
                  Server 2 - http://customServer.com/{version}
                </anypoint-item>
              </api-documentation>
            `);

            server =  element.server;
          });

          it('should return server null', () => {
            assert.equal(server, null);
          })

          it('should hide api-server-selector', () => {
            assert.isTrue(element.shadowRoot.querySelector('api-server-selector').hidden);
          });
        });

        [
          ['method', '#505', { methodId: '#505', endpointId: undefined }],
          ['endpoint', '#1010', { methodId: undefined, endpointId: '#1010' }]
        ].forEach(([navigationType, navigationId, serversCallParams]) => {
          describe(`navigating to a ${navigationType}`, () => {
            let _getServersStub;
            let servers;
            let server;
            let element;
            let amf;

            before(async () => {
              amf = await AmfLoader.load(undefined, Boolean(compact));
            });

            beforeEach(async () => {
              element = await fixture(html`
                <api-documentation .amf="${amf}" selectedType="${navigationType}" selected="${navigationId}">
                  <anypoint-item slot="custom-base-uri" value="http://customServer.com">
                    Server 1 - http://customServer.com
                  </anypoint-item>
                  <anypoint-item slot="custom-base-uri" value="http://customServer.com/{version}">
                    Server 2 - http://customServer.com/{version}
                  </anypoint-item>
                </api-documentation>
              `);
            });

            describe('with no servers', () => {
              beforeEach(() => {
                servers = [];
                _getServersStub = sinon.stub(element, '_getServers').returns(servers);

                server = element.server;
              });

              it(`should call getServers with the ${navigationType}Id`, () => {
                assert.isTrue(_getServersStub.calledWith());
              });

              it('should set the server to null', () => {
                assert.equal(server, null);
              });
            });

            describe('with one server', () => {
              beforeEach(() => {
                servers = [{}];
                _getServersStub = sinon.stub(element, '_getServers').returns(servers);

                sinon
                  .stub(element, '_getServerUri')
                  .withArgs(servers[0])
                  .returns('http://{instance}.domain.com/');
              });

              describe('with a serverValue', () => {
                beforeEach(() => {
                  server = element.server;
                });

                it(`should call getServers with the ${navigationType}Id`, () => {
                  assert.isTrue(_getServersStub.calledWith(serversCallParams));
                });

                it('should return the first server', () => {
                  assert.equal(server, servers[0]);
                });
              });

              describe('with no serverValue', () => {
                beforeEach(() => {
                  element.serverValue = '';

                  server = element.server;
                });

                it(`should call getServers with the ${navigationType}Id`, () => {
                  assert.isTrue(_getServersStub.calledWith(serversCallParams));
                });

                it('should return the first server', () => {
                  assert.equal(server, servers[0]);
                });
              });
            });
          });
        });

        describe('noServerSelector is true', () => {
          let element;
          let amf;

          before(async () => {
            amf = await AmfLoader.load(undefined, Boolean(compact));
          });

          beforeEach(async () => {
            element = await partialFixture(amf);
            element.noServerSelector = true;

            await nextFrame();
          });

          it('should not render api-server-selector', () => {
            assert.notExists(element.shadowRoot.querySelector('api-server-selector'));
          });
        });

        describe('initial selected node', () => {
          let model;
          let element;
          let selected;
          let selectedType;

          before(async () => {
            model = await AmfLoader.load(multiServerApi, compact);
          });

          it('selects operation servers', async () => {
            selectedType = 'method';
            selected = AmfLoader.lookupOperation(model, '/ping', 'get')['@id'];
            element = await modelFixture(model, selectedType, selected);
            const serverSelector = element.shadowRoot.querySelector('api-server-selector');
            assert.lengthOf(serverSelector.servers, 2);
          });

          it('selects endpoint servers', async () => {
            selectedType = 'endpoint';
            selected = AmfLoader.lookupEndpoint(model, '/ping')['@id'];
            element = await modelFixture(model, selectedType, selected);
            const serverSelector = element.shadowRoot.querySelector('api-server-selector');
            assert.lengthOf(serverSelector.servers, 1);
          });
        });
      });
    });
  });

  [
    ['Compact model', true],
    ['Full model', false]
  ].forEach(([label, compact]) => {
    describe(String(label), () => {
      describe('API library processing', () => {
        let amf;

        beforeEach(async () => {
          amf = await AmfLoader.load('APIC-390', compact);
        });

        it('renders SiteId type defined in library', async () => {
          const type = AmfLoader.lookupType(amf, 'SiteId');
          const element = await modelFixture(amf, 'type', type['@id']);
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-type-documentation');
          assert.ok(node, 'type is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.type === type, 'type model is set');
        });

        it('renders Language type defined in uses node in library', async () => {
          const type = AmfLoader.lookupType(amf, 'LocaleCode');
          const element = await modelFixture(amf, 'type', type['@id']);
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-type-documentation');
          assert.ok(node, 'type is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.type === type, 'type model is set');
        });
      });
    });
  });

  describe('_computeApiMediaTypes()', () => {
    it('should return undefined if no encodes', async () => {
      const element = await basicFixture();

      const model = {};

      const actual = element._computeApiMediaTypes(model);
      assert.deepEqual(actual, undefined);
    });

    it('should return undefined if no media types present', async () => {
      const element = await basicFixture();

      const encodesKey = element._getAmfKey(element.ns.aml.vocabularies.document.encodes);

      const encodes = { '@type': [element._getAmfKey(element.ns.schema.webApi)] };

      const model = { [encodesKey]: encodes };

      const actual = element._computeApiMediaTypes(model);
      assert.deepEqual(actual, undefined);
    });

    it('should return values when they are contained in "@value" property', async () => {
      const expected = ['application/json', 'application/xml'];
      const element = await basicFixture();

      const encodesKey = element._getAmfKey(element.ns.aml.vocabularies.document.encodes);
      const acceptsKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.accepts);

      const encodes = {
        '@type': [element._getAmfKey(element.ns.schema.webApi)],
        [acceptsKey]: [{ '@value': 'application/json' }, { '@value': 'application/xml' }]
      };

      const model = { [encodesKey]: encodes };

      const actual = element._computeApiMediaTypes(model);
      assert.deepEqual(actual, expected);
    });

    it('should return values when they are not contained in "@value" property', async () => {
      const expected = ['application/json', 'application/xml'];
      const element = await basicFixture();

      const encodesKey = element._getAmfKey(element.ns.aml.vocabularies.document.encodes);
      const acceptsKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.accepts);

      const encodes = {
        '@type': [element._getAmfKey(element.ns.schema.webApi)],
        [acceptsKey]: ['application/json', 'application/xml']
      };

      const model = { [encodesKey]: encodes };

      const actual = element._computeApiMediaTypes(model);
      assert.deepEqual(actual, expected);
    });
  });
});

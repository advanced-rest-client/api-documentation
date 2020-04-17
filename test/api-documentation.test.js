import { fixture, assert, html, aTimeout, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { AmfLoader } from './amf-loader.js';
import '../api-documentation.js';

describe('<api-documentation>', function() {
  async function basicFixture() {
    return await fixture(`<api-documentation></api-documentation>`);
  }

  async function awareFixture() {
    return await fixture(`<api-documentation aware="test"></api-documentation>`);
  }

  async function inlineFixture(amf, type, selected) {
    return await fixture(html`
      <api-documentation
        .amf="${amf}"
        .selectedType="${type}"
        .selected="${selected}"
        inlinemethods
      ></api-documentation>
    `);
  }

  async function modelFixture(amf, type, selected) {
    return await fixture(html`
      <api-documentation .amf="${amf}" .selectedType="${type}" .selected="${selected}"></api-documentation>
    `);
  }

  async function partialFixture(amf) {
    return await fixture(html`
      <api-documentation .amf="${amf}"></api-documentation>
    `);
  }

  const demoApi = 'demo-api';
  const libraryFragment = 'lib-fragment';
  const securityFragment = 'oauth2-fragment';

  describe('RAML aware', () => {
    it('Adds raml-aware to the DOM if aware is set', async () => {
      const element = await awareFixture();
      const node = element.shadowRoot.querySelector('raml-aware');
      assert.ok(node);
    });

    it('passes AMF model', async () => {
      const element = await awareFixture();
      const aware = document.createElement('raml-aware');
      aware.scope = 'test';
      aware.api = [{}];
      assert.deepEqual(element.amf, [{}]);
      await aTimeout();
    });

    it('raml-aware is not in the DOM by default', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('raml-aware');
      assert.notOk(node);
    });
  });

  describe('Initialization', () => {
    function testNotPresent(item) {
      it(`does not rennder ${item} in shadow root`, async () => {
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
    describe(label, () => {
      describe('Basic DOM rendering', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        function testPresent(item) {
          const [nodeName, type] = item;
          it(`renders ${nodeName} for ${type} type`, async () => {
            const element = await modelFixture(amf, type, 'test');
            await aTimeout();
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
          amf = await AmfLoader.load(demoApi, compact);
        });

        let element;
        beforeEach(async () => {
          element = await basicFixture();
        });

        it('calls _processModelChange() when amf is set', async () => {
          const spy = sinon.spy(element, '_processModelChange');
          element.amf = amf;
          await aTimeout();
          assert.isTrue(spy.called);
        });

        it('calls _updateServers() when selected is set', async () => {
          const spy = sinon.spy(element, '_updateServers');
          element.selected = 'summary';
          await aTimeout();
          assert.isTrue(spy.called);
        });

        it('calls _processModelChange() when selected is set', async () => {
          const spy = sinon.spy(element, '_processModelChange');
          element.selected = 'test';
          await aTimeout();
          assert.isTrue(spy.called);
        });

        it('calls _processModelChange() when selectedType is set', async () => {
          const spy = sinon.spy(element, '_processModelChange');
          element.selectedType = 'method';
          await aTimeout();
          assert.isTrue(spy.called);
        });

        it('calls _updateServers() when selectedType is set', async () => {
          const spy = sinon.spy(element, '_updateServers');
          element.selectedType = 'method';
          await aTimeout();
          assert.isTrue(spy.called);
        });

        it('calls _processModelChange() when inlineMethods is set', async () => {
          const spy = sinon.spy(element, '_processModelChange');
          element.inlineMethods = true;
          await aTimeout();
          assert.isTrue(spy.called);
        });

        it('sets __amfProcessingDebouncer', async () => {
          element.inlineMethods = true;
          assert.isTrue(element.__amfProcessingDebouncer);
        });

        it('Eventually resets __amfProcessingDebouncer', async () => {
          element.inlineMethods = true;
          await aTimeout();
          assert.isFalse(element.__amfProcessingDebouncer);
        });
      });

      describe('API model processing', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(demoApi, compact);
        });

        it('renders summary', async () => {
          const element = await modelFixture(amf, 'summary', 'summary');
          element.baseUri = 'https://test.com';
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-summary');
          assert.ok(node, 'summary is rendered');
          assert.typeOf(node.amf, 'object', 'amf is set');
          assert.equal(node.baseUri, element.baseUri, 'baseUri is set');
        });

        it('renders security', async () => {
          const security = AmfLoader.lookupSecurity(amf, 'basic');
          const element = await modelFixture(amf, 'security', security['@id']);
          element.narrow = true;
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-security-documentation');
          assert.ok(node, 'security is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.security === security, 'security model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
        });

        it('renders type', async () => {
          const type = AmfLoader.lookupType(amf, 'Image');
          const element = await modelFixture(amf, 'type', type['@id']);
          element.narrow = true;
          element.compatibility = true;
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-type-documentation');
          assert.ok(node, 'type is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.type === type, 'type model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
          assert.equal(node.compatibility, element.compatibility, 'compatibility is set');
          assert.deepEqual(node.mediaTypes, ['application/json', 'application/xml'], 'mediaTypes is set');
        });

        it('renders documentation', async () => {
          const model = AmfLoader.lookupDocumentation(amf, 'Test doc');
          const element = await modelFixture(amf, 'documentation', model['@id']);
          await aTimeout();
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
          await aTimeout();
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
          assert.isUndefined(node.notryit, 'notryit is not set');
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
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-method-documentation');
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
          await aTimeout();
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
          await aTimeout();
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
          amf = await AmfLoader.load(libraryFragment, compact);
        });

        it('renders a type from a library', async () => {
          const type = AmfLoader.lookupType(amf, 'myType');
          const element = await modelFixture(amf, 'type', type['@id']);
          element.narrow = true;
          element.compatibility = true;
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-type-documentation');
          assert.ok(node, 'security is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.type === type, 'type model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
          assert.equal(node.compatibility, element.compatibility, 'compatibility is set');
          // libraries do not have media type
          assert.isUndefined(node.mediaTypes, 'mediaTypes is not set');
        });

        it('renders a security from a library', async () => {
          const security = AmfLoader.lookupSecurity(amf, 'OAuth1');
          const element = await modelFixture(amf, 'security', security['@id']);
          element.narrow = true;
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-security-documentation');
          assert.ok(node, 'security is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.security === security, 'security model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
        });
      });

      describe('Security fragment processing', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(securityFragment, compact);
        });

        it('renders a security from a fragment', async () => {
          const encodes = AmfLoader.lookupEncodes(amf);
          const security = encodes[0];
          const element = await modelFixture(amf, 'security', security['@id']);
          element.narrow = true;
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-security-documentation');
          assert.ok(node, 'security is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.security === security, 'security model is set');
          assert.equal(node.narrow, element.narrow, 'narrow is set');
        });
      });

      describe('Documentation fragment processing', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load('documentation-fragment', compact);
        });

        it('renders a documentation from a fragment', async () => {
          const encodes = AmfLoader.lookupEncodes(amf);
          const model = encodes[0];
          const element = await modelFixture(amf, 'documentation', model['@id']);
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-documentation-document');
          assert.ok(node, 'documentation is rendered');
          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.shape === model, 'type model is set');
        });
      });

      describe('Type fragment processing', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load('type-fragment', compact);
        });

        it('renders a type from a fragment', async () => {
          const encodes = AmfLoader.lookupEncodes(amf);
          const model = encodes[0];
          const element = await modelFixture(amf, 'from', model['@id']);
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-type-documentation');
          assert.ok(node, 'type is rendered');

          assert.typeOf(node.amf, 'array', 'amf is set');
          assert.isTrue(node.type === model, 'type model is set');
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
      await aTimeout();
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
      await aTimeout();
      const node = element.shadowRoot.querySelector('api-security-documentation');
      assert.ok(node, 'security is rendered');
      assert.typeOf(node.amf, 'object', 'amf is set');
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
      await aTimeout();
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
      await aTimeout();
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
      await aTimeout();
      const node = element.shadowRoot.querySelector('api-method-documentation');
      assert.ok(node, 'method is rendered');
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
      await aTimeout();
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
      await aTimeout();
      const node = element.shadowRoot.querySelector('api-method-documentation');
      assert.ok(node, 'method is rendered');
    });

    it('ignores passive navigation', async () => {
      const element = await partialFixture(amf);
      element.handleNavigationEvents = true;
      await aTimeout();
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
      await aTimeout();
      const node = element.shadowRoot.querySelector('api-method-documentation');
      assert.notOk(node, 'method is not endered');
    });

    it('removes listener when changing state', async () => {
      const element = await partialFixture(amf);
      element.handleNavigationEvents = true;
      await aTimeout();
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
      await aTimeout();
      const node = element.shadowRoot.querySelector('api-method-documentation');
      assert.notOk(node, 'method is not endered');
    });
  });

  [
    ['Compact model', true],
    ['Regular model', false]
  ].forEach(([name, compact]) => {
    describe(name, () => {
      describe('Server selection', () => {
        let element;
        let amf;
        let selectedType;

        describe('in narrow mode', () => {
          beforeEach(async () => {
            amf = await AmfLoader.load(null, compact);
            selectedType = 'method';

            element = await fixture(html`
              <api-documentation .amf="${amf}" .selectedType="${selectedType}" narrow>
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

          it('should load servers', () => {
            assert.lengthOf(element.servers, 1);
          });

          it('should set serversCount', () => {
            assert.equal(element.serversCount, 4);
          });

          it('should update selectedServerValue and selectedServerType using the first available server', () => {
            assert.equal(element.selectedServerValue, 'http://{instance}.domain.com/');
            assert.equal(element.selectedServerType, 'server');
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

          describe('navigating to something other than a method or an endpoint', () => {
            beforeEach(async () => {
              element.selectedType = 'summary';
              element.selected = 'summary';

              await aTimeout();
            });

            it('should hide api-server-selector', () => {
              assert.isTrue(element.shadowRoot.querySelector('api-server-selector').hidden);
            });
          });

          describe('serverCount changes to less than 2', () => {
            let serverSelector;

            beforeEach(async () => {
              serverSelector = element.shadowRoot.querySelector('api-server-selector');

              serverSelector.dispatchEvent(new CustomEvent('servers-count-changed', { detail: { serversCount: 1 } }));

              await aTimeout();
            });

            it('should set serversCount', () => {
              assert.equal(element.serversCount, 1);
            });

            it('should hide api-server-selector', () => {
              assert.isTrue(serverSelector.hidden);
            });
          });

          describe('selecting a slot server', () => {
            beforeEach(() => {
              const event = {
                detail: {
                  selectedValue: 'http://customServer.com',
                  selectedType: 'slot'
                }
              };
              window.dispatchEvent(new CustomEvent('api-server-changed', event));
            });

            it('should update selectedServerValue and selectedServerType', () => {
              assert.equal(element.selectedServerValue, 'http://customServer.com');
              assert.equal(element.selectedServerType, 'slot');
            });
          });

          describe('selecting a custom base uri', () => {
            beforeEach(async () => {
              const event = {
                detail: {
                  selectedValue: 'https://www.google.com',
                  selectedType: 'custom'
                }
              };
              window.dispatchEvent(new CustomEvent('api-server-changed', event));
            });

            it('should update selectedServerValue and selectedServerType', () => {
              assert.equal(element.selectedServerValue, 'https://www.google.com');
              assert.equal(element.selectedServerType, 'custom');
            });

            describe('clearing the selection', () => {
              beforeEach(() => {
                const event = {
                  detail: {
                    selectedValue: undefined,
                    selectedType: undefined
                  }
                };
                window.dispatchEvent(new CustomEvent('api-server-changed', event));
              });

              it('should update selectedServerValue and selectedServerType', () => {
                assert.equal(element.selectedServerValue, undefined);
                assert.equal(element.selectedServerType, undefined);
              });

              describe('selecting an existing server', () => {
                beforeEach(() => {
                  const event = {
                    detail: {
                      selectedValue: 'http://{instance}.domain.com/',
                      selectedType: 'server'
                    }
                  };
                  window.dispatchEvent(new CustomEvent('api-server-changed', event));
                });

                it('should update selectedServerValue and selectedServerType', () => {
                  assert.equal(element.selectedServerValue, 'http://{instance}.domain.com/');
                  assert.equal(element.selectedServerType, 'server');
                });
              });
            });
          });

          describe('navigating to a method', () => {
            let _getServersStub;
            let _updateServerValuesSpy;
            let servers;

            beforeEach(() => {
              servers = [];
              _getServersStub = sinon.stub(element, '_getServers').returns(servers);
              _updateServerValuesSpy = sinon.spy(element, '_updateServerValues');

              element.selectedType = 'method';
              element.selected = '#505';
            });

            it('should call getServers with the methodId', () => {
              assert.isTrue(_getServersStub.calledWith({ methodId: '#505', endpointId: undefined }));
            });

            it('should set the servers', () => {
              assert.equal(element.servers, servers);
            });

            it('calls _updateServerValues', () => {
              assert.isTrue(_updateServerValuesSpy.called);
            });
          });

          describe('navigating to an endpoint', () => {
            let _getServersStub;
            let _updateServerValuesSpy;
            let servers;

            beforeEach(() => {
              servers = [];
              _getServersStub = sinon.stub(element, '_getServers').returns(servers);
              _updateServerValuesSpy = sinon.spy(element, '_updateServerValues');

              element.selectedType = 'endpoint';
              element.selected = '#1010';
            });

            it('should call getServers with the endpointId', () => {
              assert.isTrue(_getServersStub.calledWith({ methodId: undefined, endpointId: '#1010' }));
            });

            it('should set the servers', () => {
              assert.equal(element.servers, servers);
            });

            it('calls _updateServerValues', () => {
              assert.isTrue(_updateServerValuesSpy.called);
            });
          });
        });

        describe('not in narrow mode', () => {
          beforeEach(async () => {
            element = await partialFixture(amf);
          });

          it('should not render api-server-selector', () => {
            assert.notExists(element.shadowRoot.querySelector('api-server-selector'));
          });
        });

        describe('noServerSelector is true', () => {
          beforeEach(async () => {
            element = await partialFixture(amf);
            element.noServerSelector = true;
          });

          it('should not render api-server-selector', () => {
            assert.notExists(element.shadowRoot.querySelector('api-server-selector'));
          });
        });
      });
    });
  });
});

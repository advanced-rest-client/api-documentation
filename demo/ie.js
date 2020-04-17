import { html, render } from 'lit-html';
import { LitElement } from 'lit-element';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@api-components/api-navigation/api-navigation.js';
import '@polymer/paper-toast/paper-toast.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '@anypoint-web-components/anypoint-styles/typography.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '@advanced-rest-client/xhr-simple-request/xhr-simple-request.js';
import '../api-documentation.js';

class DemoElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('demo-element', DemoElement);

class ComponentDemo extends ApiDemoPageBase {
  constructor() {
    super();
    this._componentName = 'api-documentation';

    this.initObservableProperties([
      'legacy',
      'narrow',
      'noTryit',
      'noServerSelector',
      'noCustomServer',
      'inlineMethods',
      'scrollTarget',
      'selected',
      'selectedType'
    ]);
    this.noTryit = false;
    this.codeSnippets = true;
    this.renderSecurity = true;
    this.noServerSelector = false;
    this.noCustomServer = false;
    this.redirectUri = 'https://auth.advancedrestclient.com/oauth-popup.html';
    this.scrollTarget = window;

    this.demoStates = ['Material', 'Anypoint'];
    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._tryitRequested = this._tryitRequested.bind(this);
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    switch (state) {
      case 0:
        this.legacy = false;
        break;
      case 1:
        this.legacy = true;
        break;
    }
    if (this.legacy) {
      document.body.classList.add('anypoint');
    } else {
      document.body.classList.remove('anypoint');
    }
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  get helper() {
    if (!this.__helper) {
      this.__helper = document.getElementById('helper');
    }
    return this.__helper;
  }

  _navChanged(e) {
    const { selected, type, passive } = e.detail;
    if (passive) {
      return;
    }
    this.selected = selected;
    this.selectedType = type;
  }

  _apiListTemplate() {
    const result = [];

    [
      ['google-drive-api', 'Google Drive'],
      ['exchange-experience-api', 'Exchange xAPI'],
      ['demo-api', 'Demo API'],
      ['array-body', 'Body with array test case'],
      ['nexmo-sms-api', 'Nexmo SMS API'],
      ['appian-api', 'Applian API'],
      ['APIC-15', 'APIC-15'],
      ['oauth1-fragment', 'OAuth 1 fragment'],
      ['oauth2-fragment', 'OAuth 2 fragment'],
      ['documentation-fragment', 'Documentation fragment'],
      ['type-fragment', 'Type fragment'],
      ['lib-fragment', 'Library fragment'],
      ['SE-10469', 'SE-10469'],
      ['SE-11415', 'SE-11415'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <paper-item data-src="${file}-compact.json">${label} - compact model</paper-item>
      <paper-item data-src="${file}.json">${label}</paper-item>`;
    });

    [
      ['partial-model/documentation', 'Partial model: Documentation'],
      ['partial-model/endpoint', 'Partial model: Endpoint'],
      ['partial-model/security', 'Partial model: Security'],
      ['partial-model/type', 'Partial model: Type']
    ].forEach(([file, label]) => {
      result[result.length] = html`<paper-item data-src="${file}.json">${label}</paper-item>`;
    });
    return result;
  }

  _tryitRequested() {
    const toast = document.getElementById('tryItToast');
    toast.opened = true;
  }

  _demoTemplate() {
    const {
      legacy,
      amf,
      narrow,
      selected,
      selectedType,
      scrollTarget,
      redirectUri,
      inlineMethods,
      noTryit,
      noServerSelector,
      noCustomServer
    } = this;
    return html `
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API method documentation element with various
        configuration options.
      </p>

        <div class="doc-container">
          ${this._apiNavigationTemplate()}
          <api-documentation
            .amf="${amf}"
            .selected="${selected}"
            .selectedType="${selectedType}"
            .scrollTarget="${scrollTarget}"
            .redirectUri="${redirectUri}"
            .inlineMethods="${inlineMethods}"
            .noTryIt="${noTryit}"
            .noServerSelector="${noServerSelector}"
            .noCustomServer="${noCustomServer}"
            ?narrow="${narrow}"
            ?legacy="${legacy}"
            handleNavigationEvents
            @tryit-requested="${this._tryitRequested}">
              <anypoint-item slot="custom-base-uri" value="http://customServer.com">
                Server 1 - http://customServer.com
              </anypoint-item>
              <anypoint-item slot="custom-base-uri" value="http://customServer.com/{version}">
                Server 2 - http://customServer.com/{version}
              </anypoint-item>
            </api-documentation>
        </div>
    </section>`;
  }

  _introductionTemplate() {
    return html `
      <section class="documentation-section">
        <h3>Introduction</h3>
        <p>
          A web component to render documentation for an API endpoint. The view is rendered
          using AMF data model.
        </p>
      </section>
    `;
  }

  _usageTemplate() {
    return html `
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>API request editor comes with 2 predefied styles:</p>
        <ul>
          <li><b>Material Design</b> (default)</li>
          <li>
            <b>Legacy</b> - To provide compatibility with legacy Anypoint design, use
            <code>legacy</code> property
          </li>
        </ul>
      </section>`;
  }

  _render() {
    const { amf } = this;
    render(html`
      ${this.headerTemplate()}

      <demo-element id="helper" .amf="${amf}"></demo-element>
      <xhr-simple-request></xhr-simple-request>
      <oauth2-authorization></oauth2-authorization>
      <oauth1-authorization></oauth1-authorization>
      <paper-toast id="navToast"></paper-toast>
      <paper-toast id="tryItToast" text="Try it panel requested"></paper-toast>

      <div role="main">
        <h2 class="centered main">API endpoint documentation</h2>
        ${this._demoTemplate()}
        ${this._introductionTemplate()}
        ${this._usageTemplate()}
      </div>
      `, document.querySelector('#demo'));
  }
}
const instance = new ComponentDemo();
instance.render();
window.demo = instance;

import { html } from 'lit-html';
import { ApiDemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@api-components/api-navigation/api-navigation.js';
import '@api-components/api-request/xhr-simple-request.js';
import '@polymer/paper-toast/paper-toast.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '@anypoint-web-components/anypoint-styles/typography.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '../api-documentation.js';

class ComponentDemo extends ApiDemoPage {
  constructor() {
    super();

    this.initObservableProperties([
      'narrow',
      'noTryit',
      'noServerSelector',
      'allowCustomBaseUri',
      'inlineMethods',
      'scrollTarget',
      'selected',
      'selectedType',
      'serverType',
      'serverValue',
      'compatibility',
      'renderCustomServer',
    ]);
    this.componentName = 'api-documentation';
    this.noTryit = false;
    this.compatibility = false;
    this.inlineMethods = false;
    this.renderCustomServer = false;
    this.noServerSelector = false;
    this.allowCustomBaseUri = false;
    this.codeSnippets = true;
    this.renderSecurity = true;

    this.redirectUri = 'https://auth.advancedrestclient.com/oauth-popup.html';
    this.scrollTarget = window;

    this.demoStates = ['Material', 'Anypoint'];
    this._tryitRequested = this._tryitRequested.bind(this);
    this._serverHandler = this._serverHandler.bind(this);
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
      ['multi-server', 'Multiple servers'],
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
      <anypoint-item data-src="${file}-compact.json">${label} - compact model</anypoint-item>
      <anypoint-item data-src="${file}.json">${label}</anypoint-item>`;
    });

    [
      ['partial-model/documentation', 'Partial model: Documentation'],
      ['partial-model/endpoint', 'Partial model: Endpoint'],
      ['partial-model/security', 'Partial model: Security'],
      ['partial-model/type', 'Partial model: Type'],
    ].forEach(([file, label]) => {
      result[result.length] = html`<anypoint-item data-src="${file}.json">${label}</anypoint-item>`;
    });
    return result;
  }

  _tryitRequested() {
    const toast = document.getElementById('tryItToast');
    // @ts-ignore
    toast.opened = true;
  }

  _serverHandler(e) {
    const { value, type } = e.detail;
    this.serverType = type;
    this.serverValue = value;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      amf,
      narrow,
      selected,
      selectedType,
      scrollTarget,
      redirectUri,
      inlineMethods,
      noTryit,
      noServerSelector,
      allowCustomBaseUri,
      serverType,
      serverValue,
    } = this;
    return html `
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API method documentation element with various
        configuration options.
      </p>

      <arc-interactive-demo
        .states="${demoStates}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <api-documentation
          slot="content"
          .amf="${amf}"
          .selected="${selected}"
          .selectedType="${selectedType}"
          .scrollTarget="${scrollTarget}"
          .redirectUri="${redirectUri}"
          .inlineMethods="${inlineMethods}"
          .noTryIt="${noTryit}"
          .noServerSelector="${noServerSelector}"
          .allowCustomBaseUri="${allowCustomBaseUri}"
          .serverValue="${serverValue}"
          .serverType="${serverType}"
          ?narrow="${narrow}"
          ?compatibility="${compatibility}"
          @apiserverchanged="${this._serverHandler}"
          handleNavigationEvents
          @tryit-requested="${this._tryitRequested}"
        >
          ${this._addCustomServers()}
        </api-documentation>
        <label slot="options" id="mainOptionsLabel">Options</label>

        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="narrow"
          @change="${this._toggleMainOption}"
          >Narrow view</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="noTryit"
          @change="${this._toggleMainOption}"
          >No try it</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="inlineMethods"
          @change="${this._toggleMainOption}"
          >Render methods</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="noServerSelector"
          @change="${this._toggleMainOption}"
          >No server selector</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="allowCustomBaseUri"
          @change="${this._toggleMainOption}"
          >Allow custom base URI</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="renderCustomServer"
          @change="${this._toggleMainOption}"
          >Custom servers</anypoint-checkbox
        >
      </arc-interactive-demo>
    </section>`;
  }

  _addCustomServers() {
    if (!this.renderCustomServer) {
      return '';
    }
    const { compatibility } = this;
    return html`
    <div class="other-section" slot="custom-base-uri">Other options</div>
    <anypoint-item
      slot="custom-base-uri"
      value="http://mocking.com"
      ?compatibility="${compatibility}"
    >Mocking service</anypoint-item>
    <anypoint-item
      slot="custom-base-uri"
      value="http://customServer.com2"
      ?compatibility="${compatibility}"
    >Custom instance</anypoint-item>`;
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
        <p>API request editor comes with 2 predefined styles:</p>
        <ul>
          <li><b>Material Design</b> (default)</li>
          <li>
            <b>Legacy</b> - To provide compatibility with legacy Anypoint design, use
            <code>legacy</code> property
          </li>
        </ul>
      </section>`;
  }

  contentTemplate() {
    return html`
    <xhr-simple-request></xhr-simple-request>
    <oauth2-authorization></oauth2-authorization>
    <oauth1-authorization></oauth1-authorization>
    <paper-toast id="navToast"></paper-toast>
    <paper-toast id="tryItToast" text="Try it panel requested"></paper-toast>

    <h2 class="centered main">API documentation</h2>
    ${this._demoTemplate()}
    ${this._introductionTemplate()}
    ${this._usageTemplate()}
    `;
  }
}
const instance = new ComponentDemo();
instance.render();

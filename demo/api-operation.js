import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../api-operation-document.js';

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([ 
      'selectedId', 'selectedType',
    ]);
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.componentName = 'api-operation-document';
  }

  /**
   * @param {CustomEvent} e
   */
  _navChanged(e) {
    const { selected, type, passive } = e.detail;
    if (passive) {
      return;
    }
    if (type === 'method') {
      this.selectedId = selected;
      this.selectedType = type;
    } else {
      this.selectedId = undefined;
      this.selectedType = undefined;
    }
  }

  contentTemplate() {
    return html`
      <h2>API operation</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API Operation document with various configuration options.
      </p>

      <div class="api-demo-content">
        ${!loaded ? html`<p>Load an API model first.</p>` : this._componentTemplate()}
      </div>
    </section>
    `;
  }

  _componentTemplate() {
    const { demoStates, darkThemeActive, selectedId, amf } = this;
    if (!selectedId) {
      return html`<p>Select API operation in the navigation</p>`;
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-operation-document
        .amf="${amf}"
        .domainId="${selectedId}"
        slot="content"
      >
      </api-operation-document>

      <label slot="options" id="mainOptionsLabel">Options</label>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="edit"
        @change="${this._toggleMainOption}"
      >
        Edit graph
      </anypoint-checkbox>
    </arc-interactive-demo>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['demo-api', 'Demo API'],
      ['google-drive-api', 'Google Drive'],
      ['multi-server', 'Multiple servers'],
      ['nexmo-sms-api', 'Nexmo SMS API'],
      ['appian-api', 'Applian API'],
      ['APIC-15', 'APIC-15'],
      ['SE-10469', 'SE-10469'],
      ['SE-11415', 'SE-11415'],
      ['async-api', 'async-api'],
      ['api-keys', 'API key (OAS)'],
      ['oauth-flows', 'OAuth 2 flows'],
      ['oas-bearer', 'Bearer token'],
      ['oauth-pkce', 'OAuth 2 PKCE'],
      ['secured-unions', 'Secured unions'],
      ['secured-api', 'Secured API'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="${file}-compact.json">${label} - compact model</anypoint-item>
      <anypoint-item data-src="${file}.json">${label}</anypoint-item>`;
    });
    return result;
  }
}
const instance = new ComponentPage();
instance.render();

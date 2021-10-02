import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../api-summary.js';

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([ 
      'selectedId', 'selectedType', 'selectedOperation', 'tryIt',
      'editorOpened', 'editorOperation', 'overrideBaseUri',
    ]);
    this.compatibility = false;
    this.componentName = 'api-summary';
    this.overrideBaseUri = false;
    this.noApiNavigation = true;
  }

  /**
   * @param {CustomEvent} e
   */
  _navigationHandler(e) {
    console.log(e.detail);
  }

  contentTemplate() {
    return html`
      <h2>API summary</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API summary document with various configuration options.
      </p>

      <div class="api-demo-content">
        ${!loaded ? html`<p>Load an API model first.</p>` : this.loadedTemplate()}
      </div>
    </section>
    `;
  }

  loadedTemplate() {
    return html`
    ${this.componentTemplate()}
    `;
  }

  componentTemplate() {
    const { demoStates, darkThemeActive, amf, overrideBaseUri } = this;
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-summary
        .amf="${amf}"
        .baseUri="${overrideBaseUri ? 'https://custom.api.com' : undefined}"
        @api-navigation-selection-changed="${this._navigationHandler}"
        slot="content"
      >
      </api-summary>

      <label slot="options" id="mainOptionsLabel">Options</label>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="overrideBaseUri"
        .checked="${overrideBaseUri}"
        @change="${this._toggleMainOption}"
      >
        Custom base URI
      </anypoint-checkbox>
    </arc-interactive-demo>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['demo-api', 'Demo API'],
      ['google-drive-api', 'Google Drive'],
      ['prevent-xss', 'Prevent XSS'],
      ['mocking-service', 'Lots of methods'],
      ['no-endpoints', 'No endpoints!'],
      ['no-server', 'No server!'],
      ['multi-server', 'Multiple servers'],
      ['async-api', 'AsyncAPI'],
      ['APIC-641', 'APIC-641'],
      ['APIC-711', 'A library'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="models/${file}-compact.json">${label}</anypoint-item>`;
    });
    return result;
  }
}
const instance = new ComponentPage();
instance.render();

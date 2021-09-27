import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@api-components/api-navigation/api-navigation.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../api-documentation-document.js';

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([
      'selectedId', 'selectedType', 'loaded',
    ]);
    this.componentName = 'api-documentation-document';
    this.renderViewControls = true;
    this.loaded = false;
    this.selectedId = undefined;
    this.selectedType = undefined;
  }

  /**
   * @param {CustomEvent} e
   */
  _navChanged(e) {
    const { selected, type, passive } = e.detail;
    if (passive) {
      return;
    }
    if (type === 'documentation') {
      this.selectedId = selected;
      this.selectedType = type;
    } else {
      this.selectedId = undefined;
      this.selectedType = undefined;
    }
  }

  async _loadFile(file) {
    await super._loadFile(file);
    this.loaded = true;
  }

  contentTemplate() {
    return html`
      <h2>API documentation</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API documentation document with various configuration options.
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
      return html`<p>Select API documentation in the navigation</p>`;
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-documentation-document
        .amf="${amf}"
        .domainId="${selectedId}"
        slot="content"
      ></api-documentation-document>
    </arc-interactive-demo>
    `;
  }
}
const instance = new ComponentPage();
instance.render();

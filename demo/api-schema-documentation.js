import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@api-components/api-navigation/api-navigation.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../api-schema-document.js';

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([
      'selectedId', 'selectedType', 'forceExamples',
    ]);
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.forceExamples = true;
    this.componentName = 'api-schema-document';
    this.typesOpened = true;
    this.endpointsOpened = false;
  }

  /**
   * @param {CustomEvent} e
   */
  _navChanged(e) {
    const { selected, type, passive } = e.detail;
    if (passive) {
      return;
    }
    if (type === 'type') {
      this.selectedId = selected;
      this.selectedType = type;
    } else {
      this.selectedId = undefined;
      this.selectedType = undefined;
    }
  }

  contentTemplate() {
    return html`
      <h2>API schema</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API endpoint document with various configuration options.
      </p>

      <div class="api-demo-content">
        ${!loaded ? html`<p>Load an API model first.</p>` : this._componentTemplate()}
      </div>
    </section>
    `;
  }

  _componentTemplate() {
    const { demoStates, darkThemeActive, selectedId, amf, forceExamples } = this;
    if (!selectedId) {
      return html`<p>Select API documentation in the navigation</p>`;
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-schema-document 
        slot="content"
        .amf="${amf}"
        .domainId="${selectedId}" 
        ?forceExamples="${forceExamples}"
      ></api-schema-document>

      <label slot="options" id="mainOptionsLabel">Options</label>
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="forceExamples"
        .checked="${forceExamples}"
        @change="${this._toggleMainOption}"
      >
        Force examples
      </anypoint-checkbox>
    </arc-interactive-demo>
    `;
  }
}
const instance = new ComponentPage();
instance.render();

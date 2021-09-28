import { html } from 'lit-html';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../api-annotation-document.js';

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([ 
      'shape',
    ]);
    this.shape = undefined;
    this.componentName = 'api-annotation-document';
    this.redirectUri = `${window.location.origin}/node_modules/@advanced-rest-client/oauth-authorization/oauth-popup.html`;
  }

  /**
   * @param {CustomEvent} e
   */
  _navChanged(e) {
    const { selected, type } = e.detail;
    if (type === 'type') {
      this.setTypeData(selected);
    } else if (type === 'endpoint') {
      this.setEndpointData(selected);
    } else if (type === 'method') {
      this.setMethodData(selected);
    } else {
      this.shape = undefined;
    }
    console.log(this.shape);
  }

  /**
   * @param {string} id
   */
  setTypeData(id) {
    const declares = this._computeDeclares(this.amf);
    const type = declares.find((item) => item['@id'] === id);
    if (!type) {
      console.error('Type not found');
      return;
    }
    this.shape = type;
  }

  /**
   * @param {string} id
   */
  setEndpointData(id) {
    const webApi = this._computeWebApi(this.amf);
    this.shape = this._computeEndpointModel(webApi, id);
  }

  /**
   * @param {string} id
   */
  setMethodData(id) {
    const webApi = this._computeWebApi(this.amf);
    this.shape = this._computeMethodModel(webApi, id);
  }

  contentTemplate() {
    return html`
      <h2>API annotation</h2>
      ${this.demoTemplate()}
    `;
  }

  demoTemplate() {
    const { loaded } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API annotation document with various configuration options.
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
    const { demoStates, darkThemeActive, shape, amf } = this;
    if (!shape) {
      return html`<p>Select API object in the navigation</p>`;
    }
    return html`
    <arc-interactive-demo
      .states="${demoStates}"
      @state-changed="${this._demoStateHandler}"
      ?dark="${darkThemeActive}"
    >
      <api-annotation-document
        .amf="${amf}"
        .shape="${shape}"
        slot="content"
      >
      </api-annotation-document>
    </arc-interactive-demo>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['annotated-api', 'Annotated API'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="models/${file}-compact.json">${label}</anypoint-item>`;
    });
    return result;
  }
}
const instance = new ComponentPage();
instance.render();

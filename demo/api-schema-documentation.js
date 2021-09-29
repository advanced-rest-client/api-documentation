/* eslint-disable prefer-destructuring */
import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@api-components/api-navigation/api-navigation.js';
import { AmfDemoBase } from './lib/AmfDemoBase.js';
import '../api-schema-document.js';

/** @typedef {import('@api-components/amf-helper-mixin').DomainElement} DomainElement */

class ComponentPage extends AmfDemoBase {
  constructor() {
    super();
    this.initObservableProperties([
      'selectedId', 'selectedType', 'forceExamples',
      'mediaTypes', 'shape', 'mediaType', 'noReadOnly',
    ]);
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.mediaType = undefined;
    this.mediaTypes = undefined;
    this.shape = undefined;
    this.forceExamples = true;
    this.componentName = 'api-schema-document';
    this.typesOpened = true;
    this.endpointsOpened = false;
    this.noReadOnly = false;
  }

  /**
   * @param {CustomEvent} e
   */
  _navChanged(e) {
    const { selected, type, passive } = e.detail;
    if (passive) {
      return;
    }
    this.selectedId = undefined;
    this.selectedType = undefined;
    this.shape = undefined;
    this.mediaTypes = undefined;
    this.mediaType = undefined;

    if (type === 'type') {
      this.setTypeData(selected);
    } else if (type === 'method') {
      this.setBodyData(selected);
    }
  }

  /**
   * @param {string} id
   */
  setTypeData(id) {
    this.selectedId = id;
    this.selectedType = 'type';
    this.readApiMediaTypes();
  }

  /**
   * @param {string} id
   */
  setBodyData(id) {
    const webApi = this._computeWebApi(this.amf);
    const method = this._computeMethodModel(webApi, id);
    const expects = this._computeExpects(method);
    const payload = /** @type DomainElement */ (expects ? this._computePayload(expects)[0] : {});
    const mt = this._getValue(payload, this.ns.aml.vocabularies.core.mediaType);
    const key = this._getAmfKey(this.ns.aml.vocabularies.shapes.schema);
    let schema = payload && payload[key];
    if (!schema) {
      return;
    }
    schema = Array.isArray(schema) ? schema[0] : schema;
    this.shape = schema;
    this.mediaType = mt;
  }

  readApiMediaTypes() {
    let webApi = this._computeWebApi(this.amf);
    if (webApi instanceof Array) {
      [webApi] = webApi;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.apiContract.accepts);
    const value = this._ensureArray(webApi[key]);
    if (value) {
      this.mediaTypes = value.map((item) => item['@value']);
      this.mediaType = this.mediaTypes[0];
    }
  }

  /**
   * @param {Event} e
   */
  mimeHandler(e) {
    const select = /** @type HTMLSelectElement */ (e.target);
    this.mediaType = select.value;
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
      ${this.mediaTypesSelectorTemplate()}
    </section>
    `;
  }

  _componentTemplate() {
    const { demoStates, darkThemeActive, selectedId, amf, forceExamples, shape, mediaType, noReadOnly } = this;
    if (!selectedId && !shape) {
      return html`<p>Select API object in the navigation</p>`;
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
        .domainModel="${shape}"
        domainId="${ifDefined(selectedId)}"
        mimeType="${ifDefined(mediaType)}"
        ?forceExamples="${forceExamples}"
        ?noReadOnly="${noReadOnly}"
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
      <anypoint-checkbox
        aria-describedby="mainOptionsLabel"
        slot="options"
        name="noReadOnly"
        .checked="${noReadOnly}"
        @change="${this._toggleMainOption}"
      >
        No read only
      </anypoint-checkbox>
    </arc-interactive-demo>
    `;
  }

  mediaTypesSelectorTemplate() {
    const { mediaTypes } = this;
    if (!Array.isArray(mediaTypes) || !mediaTypes.length) {
      return '';
    }
    return html`
    <select @change="${this.mimeHandler}" @blur="${this.mimeHandler}">
      <option value="">As in spec</option>
      ${mediaTypes.map((mime) => html`<option ?selected="${mime === this.mediaType}" value="${mime}">${mime}</option>`)}
    </select>
    `;
  }

  _apiListTemplate() {
    const result = [];
    [
      ['demo-api', 'Demo API'],
      ['APIC-649', 'Deprecated properties'],
      ['APIC-429', 'APIC 429'],
      ['read-only-properties', 'Read Only Properties API'],
      ['examples-api', 'Examples render demo'],
      ['Petstore-v2', 'OAS: Petstore'],
      ['apic-83', 'APIC-83'],
      ['SE-10469', 'SE-1046'],
      ['SE-11155', 'SE-11155'],
      ['APIC-282', 'APIC-282'],
      ['new-oas3-types', 'New OAS 3 types API'],
      ['APIC-483', 'APIC 483'],
      ['APIC-631', 'APIC-631: Arrays'],
      ['aap-1698', 'aap-1698'],
    ].forEach(([file, label]) => {
      result[result.length] = html`
      <anypoint-item data-src="models/${file}-compact.json">${label}</anypoint-item>
      `;
    });
    return result;
  }
}
const instance = new ComponentPage();
instance.render();

import { html } from 'lit-element';
import { 
  ApiDocumentationBase,
  serializerValue,
} from './ApiDocumentationBase.js';
import '../../api-parametrized-security-scheme.js';

/** @typedef {import('@api-components/amf-helper-mixin').ApiSecurityRequirement} ApiSecurityRequirement */
/** @typedef {import('@api-components/amf-helper-mixin').SecurityRequirement} SecurityRequirement */

export const securityRequirementValue = Symbol('securityRequirementValue');

export default class ApiSecurityRequirementDocumentElement extends ApiDocumentationBase {
  constructor() {
    super();
    /** @type {ApiSecurityRequirement} */
    this[securityRequirementValue] = undefined;
    /** @type {SecurityRequirement} */
    this.domainModel = undefined;
  }

  /**
   * @returns {ApiSecurityRequirement}
   */
  get securityRequirement() {
    return this[securityRequirementValue];
  }

  /**
   * @param {ApiSecurityRequirement} value
   */
  set securityRequirement(value) {
    const old = this[securityRequirementValue];
    if (old === value) {
      return;
    }
    this[securityRequirementValue] = value;
    this.processGraph();
  }

  /**
   * @returns {Promise<void>}
   */
  async processGraph() {
    const { domainModel } = this;
    if (domainModel) {
      this[securityRequirementValue] = this[serializerValue].securityRequirement(domainModel);
    }
    await this.requestUpdate();
  }

  render() {
    const scheme = this[securityRequirementValue];
    if (!scheme || !scheme.schemes || !scheme.schemes.length) {
      return html``;
    }
    return html`
    <div class="security-requirements">
      ${scheme.schemes.map((item) => html`
        <api-parametrized-security-scheme 
          .securityScheme="${item.scheme}" 
          .settings="${item.settings}"
          settingsOpened></api-parametrized-security-scheme>`)}
    </div>
    `;
  }
}

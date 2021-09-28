/* eslint-disable class-methods-use-this */
import { ns } from '@api-components/amf-helper-mixin';
import ApiSecurityDocumentElement, {
  settingsTemplate,
  securityValue,
  apiKeySettingsTemplate,
  openIdConnectSettingsTemplate,
  oAuth2SettingsTemplate,
} from "./ApiSecurityDocumentElement.js";
import elementStyles from './styles/ParametrizedSecurityElement.js';

/** @typedef {import('@api-components/amf-helper-mixin').ApiSecuritySettingsUnion} ApiSecuritySettingsUnion */
/** @typedef {import('@api-components/amf-helper-mixin').ApiSecurityOAuth2Settings} ApiSecurityOAuth2Settings */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

export const settingsIdValue = Symbol('settingsIdValue');
export const querySettings = Symbol('querySettings');
export const settingsValue = Symbol('settingsValue');
export const mergeSettings = Symbol('mergeSettings');

export default class ApiParametrizedSecuritySchemeElement extends ApiSecurityDocumentElement {
  get styles() {
    return [...super.styles, elementStyles];
  }

  /** 
   * @returns {ApiSecuritySettingsUnion|undefined}
   */
  get settings() {
    return this[settingsValue];
  }

  /** 
   * @returns {ApiSecuritySettingsUnion|undefined}
   */
  set settings(value) {
    const old = this[settingsValue];
    if (old === value) {
      return;
    }
    this[settingsValue] = value;
    this.requestUpdate();
  }

  constructor() {
    super();
    /** @type {ApiSecuritySettingsUnion} */
    this[settingsValue] = undefined;
  }

  /**
   * @returns {TemplateResult|string} The template for the security settings, when required.
   */
  [settingsTemplate]() {
    const appliedSettings = this[settingsValue];
    if (!appliedSettings) {
      return super[settingsTemplate]();
    }
    const scheme = this[securityValue];
    const { settings } = scheme;
    if (!settings) {
      return '';
    }
    const { types } = settings;
    const mergedSettings = this[mergeSettings](appliedSettings, settings);

    if (types.includes(ns.aml.vocabularies.security.ApiKeySettings)) {
      return this[apiKeySettingsTemplate](mergedSettings);
    }
    if (types.includes(ns.aml.vocabularies.security.OpenIdConnectSettings)) {
      return this[openIdConnectSettingsTemplate](mergedSettings);
    }
    if (types.includes(ns.aml.vocabularies.security.OAuth2Settings)) {
      return this[oAuth2SettingsTemplate](/** @type ApiSecurityOAuth2Settings */ (mergedSettings));
    }
    return '';
  }

  /**
   * @param {ApiSecuritySettingsUnion} applied The settings applied to the current object
   * @param {ApiSecuritySettingsUnion} scheme The settings defined in the scheme
   * @returns {ApiSecuritySettingsUnion} The merged settings to render.
   */
  [mergeSettings](applied, scheme) {
    const result = { ...scheme };
    Object.keys(applied).forEach((key) => {
      if (['id', 'types', 'additionalProperties'].includes(key)) {
        return;
      }
      result[key] = applied[key];
    });
    return result;
  }
}

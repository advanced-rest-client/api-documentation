import { css } from 'lit-element';

export default css`
.api-description {
  margin-top: 16px;
}

.api-description arc-marked {
  margin: 0;
  padding: 0;
  padding-bottom: 20px;
}

.endpoint-url {
  margin: var(--api-endpoint-url-margin, var(--api-method-documentation-url-margin, 20px 0));
  padding: var(--api-endpoint-url-padding, var(--api-method-documentation-url-padding, 16px 12px));
  background-color: var(--api-endpoint-url-background-color, var(--api-method-documentation-url-background-color, #f5f7f9));
  color: var(--api-endpoint-url-color, var( --api-method-documentation-url-font-color, #000));
  display: flex;
  align-items: center;
  flex-direction: row;
  font-family: var(--code-font-family);
  font-size: var(--api-endpoint-url-font-size, var(--api-method-documentation-url-font-size, 1.07rem));
  border-radius: var(--api-endpoint-url-border-radius, var(--api-method-documentation-url-border-radius, 4px));
}

.endpoint-url .method-label {
  text-transform: uppercase;
  white-space: nowrap;
  margin: 0;
  font-size: var(--api-endpoint-http-method-label-font-size, var(--api-method-documentation-http-method-label-font-size, inherit));
  font-family: var(--api-endpoint-http-method-label-font-family, var(--api-method-documentation-http-method-label-font-family));
  font-weight: var(--api-endpoint-http-method-label-font-weight, var(--api-method-documentation-http-method-label-font-weight));
  min-width: var(--api-endpoint-http-method-label-min-width, var(--api-method-documentation-http-method-label-min-width, inherit));
}

.endpoint-url .url-value {
  flex: 1;
  margin-left: 12px;
  word-break: break-all;
}

.property-item {
  border-bottom: 1px var(--operation-params-property-border-color, #C6c6c6) solid;
  margin: 20px 0;
}

.params-title {
  display: flex;
  align-items: center;
  flex-direction: row;
  border-bottom: 1px var(--operation-params-title-border-color, var(--api-parameters-document-title-border-color, #D6D6D6)) solid;
  cursor: default;
  user-select: none;
  transition: border-bottom-color 0.15s ease-in-out;
}

.params-title.opened {
  border-bottom-color: transparent;
}

.params-title .label {
  margin: 20px 0;
  /* This is for compatibility with the old components. */
  font-family: var(--operation-params-title-font-family, var(--api-parameters-document-h3-font-family, var(--arc-font-subhead-font-family)));
  font-size: var(--operation-params-title-size, var(--api-parameters-document-h3-font-size, var(--arc-font-subhead-font-size, 22px)));
  font-weight: var(--operation-params-title-weight, var(--api-parameters-document-h3-font-weight, var(--arc-font-subhead-font-weight, 400)));
  line-height: var(--operation-params-title-line-height, var(--api-parameters-document-h3-line-height, var(--arc-font-subhead-line-height, initial)));
  color: var(--operation-params-title-color, var(--api-parameters-document-h3-font-color, var(--arc-font-subhead-color, initial)));
}

.section-toggle {
  margin-left: auto;
}

.toggle-icon {
  transition: transform 0.23s linear;
}

.opened .toggle-icon {
  transform: rotate(180deg);
}

.media-type {
  margin: 12px 0;
}

.media-type span {
  font-weight: 500;
}

.amf-media-types {
  margin: 12px 0;
}

.deprecated {
  text-decoration: line-through;
}

.deprecated-message {
  font-weight: bold;
  margin: 12px 0;
  padding: 12px 8px;
  background-color: var(--deprecated-message-background-color, #ffc107);
  color: var(--deprecated-message-color, #000);
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.deprecated-message .message {
  margin-left: 12px;
}

.empty-info {
  font-size: 1.1rem;
  margin-left: 24px;
  padding: 12px 0;
}

.example-description {
  margin: 12px 0;
}
`;

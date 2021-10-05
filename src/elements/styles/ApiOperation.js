import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.operation-header {
  margin-bottom: 32px;
}

.operation-title {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.operation-title .label {
  font-size: var(--operation-title-size, 26px);
  font-weight: var(--operation-title-weight, 400);
  margin: 8px 0px;
  flex: 1;
}

.sub-header {
  font-size: 0.95rem;
  color: var(--operation-subheader-color, #616161);
  margin: 0;
}

.params-section {
  padding-bottom: 20px;
}

.summary {
  color: var(--operation-description-color, var(--api-method-documentation-description-color, rgba(0, 0, 0, 0.74)));
  font-size: 1.1rem;
}

.callback-section {
  margin: 12px 0;
  padding: 8px;
  background-color: var(--operation-callback-background-color, var(--api-method-documentation-callback-background-color, #f7f7f7));
}

.extensions {
  font-style: italic;
  margin: 12px 0;
}

.method-response {
  padding-left: var(--operation-responses-padding-left, var(--api-responses-method-padding-left, 20px));
  padding-right: var(--operation-responses-padding-right, var(--api-responses-method-padding-right, 20px));
}

.codes-selector-divider {
  border-bottom: 1px var(--operation-response-codes-selector-divider-border-bottom-color, var(--api-responses-document-codes-selector-divider-border-bottom-color, #e5e5e5)) solid;
}
`;

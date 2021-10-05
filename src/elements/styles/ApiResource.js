import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.endpoint-header {
  margin-bottom: 40px;
}

.endpoint-title {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.endpoint-title .label {
  font-size: var(--resource-title-size, 32px);
  font-weight: var(--resource-title-weight, 400);
  margin: 12px 0px;
}

.sub-header {
  font-size: 0.95rem;
  color: var(--resource-subheader-color, #616161);
  margin: 0;
}

.operation {
  padding: 72px 0;
}

.extensions {
  font-style: italic;
  margin: 12px 0;
}

.operation-container.tryit {
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
}

.operation-container.tryit api-operation-document {
  width: var(--resource-operation-doc-width ,var(--api-endpoint-documentation-method-doc-width, 60%));
  max-width: var(--resource-operation-doc-max-width, var(--api-endpoint-documentation-method-doc-max-width));
  padding-right: 12px;
  box-sizing: border-box;
}

.operation-container.tryit .try-it-column {
  padding: 60px 12px;
  width: var(--resource-tryit-width, var(--api-endpoint-documentation-tryit-width, 40%));
  max-width: var(--resource-tryit-max-width, var(--api-endpoint-documentation-tryit-max-width));
  background-color: var(--resource-tryit-background-color, var(--api-endpoint-documentation-tryit-background-color, #ECEFF1));
}

.try-it-column api-request-panel,
.try-it-column http-code-snippets {
  padding: 4px 4px 12px 4px;
  background-color: var(--resource-tryit-panels-background-color, var(--api-endpoint-documentation-tryit-panels-background-color, #fff));
  box-sizing: border-box;
  border-radius: var(--resource-tryit-panels-border-radius, var(--api-endpoint-documentation-tryit-panels-border-radius, 0px));
  border-width: 1px;
  border-color: var(--resource-tryit-panels-border-color, var(--api-endpoint-documentation-tryit-panels-border-color, #EEEEEE));
  border-style: var(--resource-tryit-panels-border-style, var(--api-endpoint-documentation-tryit-panels-border-style, solid));
}

/* .sticky-content {
  position: sticky;
  top: 10px;
} */

.snippets {
  margin-top: 20px;
}
`;

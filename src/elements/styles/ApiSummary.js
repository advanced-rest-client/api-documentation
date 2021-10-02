import { css } from 'lit-element';

export default css`
:host {
  display: block;
  color: var(--api-summary-color, inherit);
}

.api-title {
  margin: 12px 0;
  font-size: var(--api-summary-title-font-size, 16px);
}

arc-marked {
  padding: 0;
}

.marked-description {
  margin: 24px 0;
}

.markdown-body {
  margin-bottom: 28px;
}

:host([narrow]) h1 {
  font-size: var(--api-summary-title-narrow-font-size, 1.2rem);
  margin: 0;
}

.url-area {
  display: flex;
  flex-direction: column;
  font-family: var(--arc-font-code-family);

  margin-bottom: 40px;
  margin-top: 20px;
  background-color: var(--code-background-color);
  color: var(--code-color);
  padding: 8px;
  border-radius: var(--api-endpoint-documentation-url-border-radius, 4px);
}

.url-label {
  font-size: 0.75rem;
  font-weight: 700;
}

.url-value {
  font-size: var(--api-endpoint-documentation-url-font-size, 1.07rem);
  word-break: break-all;
}

.method-value {
  text-transform: uppercase;
  white-space: nowrap;
}

label.section {
  color: var(--arc-font-subhead-color); 
  font-weight: var(--arc-font-subhead-font-weight);
  line-height: var(--arc-font-subhead-line-height);
  /* font-size: 18px; */
  margin-top: 20px;
  display: block;
}

a {
  color: var(--link-color);
}

a:hover {
  color: var(--link-hover-color);
}

.chip {
  display: inline-block;
  white-space: nowrap;
  padding: 2px 4px;
  margin-right: 8px;
  background-color: var(--api-summary-chip-background-color, #f0f0f0);
  color: var(--api-summary-chip-color, #616161);
  border-radius: var(--api-summary-chip-border-radius, 2px);
}

.app-link {
  color: var(--link-color);
}

.link-padding {
  margin-left: 8px;
}

.inline-description {
  padding: 0;
  margin: 0;
}

.docs-section {
  margin-bottom: 40px;
}

.separator {
  background-color: var(--api-summary-separator-color, rgba(0, 0, 0, 0.12));
  height: 1px;
  margin: var(--api-summary-separator-margin, 40px 0);
}

.endpoint-item {
  margin-bottom: 32px;
}

.method-label {
  margin-right: 8px;
  margin-bottom: 8px;
  text-decoration: none;
}

.method-label:hover,
.method-label:focus {
  text-decoration: underline;
}

.endpoint-path {
  display: block;
  text-decoration: none;
  cursor: pointer;
  margin-bottom: 4px;
  display: inline-block;
  font-weight: var(--api-summary-endpoint-path-font-weight, 500);
  color: var(--link-color, #0277BD);
  margin: 4px 0;
  word-break: break-all;
}

.endpoint-path:hover,
.endpoint-path:focus {
  text-decoration: underline;
  color: var(--link-color, #0277BD);
}

.toc .section {
  margin-bottom: 24px;
}

.section {
  font-size: var(--api-summary-section-title-font-size);
}

.section.endpoints-title {
  font-weight: var(--arc-font-title-font-weight, 500);
  color: var(--arc-font-title-color); 
  font-weight: var(--arc-font-title-font-weight);
  line-height: var(--arc-font-title-line-height);
  font-size: var(--arc-font-title-font-size);
}

.endpoint-path-name {
  word-break: break-all;
  margin: 8px 0;
}

.servers .servers-label {
  font-size: 0.75rem;
  font-weight: 700;
  margin: 0.8em 0 0.2em 0;
}

.server-description {
  display: block;
  font-size: var(--api-summary-server-description-font-size, 12px);
  font-weight: var(--api-summary-server-description-font-weight, 600);
}
`;

import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.schema-title {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.schema-title .label {
  font-size: var(--schema-title-size, 32px);
  font-weight: var(--schema-title-weight, 400);
  margin: 12px 0px;
}

.schema-title.low-emphasis .label {
  font-size: var(--schema-title-low-emphasis-size, 1.1rem);
  font-weight: var(--schema-title-low-emphasis-weight, 400);
}

.schema-title .type-name {
  margin-left: 8px;
  font-size: var(--schema-title-type-name-size, 22px);
}

.schema-title.low-emphasis .type-name {
  font-size: var(--schema-title-type-name-low-emphasis-size, 1.05rem);
}
`;

import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.documentation-title {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.documentation-title .label {
  font-size: var(--documentation-title-size, var(--arc-font-headline-font-size, 32px));
  font-weight: var(--documentation-title-weight, var(--arc-font-headline-font-weight, 400));
  letter-spacing: var(--documentation-title-letter-spacing, var(--arc-font-headline-letter-spacing, initial));
  line-height: var(--documentation-title-line-height, var(--arc-font-headline-line-height, initial));
  margin: 12px 0px;
}

arc-marked {
  background-color: transparent;
  padding: 0;
}
`;

import { ApiDocumentationElement } from './src/ApiDocumentationElement';

declare global {

  interface HTMLElementTagNameMap {
    "api-documentation": ApiDocumentationElement;
  }
}

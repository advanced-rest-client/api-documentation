import { ApiDocumentation } from './src/ApiDocumentation'

declare global {

  interface HTMLElementTagNameMap {
    "api-documentation": ApiDocumentation;
  }
}
# Changelog

## 7.0.0

### ApiResourceDocumentationElement (former api-endpoint-documentation)

The `api-resource-document` element has the following properties changes compared to deprecated `api-endpoint-documentation`

- `noTryIt` is renamed to `tryItButton`. When `tryItButton` is set then the try it button in operations is rendered.
- `inlineMethods` is renamed to `tryItPanel`. Has the same function.
- `noUrlEditor` is now renamed to `urlEditor`. When `urlEditor` is set then the HTTP request editor renders the URL editor input field.

### ApiOperationDocumentElement (former api-operation-documentation)

- `tryIt` is renamed to `tryItButton`
- `tryItButton` is always set to `false` when `tryItPanel` is set on the resource document element.

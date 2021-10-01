export default {
  // files: 'test/**/*.test.js',
  files: 'test/elements/ApiResponseDocumentElement.test.js',
  nodeResolve: true,
  middleware: [
    function rewriteBase(context, next) {
      if (context.url.indexOf('/base') === 0) {
        context.url = context.url.replace('/base', '');
      }
      return next();
    }
  ],
};

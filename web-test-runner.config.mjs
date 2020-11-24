export default {
	files: 'test/**/*.test.js',
	nodeResolve: true,
	middleware: [
		function rewriteBase(context, next) {
			if (context.url.indexOf('/base') === 0) {
				context.url = context.url.replace('/base', '')
			}
			return next();
		}
	],
	plugins: [
		{
		  name: 'provide-codemirror',
		  transform(context) {
			if (context.path === '/') {
			  const transformedBody = context.body.replace(
				'</head>',
				'<script src="./node_modules/codemirror/lib/codemirror.js"></script></head>',
			  );
			  return transformedBody;
			}
		  },
		},
	  ],
};

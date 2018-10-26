const generator = require('@api-components/api-model-generator');

const files = new Map();
files.set('demo-api/demo-api.raml', 'RAML 1.0');
files.set('array-body/array-body.raml', 'RAML 1.0');
files.set('appian-api/appian-api.raml', 'RAML 1.0');
files.set('nexmo-sms-api/nexmo-sms-api.raml', 'RAML 1.0');
files.set('APIC-15/APIC-15.raml', 'RAML 1.0');
files.set('oauth1-fragment/oauth1-fragment.raml', 'RAML 1.0');
files.set('oauth2-fragment/oauth2-fragment.raml', 'RAML 1.0');
files.set('type-fragment/type-fragment.raml', 'RAML 1.0');
files.set('documentation-fragment/documentation-fragment.raml', 'RAML 1.0');
files.set('lib-fragment/lib-fragment.raml', 'RAML 1.0');
files.set('example-fragment/example-fragment.raml', 'RAML 1.0');
generator(files)
.then(() => console.log('Finito'));

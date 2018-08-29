const generator = require('@api-components/api-model-generator');

const files = new Map();
files.set('demo-api/demo-api.raml', 'RAML 1.0');
files.set('array-body/array-body.raml', 'RAML 1.0');
files.set('appian-api/appian-api.raml', 'RAML 1.0');
files.set('nexmo-sms-api/nexmo-sms-api.raml', 'RAML 1.0');
files.set('APIC-15/APIC-15.raml', 'RAML 1.0');
generator(files)
.then(() => console.log('Finito'));

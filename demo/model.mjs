import generator from '@api-components/api-model-generator';

/** @typedef {import('@api-components/api-model-generator/types').ApiConfiguration} ApiConfiguration */

/** @type {Map<string, ApiConfiguration>} */
const config = new Map();
config.set('demo-api/demo-api.raml', { type: "RAML 1.0" });
config.set('array-body/array-body.raml', { type: "RAML 1.0" });
config.set('google-drive-api/google-drive-api.raml', { type: "RAML 1.0" });
config.set('appian-api/appian-api.raml', { type: "RAML 1.0" });
config.set('nexmo-sms-api/nexmo-sms-api.raml', { type: "RAML 1.0" });
config.set('APIC-15/APIC-15.raml', { type: "RAML 1.0" });
config.set('oauth1-fragment/oauth1-fragment.raml', { type: "RAML 1.0" });
config.set('oauth2-fragment/oauth2-fragment.raml', { type: "RAML 1.0" });
config.set('type-fragment/type-fragment.raml', { type: "RAML 1.0" });
config.set('documentation-fragment/documentation-fragment.raml', { type: "RAML 1.0" });
config.set('lib-fragment/lib-fragment.raml', { type: "RAML 1.0" });
config.set('example-fragment/example-fragment.raml', { type: "RAML 1.0" });
config.set('SE-10469/SE-10469.raml', { type: "RAML 1.0" });
config.set('SE-11415/SE-11415.raml', { type: "RAML 1.0" });
config.set('APIC-390/APIC-390.raml', { type: "RAML 1.0" });
config.set('multi-server/multi-server.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('async-api/async-api.yaml', { type: "ASYNC 2.0" });
config.set('APIC-711/APIC-711.raml', { type: "RAML 1.0" });
config.set('api-keys/api-keys.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('oauth-flows/oauth-flows.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('oas-bearer/oas-bearer.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('oauth-pkce/oauth-pkce.raml', { type: "RAML 1.0" });
config.set('secured-unions/secured-unions.yaml', { type: "OAS 3.0" });
config.set('secured-api/secured-api.raml', { type: "RAML 1.0" });

generator.generate(config);

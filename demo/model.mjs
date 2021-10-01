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
config.set('apic-83/apic-83.raml', { type: "RAML 1.0" });
config.set('APIC-282/APIC-282.raml', { type: "RAML 1.0" });
config.set('APIC-289/APIC-289.yaml', { type: "OAS 2.0", mime: 'application/yaml' });
config.set('APIC-332/APIC-332.raml', { type: 'RAML 1.0' });
config.set('APIC-390/APIC-390.raml', { type: "RAML 1.0" });
config.set('APIC-429/APIC-429.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('APIC-483/APIC-483.raml', { type: "RAML 1.0" });
config.set('APIC-463/APIC-463.raml', { type: "RAML 1.0" });
config.set('APIC-553/APIC-553.raml', { type: "RAML 1.0" });
config.set('APIC-560/APIC-560.yaml', { type: "ASYNC 2.0" });
config.set('APIC-582/APIC-582.yaml', { type: "ASYNC 2.0" });
config.set('APIC-631/APIC-631.raml', { type: "RAML 1.0" });
config.set('APIC-649/APIC-649.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('APIC-650/APIC-650.yaml', { type: "OAS 3.0" });
config.set('APIC-667/APIC-667.raml', { type: "RAML 1.0" });
config.set('APIC-671/APIC-671.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('APIC-711/APIC-711.raml', { type: "RAML 1.0" });
config.set('aap-1698/aap-1698.raml', { type: "RAML 1.0" });
config.set('SE-10469/SE-10469.raml', { type: "RAML 1.0" });
config.set('SE-11155/SE-11155.raml', { type: "RAML 1.0" });
config.set('SE-11415/SE-11415.raml', { type: "RAML 1.0" });
config.set('SE-11508/SE-11508.raml', { type: "RAML 1.0" });
config.set('SE-12291/SE-12291.json', { type: "OAS 2.0", mime: 'application/json' });
config.set('SE-12752/SE-12752.raml', { type: "RAML 1.0" });
config.set('SE-12957/SE-12957.json', { type: "OAS 2.0", mime: 'application/json' });
config.set('SE-12959/SE-12959.json', { type: "OAS 2.0", mime: 'application/json' });
config.set('SE-17897/SE-17897.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('SE-19500/SE-19500.raml', { type: "RAML 1.0" });
config.set('oauth1-fragment/oauth1-fragment.raml', { type: "RAML 1.0" });
config.set('oauth2-fragment/oauth2-fragment.raml', { type: "RAML 1.0" });
config.set('type-fragment/type-fragment.raml', { type: "RAML 1.0" });
config.set('documentation-fragment/documentation-fragment.raml', { type: "RAML 1.0" });
config.set('lib-fragment/lib-fragment.raml', { type: "RAML 1.0" });
config.set('example-fragment/example-fragment.raml', { type: "RAML 1.0" });
config.set('multi-server/multi-server.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('async-api/async-api.yaml', { type: "ASYNC 2.0" });
config.set('Streetlights/Streetlights.yaml', { type: "ASYNC 2.0" });
config.set('api-keys/api-keys.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('oauth-flows/oauth-flows.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('oas-bearer/oas-bearer.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('oauth-pkce/oauth-pkce.raml', { type: "RAML 1.0" });
config.set('secured-unions/secured-unions.yaml', { type: "OAS 3.0" });
config.set('secured-api/secured-api.raml', { type: "RAML 1.0" });
config.set('oas-callbacks/oas-callbacks.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('documented-api/documented-api.raml', { type: "RAML 1.0" });
config.set('annotated-api/annotated-api.raml', { type: "RAML 1.0" });
config.set('examples-api/examples-api.raml', { type: "RAML 1.0" });
config.set('enum-test/enum-test.raml', { type: "RAML 1.0" });
config.set('oas-api/Petstore-v2.yaml', { type: "OAS 2.0", mime: 'application/yaml' });
config.set('new-oas3-types/new-oas3-types.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('oas-api/read-only-properties.yaml', { type: "OAS 3.0", mime: 'application/yaml' });
config.set('anyOf/anyOf.yaml', { type: 'ASYNC 2.0' });
config.set('steveTest-1/stevetest.json', { type: 'OAS 2.0' });

generator.generate(config, {
  dest: 'demo/models/',
  src: 'demo/apis/',
});

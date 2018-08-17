const amf = require('amf-client-js');
const fs = require('fs');
const jsonld = require('jsonld');

amf.plugins.document.WebApi.register();
amf.plugins.document.Vocabularies.register();
amf.plugins.features.AMFValidation.register();

const files = new Map();
files.set('demo-api/demo-api.raml', 'RAML 1.0');
files.set('array-body/array-body.raml', 'RAML 1.0');
files.set('appian-api/appian-api.raml', 'RAML 1.0');
files.set('nexmo-sms-api/nexmo-sms-api.raml', 'RAML 1.0');
files.set('APIC-15/APIC-15.raml', 'RAML 1.0');

const ldContext = {
  declares: 'http://a.ml/vocabularies/document#declares',
  encodes: 'http://a.ml/vocabularies/document#encodes',
  references: 'http://a.ml/vocabularies/document#references',
  name: 'http://schema.org/name',
  desc: 'http://schema.org/description',
  srv: 'http://a.ml/vocabularies/http#server',
  url: 'http://a.ml/vocabularies/http#url',
  var: 'http://a.ml/vocabularies/http#variable',
  pname: 'http://a.ml/vocabularies/http#paramName',
  required: 'http://www.w3.org/ns/hydra/core#required',
  binding: 'http://a.ml/vocabularies/http#binding',
  schema: 'http://a.ml/vocabularies/http#schema',
  scheme: 'http://a.ml/vocabularies/http#scheme',
  dt: 'http://www.w3.org/ns/shacl#datatype',
  pattern: 'http://www.w3.org/ns/shacl#pattern',
  w3name: 'http://www.w3.org/ns/shacl#name',
  def: 'http://www.w3.org/ns/shacl#defaultValue',
  dvalue: 'http://a.ml/vocabularies/data#value',
  in: 'http://www.w3.org/ns/shacl#in',
  v: 'http://schema.org/version',
  doc: 'http://schema.org/documentation',
  title: 'http://schema.org/title',
  ep: 'http://a.ml/vocabularies/http#endpoint',
  path: 'http://a.ml/vocabularies/http#path',
  op: 'http://www.w3.org/ns/hydra/core#supportedOperation',
  method: 'http://www.w3.org/ns/hydra/core#method',
  exp: 'http://www.w3.org/ns/hydra/core#expect',
  par: 'http://a.ml/vocabularies/http#parameter',
  items: 'http://a.ml/vocabularies/shapes#items',
  ex: 'http://a.ml/vocabularies/document#examples',
  strict: 'http://a.ml/vocabularies/document#strict',
  svalue: 'http://a.ml/vocabularies/document#structuredValue',
  rdfNumber: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#member',
  raw: 'http://www.w3.org/ns/shacl#raw',
  vdocname: 'http://a.ml/vocabularies/document#name',
  cdip: 'http://a.ml/vocabularies/document#customDomainProperties',
  dp: 'http://a.ml/vocabularies/document#DomainProperty',
  de: 'http://a.ml/vocabularies/document#DomainElement',
  shapesShape: 'http://a.ml/vocabularies/shapes#Shape',
  shape: 'http://www.w3.org/ns/shacl#Shape',
  scalar: 'http://a.ml/vocabularies/shapes#ScalarShape',
  shapesSchema: 'http://a.ml/vocabularies/shapes#schema',
  prop: 'http://www.w3.org/ns/shacl#property',
  range: 'http://a.ml/vocabularies/shapes#range',
  mc: 'http://www.w3.org/ns/shacl#minCount',
  mac: 'http://www.w3.org/ns/shacl#maxCount',
  node: 'http://www.w3.org/ns/shacl#NodeShape'
};

/**
 * Generates json/ld file from parsed document.
 *
 * @param {Object} doc
 * @param {String} file
 * @return {Promise}
 */
function processFile(doc, file) {
  const generator = amf.Core.generator('AMF Graph', 'application/ld+json');
  const r = amf.Core.resolver('RAML 1.0');
  doc = r.resolve(doc, 'editing');
  let dest = file.substr(0, file.lastIndexOf('.')) + '.json';
  if (dest.indexOf('/') !== -1) {
    dest = dest.substr(dest.lastIndexOf('/'));
  }
  return generator.generateString(doc)
  .then((data) => {
    fs.writeFileSync('demo/' + dest, data, 'utf8');
    return new Promise((resolve) => {
      jsonld.compact(JSON.parse(data), ldContext, (err, compacted) => {
        if (err) {
          console.error(err);
        } else {
          const f = 'demo/' + dest.replace('.json', '-compact.json');
          fs.writeFileSync(f, JSON.stringify(compacted, null, 2), 'utf8');
        }
        resolve();
      });
    });
  });
}
/**
 * Parses file and sends it to process.
 *
 * @param {String} file File name in `demo` folder
 * @param {String} type Source file type
 * @return {String}
 */
function parseFile(file, type) {
  const parser = amf.Core.parser(type, 'application/yaml');
  return parser.parseFileAsync(`file://demo/${file}`)
  .then((doc) => processFile(doc, file));
}

amf.Core.init().then(() => {
  const promises = [];
  for (const [file, type] of files) {
    promises.push(parseFile(file, type));
  }

  Promise.all(promises)
  .then(() => console.log('Success'))
  .catch((e) => console.error(e));
});

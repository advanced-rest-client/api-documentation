import { ApiDemoPage } from '@advanced-rest-client/arc-demo-helper';
import { MonacoLoader } from '@advanced-rest-client/monaco-support';

export class AmfDemoBase extends ApiDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'initialized', 'loaded',
    ]);
    this.loaded = false;
    this.initialized = false;
    this.renderViewControls = true;
    this.autoLoad();
  }

  async autoLoad() {
    await this.loadMonaco();
    this.initialized = true;
  }

  async loadMonaco() {
    const base = `../node_modules/monaco-editor/`;
    MonacoLoader.createEnvironment(base);
    await MonacoLoader.loadMonaco(base);
    await MonacoLoader.monacoReady();
  }

  async _loadFile(file) {
    this.loaded = false;
    await super._loadFile(file);
    this.loaded = true;
  }
}

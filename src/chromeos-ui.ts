
import { Controller } from "src/controller";
import { registerEventDisposable as registerEvent } from "src/api/extension/event";
import { IMessageObjectType } from "src/api/common/message";
import { LocalStorage } from "src/api/extension/storage";
import { setGlobalLocalStorageInstance, storageInstance } from "./model/storage";
import { ChromeOSView } from "./view/chromeos";


class Main extends Controller {

  constructor() {
    super("chromeos");
  }

  async initialize() {
    let globalState = await storageInstance.get("global_state");
    if (globalState && globalState['global_state']) {
      this.model.globalState = globalState['global_state'];
    } else {
      this.openOptionsPage();
    }
  }

  registerSelfEvents() {

  }

  registerModelEvents() {

  }

  registerRuntimeEvents() {
    const runtime = chrome.runtime;

    // Register other IME UI proxy. eg. virtual keyboard, linux(crostini).
    this.setCurrentEventName("onConnectExternal");
    this.disposable = registerEvent(runtime.onConnectExternal, (port) => {
      // this.view = new ChromeOSProxy(port);
      // How to register event Adapter ?
    });

    // For option page UI.
    this.setCurrentEventName("onMessage");
    this.disposable = registerEvent(runtime.onMessage, (message: IMessageObjectType, sender, sendResponse) => {

    });

    this.disposable = registerEvent(runtime.onInstalled, this.onInstalled.bind(this));

  }

  registerIMEEvents() {
    const ime = chrome.input.ime;

    this.disposable = registerEvent(ime.onActivate, this.onActivate.bind(this));
    this.disposable = registerEvent(ime.onDeactivated, this.onDeactivated.bind(this));
    this.disposable = registerEvent(ime.onFocus, this.onFocus.bind(this));
    this.disposable = registerEvent(ime.onBlur, this.onBlur.bind(this));
    this.disposable = registerEvent(ime.onCandidateClicked, this.onCandidateClicked.bind(this));
    this.disposable = registerEvent(ime.onReset, this.onReset.bind(this));

    this.setCurrentEventName("onKeyEvent");
    this.disposable = registerEvent(ime.onKeyEvent, ((engineID: any, keyData: any, requestId: any): any => {
      if (this.onKeyEvent(engineID, keyData, requestId)){
        return true;
      }
    }) as any);

    this.setCurrentEventName("onSurroundingTextChanged");
    this.disposable = registerEvent(ime.onSurroundingTextChanged, this.onSurroundingTextChanged.bind(this));
  }


  addIMEControlerMethodDispatcher() {

  }


  handlereset() {

  }

  openOptionsPage() {
    chrome.runtime.openOptionsPage();
  }

}


async function main() {
  setGlobalLocalStorageInstance(LocalStorage<any>);
  
  let controller = new Main();
  controller.view = new ChromeOSView();
  await controller.initialize();

  controller.registerSelfEvents();
  controller.registerRuntimeEvents();
  controller.registerIMEEvents();
  controller.registerModelEvents();

}
main();
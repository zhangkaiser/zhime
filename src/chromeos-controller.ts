
import { Controller } from "src/controller";
import { registerEventDisposable as registerEvent } from "src/api/extension/event";
import { IMessageObjectType } from "src/api/common/message";
import { LocalStorage } from "src/api/extension/storage";
import { ChromeOSView } from "./view/chromeos";
import { PortInstance } from "./api/extension/port";
import { EventEnum } from "./consts/event";

export class ChromeOSController extends Controller {

  constructor() {
    super("chromeos");
    this.view = new ChromeOSView();
  }

  registerSelfEvents() {
    this.addEventListener(EventEnum.decoderOpened, () => {
      this.unregisterIMEEvent();
    });
    this.addEventListener(EventEnum.decoderClosed, () => {
      this.registerIMEEvent();
    });
  }

  registerExternalConnectionEvent() {
    // Register other IME UI proxy. eg. virtual keyboard, linux(crostini).
    this.setCurrentEventName("onConnectExternal");
    this.disposable = registerEvent(chrome.runtime.onConnectExternal, (port) => {
      // this.view = new ChromeOSProxy(port);
      // How to register event Adapter ?
    });

  }

  registerConnectionEvent() {
    // For option page UI.
    this.setCurrentEventName("onMessage");
    this.disposable = registerEvent(chrome.runtime.onMessage, (message: IMessageObjectType, sender, sendResponse) => {

    });

    this.disposable = registerEvent(chrome.runtime.onConnect, this.extEvents.onConnect);
    
  }

  registerLifecycleEvent() {
    this.disposable = registerEvent(chrome.runtime.onInstalled, this.extLifecycles.onInstalled);
    this.disposable = registerEvent(chrome.runtime.onUpdateAvailable, this.extLifecycles.onUpdateAvaiable);
  }

  registerIMElifecycleEvent() {
    const ime = chrome.input.ime;
    this.disposable = registerEvent(ime.onActivate, async (engineID, screen) => {
      await this.loadGlobalState();
      if (!this.model.globalState.remote && !this.model.connected) {
        this.createDecoderPage();
      }
      this.imeLifecycles.onActivate(engineID, screen);
    });
    this.disposable = registerEvent(ime.onDeactivated, this.imeLifecycles.onDeactivated);
    this.disposable = registerEvent(ime.onFocus, this.imeLifecycles.onFocus);
    this.disposable = registerEvent(ime.onBlur, this.imeLifecycles.onBlur);
    this.disposable = registerEvent(ime.onReset, this.imeLifecycles.onReset);
  }

  registerIMEEvent() {
    const ime = chrome.input.ime;
    this.setCurrentEventName("onCandidateClicked");
    this.disposable = registerEvent(ime.onCandidateClicked, this.imeEvents.onCandidateClicked);

    this.setCurrentEventName("onKeyEvent");
    this.disposable = registerEvent(ime.onKeyEvent, ((engineID: any, keyData: any, requestId: any): any => {
      if (this.imeEvents.onKeyEvent(engineID, keyData, requestId)){
        return true;
      }
    }) as any);

    this.setCurrentEventName("onSurroundingTextChanged");
    this.disposable = registerEvent(ime.onSurroundingTextChanged, this.imeEvents.onSurroundingTextChanged.bind(this));
  }

  unregisterIMEEvent() {
    ChromeOSController.dispose(this, "onCandidateClicked");
    ChromeOSController.dispose(this, "onKeyEvent");
    ChromeOSController.dispose(this, "onSurroundingTextChanged");
  }

  createDecoderPage() {
    chrome.tabs.create({
      active: true,
      url: "./main.html",
    }, () => {
      console.log("open Decoder page.");
    });
  }


  addIMEControlerMethodDispatcher() {

  }


  handlereset() {

  }

  openOptionsPage() {
    chrome.runtime.openOptionsPage();
  }

}
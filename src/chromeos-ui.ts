
import { Controller } from "src/controller";
import { registerEventDisposable as registerEvent } from "src/api/extension/event";
import { IIMEType, imeEventList } from "src/consts/chromeosIME";
import { Disposable } from "src/api/common/disposable";

class Main extends Controller {

  constructor() {
    super("chromeos");
  }

  registerRuntimeEvent() {
    const runtime = chrome.runtime;

    // Register other IME UI. eg. virtual keyboard, linux(crostini).
    this.setCurrentEventName("onConnectExternal");
    this.disposable = registerEvent(runtime.onConnectExternal, (port) => {
      
    });

    // For option page UI.
    this.setCurrentEventName("onMessage");
    this.disposable = registerEvent(runtime.onMessage, (message, sender, sendResponse) => {
      
    });

    this.disposable = registerEvent(runtime.onInstalled, this.onInstalled.bind(this));

  }

  registerIMEEvent() {
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
}

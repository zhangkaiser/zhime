
import { Controller } from "src/controller";
import { registerEventDisposable as registerEvent } from "src/api/extension/event";
import { IIMEType, imeEventList } from "src/consts/chromeosIME";
import { Disposable } from "src/api/common/disposable";

class Main extends Disposable {

  controller: Controller = new Controller("chromeos");

  constructor() {
    super();
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

    this.disposable = registerEvent(runtime.onInstalled, (details) => {
      this.controller.onInstalled(details);
    });

  }

  registerIMEEvent() {
    const ime = chrome.input.ime;

    this.disposable = registerEvent(ime.onActivate, (engineID, screen) => {
      this.controller.onActivate(engineID, screen);
    });
    this.disposable = registerEvent(ime.onDeactivated, (engineID) => {
      this.controller.onDeactivated(engineID)
    });
    this.disposable = registerEvent(ime.onFocus, (context) => {
      this.controller.onFocus(context);
    });
    this.disposable = registerEvent(ime.onBlur, (contextID) => {
      this.controller.onBlur(contextID);
    });
    this.disposable = registerEvent(ime.onCandidateClicked, (engineID, candidateID, button) => {
      this.controller.onCandidateClicked(engineID, candidateID, button as any);
    });
    this.disposable = registerEvent(ime.onReset, (engineID) => {
      this.controller.onReset(engineID)
    });

    this.setCurrentEventName("onKeyEvent");
    this.disposable = registerEvent(ime.onKeyEvent, ((engineID: any, keyData: any, requestId: any) => {
      this.controller.onKeyEvent(engineID, keyData, requestId);
    }) as any);

    this.setCurrentEventName("onSurroundingTextChanged");
    this.disposable = registerEvent(ime.onSurroundingTextChanged, (engineID, surroundingInfo) => {
      this.controller.onSurroundingTextChanged(engineID, surroundingInfo)
    });
  }

  addIMEControlerMethodDispatcher() {

  }
}

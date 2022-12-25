
import { Controller } from "src/api/controller";
import { registerEventDisposable as registerEvent } from "src/utils/extensionEventDisposable";
import { IIMEType, imeEventList } from "src/api/common/imecontroller";

class Main {

  controller: Controller = new Controller("chromeos");

  #disposes = new Map<string | Symbol, IDisposable>();
  #currentEventName = "";


  constructor() {
    
  }

  setCurrentEventName(value: string) {
    this.#currentEventName = value;
  }

  set disposable(disposable: IDisposable) {
    if (this.#currentEventName) {
      if (this.#disposes.has(this.#currentEventName)) {
        let oldDisposable = this.#disposes.get(this.#currentEventName);
        oldDisposable?.dispose();
      }
      this.#disposes.set(this.#currentEventName, disposable);
      this.setCurrentEventName("");
    } else {
      let key = Symbol("event");
      this.#disposes.set(key, disposable);
    }
  }

  registerIMEEvent() {
    const ime = chrome.input.ime;

    registerEvent(ime.onActivate, (engineID, screen) => {
      this.controller.onActivate(engineID, screen);
    });
    registerEvent(ime.onDeactivated, (engineID) => {
      this.controller.onDeactivated(engineID)
    });
    registerEvent(ime.onFocus, (context) => {
      this.controller.onFocus(context);
    });
    registerEvent(ime.onBlur, (contextID) => {
      this.controller.onBlur(contextID);
    });
    registerEvent(ime.onCandidateClicked, (engineID, candidateID, button) => {
      this.controller.onCandidateClicked(engineID, candidateID, button as any);
    });
    registerEvent(ime.onReset, (engineID) => {
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

import { IIMEMethodUnion, IMEControllerEventInterface, imeEventList, imeMethodList } from "src/consts/chromeosIME";
import { Model, IIMEMethodRenderDetail } from "src/model/model";

import { registerEventDisposable } from "src/api/extension/event";
import { IEnv } from "src/consts/env";
import { Disposable } from "src/api/common/disposable";
import { PartialViewDataModel } from "src/model/datamodel";
import { View } from "src/view/view";
import { IView } from "src/view/base";
import { KeyRexExp, Status } from "src/model/consts";
import { storageInstance } from "./model/storage";
import { PortInstance } from "./api/extension/port";
import { EventEnum } from "./consts/event";


type ActionType = [
  "keydown" | "keyup",
  [boolean, boolean, boolean], // Modifiers [Control, Shift, Alt].
  string | RegExp, // KeyCode / KeyChar / RegExp.
  Status | null, // status.
  boolean, // return.
  Function | null, // Condition function.
  Function, // Action function.
  Object, // Action function scope
  any[] // action function args.
];

export abstract class Controller extends Disposable {

  model: Model;
  view: IView = new View();

  #keyActionTable: ActionType[] = [];

  constructor(readonly env: IEnv) {
    super();
    this.model = new Model(env);
  }
  
  async initialize() {
    await this.loadGlobalState();
  }

  registerModelEvent() {
    this.model.addEventListener("onmessage", this.handleModelMessage.bind(this));
  }

  protected async loadGlobalState() {
    let globalState = await storageInstance.get("global_state");
    if (globalState && globalState['global_state']) {
      this.model.globalState = globalState['global_state'];
    } else {
      this.openOptionsPage();
    }
  }

  abstract openOptionsPage():void;
  

  setState() {
    
  }

  protected lifecycles = {
    onInstalled: (details: chrome.runtime.InstalledDetails) => {
    
    },
    onUpdateAvaiable: () => {
    
    }
  }

  protected extEvents = {
    onConnect: (port: chrome.runtime.Port) => {
      if (!this.model.connected) {
        this.dispatchEvent(new Event(EventEnum.decoderOpened));
        this.model.connected = true;
      }

      this.setCurrentEventName(port.name);
      this.disposable = registerEventDisposable(port.onDisconnect, () => {
        this.model.connected = false;
        this.dispatchEvent(new Event(EventEnum.decoderClosed));
      });
    }
  }

  protected imeLifecycles = {
    onActivate: (engineID: string, screen: string) => {
      this.model.engineID = engineID;
      this.#keyActionTable = this.getKeyActionTable();
      this.model.reset();
      this.model.notifyUpdate("onActivate", [engineID, screen]);
    },
  
    onDeactivated: (engineID: string) => {
      this.model.notifyUpdate("onDeactivated", [engineID]);
    },
  
    onReset: (engineID: string) => {
      this.model.notifyUpdate("onReset", [engineID]);
    },
  
    onBlur: (contextID: number) => {
      this.model.focus = false;
      this.model.notifyUpdate("noBlur", [contextID]);
      this.model.status = Status.NO;
    },
  
    onFocus: (context: chrome.input.ime.InputContext) => {
      this.model.focus = true;
      this.model.status = Status.INITED;
      this.model.notifyUpdate("onFocus", [context]);
    }
  }

  protected imeEvents = {
    onKeyEvent: (engineID: string, keyData: chrome.input.ime.KeyboardEvent, requestId: string) => {
      if (this.model.status == Status.NO) {
        return true;
      }

      if (this.preProcessKey(keyData)) {
        return true;
      }
  
      if (this.#keyActionTable && this.handleKeyInActionTable(keyData, this.#keyActionTable)) {
        return true;
      }
  
      if (this.isAllowNotifyKeyEvent(keyData)) {
        this.model.notifyUpdate("onKeyEvent", [engineID, keyData, requestId]);
      } else {
        this.setData({ "keyEventHandled": [requestId, false] });
      }
  
      return false;
    },
    onCandidateClicked: (engineID: string, candidateID: number, button: "left" | "middle" | "right") => {
      this.model.notifyUpdate("onCandidateClicked", [engineID, candidateID, button]);
    },
    onSurroundingTextChanged: (engineID: string, surroundingInfo: chrome.input.ime.SurroundingTextInfo) => {
      this.model.notifyUpdate("onSurroundingTextChanged", [engineID, surroundingInfo]);
    },
    onInputContextUpdate: (context: chrome.input.ime.InputContext) => {
      this.model.notifyUpdate("onInputContextUpdate", [context]);
    },
    onMenuItemActivated: (engineID: string, name: string) => {
      this.model.notifyUpdate("onMenuItemActivated", [engineID, name]);
    }
  }

  preProcessKey(keyData: chrome.input.ime.KeyboardEvent) {
    return false;
  }

  handleKeyInActionTable(keyData: chrome.input.ime.KeyboardEvent, table: ActionType[]) {
    return false;
  }

  isAllowNotifyKeyEvent(keyData: chrome.input.ime.KeyboardEvent) {
    if (keyData.type === "keydown") return true;

    if (["Ctrl", "Shift", "Alt"].indexOf(keyData.key) === -1) return false;

    return true;
  }
 
  getKeyActionTable(): ActionType[] {

    let isPureModifiers = () => {

    }

    let list: ActionType[] = [];
    // Esc key.
    list.push(["keyup", [false, false, false], "Esc", null, false, null, this.hideIME, this, []]);
    // Alt + Space.
    list.push(["keydown", [false, false, true], " ", Status.INITED, true, null, this.handleIMESwitchKey1, this, []]);
    // Control + Shift.
    list.push(["keydown", [true, false, false], "Shift", Status.INITED, true, isPureModifiers, () => {}, this, []]);
    list.push(["keyup", [true, false, false], "Shift", Status.INITED, false, isPureModifiers, this.handleIMESwitchKey2, this, [true]]);
    
    return [];
  }

  setData(newData: PartialViewDataModel, isRender: boolean = true) {
    if (isRender && this.view) {
      this.view.states = newData;
      return;
    }

    this.model.states = newData;
  }

  hideIME() {
    if (this.model.focus) {
      this.setData({
        setCandidateWindowProperties: {
          engineID: this.model.engineID,
          properties: { visible: false }
        },
        clearComposition: {
          contextID: this.model.contextID
        },
        hideInputView: true
      });
    }
  }

  /** Alt + Space */
  handleIMESwitchKey1() {

  }

  /** Control + Shift */
  handleIMESwitchKey2() {

  }

  updateStatus(type: IIMEMethodUnion, value: readonly any[]) {

    switch(type) {
      case "commitText":
        this.model.status = Status.COMMITTING;
        break;
      case "setCandidates":
        this.model.status = Status.SHOWING;
        break;
      case "setComposition":
        this.model.status = Status.COMPOSING;
        break;
      case "clearComposition":
      case "setCandidateWindowProperties":
      case "hideInputView":
        if (type === "setCandidateWindowProperties" && (value[0] as chrome.input.ime.CandidateWindowParameter).properties.visible) return;
        this.model.status = Status.INITED;
        break;
      default:
        // pass.
    }
  }

  handleModelMessage(e: Event) {
    let [msg, port, render] = (e as CustomEvent<IIMEMethodRenderDetail>).detail;
    let {type, value} = msg.data as {type: IIMEMethodUnion, value: any[]};

    this.updateStatus(type, value);

    if (process.env.DEV) console.log("handleModelMessage", type, value);

    if (imeMethodList.indexOf(type) !== -1) {
      this.setData({[type]: value[0]}, render);
    } else if(imeEventList.indexOf(type) !== -1) {
      // pass.
    } else {
      if (['print', 'printErr'].indexOf(type) !== -1 && (this as any)[type]) {
        (this as any)[type](...value);
      } else {
        console.error("Not support handler", type, value);

      }
    }

  }
  
}
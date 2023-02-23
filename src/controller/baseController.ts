
import { registerEventDisposable } from "src/api/extension/event";
import { isExt, isWebWorker } from "src/api/common/env";
import { Disposable } from "src/api/common/disposable";

import { Model, IIMEMethodRenderDetail } from "src/model/model";
import { PartialViewDataModel } from "src/model/datamodel";
import { KeyRexExp, Status } from "src/model/consts";
import { IGlobalState, storageInstance } from "src/model/storage";

import { EventEnum } from "src/consts/event";
import { IIMEMethodUnion, imeEventList, imeMethodList } from "src/consts/chromeosIME";
import { IEnv } from "src/consts/env";

import { View } from "src/view/view";
import { IView } from "src/view/base";

const enum KeyEventType {
  up,
  down
}

const SpecialKey = {
  UP: 'Up',
  DOWN: 'Down',
  PAGE_UP: 'Page_up',
  PAGE_DOWN: 'Page_down',
  SPACE: ' ',
  ENTER: 'Enter',
  BACKSPACE: 'Backspace',
  ESC: 'Esc',
  LEFT: 'Left',
  RIGHT: 'Right',
  SHIFT: "Shift",
  CTRL: "Control",
  ALT: "Alt",
  INVALID: '\ufffd'
}
  

interface INameOption {
  key: string,
  type: KeyEventType | string,
  ctrlKey?: boolean,
  shiftKey?: boolean,
  altKey?: boolean
}

export abstract class Controller extends Disposable {

  model: Model;
  view: IView = new View();
  loadGlobalStatePromise?: Promise<Record<"global_state", IGlobalState> | null | undefined>;
  createDecoderPageWaitingPromise?: Promise<boolean>;

  protected _keyActionAllMap = new Map<Status | "all", Map<string, Function>>;

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

  protected loadGlobalState() {

    this.loadGlobalStatePromise = storageInstance.get("global_state");
    
    return this.loadGlobalStatePromise.then((globalState) => {
      if (globalState && globalState['global_state']) {
        this.model.globalState = globalState['global_state'];
        return globalState['global_state'];
      } else {
        this.openOptionsPage();
        return undefined;
      }
    });

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
        this.createDecoderPageWaitingPromise = undefined;
      }

      this.setCurrentEventName(port.name);
      this.disposable = registerEventDisposable(port.onDisconnect, () => {
        this.model.connected = false;
        this.dispatchEvent(new Event(EventEnum.decoderClosed));
      });
    }
  }

  protected imeLifecycles = {
    onActivate: async (engineID: string, screen: string) => {
      if (process.env.DEV) console.log("onActivate", engineID, screen);
      await this.loadGlobalState();
      this.model.engineID = engineID;
      this.initIMEKeyAction();
      this.model.reset();
      this.model.notifyUpdate("onActivate", [engineID, screen]);
    },
  
    onDeactivated: (engineID: string) => {
      if (process.env.DEV) console.log("onDeactivated", engineID);
      this.model.notifyUpdate("onDeactivated", [engineID]);
    },
  
    onReset: (engineID: string) => {
      if (process.env.DEV) console.log("onReset", engineID);
      this.model.notifyUpdate("onReset", [engineID]);
    },
  
    onBlur: (contextID: number) => {
      if (process.env.DEV) console.log("onBlur", contextID);
      this.model.focus = false;
      this.model.notifyUpdate("noBlur", [contextID]);
    },
  
    onFocus: async (context: chrome.input.ime.InputContext) => {
      if (process.env.DEV) console.log("onFocus", context.contextID);
      if (this.loadGlobalStatePromise) await this.loadGlobalStatePromise;
      this.loadGlobalStatePromise = undefined;
      this.createDecoderPage();
      this.model.focus = true;
      this.model.notifyUpdate("onFocus", [context]);
    }
  }

  protected imeEvents = {
    onKeyEvent: (engineID: string, keyData: chrome.input.ime.KeyboardEvent, requestId: string) => {
      if (process.env.DEV) console.log("onKeyEvent", keyData.type, keyData.key, requestId);

      if (this.loadGlobalStatePromise) {
        return true;
      }

      if (!this.model.status) { // No focus.
        return true;
      }

      if (this.preProcessKey(keyData)) {
        return true;
      }
  
      if (this.handleKeyAction(keyData)) {
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
      if (process.env.DEV) console.log("onCandidateClicked", engineID, candidateID, button);
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

  handleKeyAction(keyData: chrome.input.ime.KeyboardEvent) {


    let status = this.model.status;
    let currentStatusMap = this._keyActionAllMap.get(status);
    let allStatusMap = this._keyActionAllMap.get("all");
    let actionName = this.getKeyActionName(keyData);
    if (allStatusMap && allStatusMap.has(actionName) && allStatusMap.get(actionName)!()) {      
        return true;
    }

    if (currentStatusMap && currentStatusMap.has(actionName) && currentStatusMap.get(actionName)!()) {
      return true;
    }

    return false;
  }

  preProcessKey(keyData: chrome.input.ime.KeyboardEvent) {
    return false;
  }

  /**
   * 允许所有`keydown`类型的按键, 并过滤掉非Modifier的keyup按键事件.
   */ 
  isAllowNotifyKeyEvent(keyData: chrome.input.ime.KeyboardEvent) {
    if (keyData.type === "keydown") return true;

    if (["Ctrl", "Shift", "Alt"].indexOf(keyData.key) === -1) return false;

    return true;
  }

  addKeyAction(status: Status | "all", nameOption: INameOption, callback: (...args: any) => boolean) {
    let name = this.getKeyActionName(nameOption);
    let sameStatusMap = this._keyActionAllMap.get(status);
    if (!sameStatusMap) sameStatusMap = new Map();
    sameStatusMap.set(name, callback);
  }

  getKeyActionName(nameOption: INameOption) {
    if (typeof nameOption.type == "string") {
      nameOption.type = nameOption.type == "keydown" ? KeyEventType.down : KeyEventType.up;
    }
    return [
      nameOption.key,
      nameOption.type,
      nameOption.ctrlKey ? 1 : 0,
      nameOption.altKey ? 1 : 0,
      nameOption.shiftKey ? 1 : 0
    ].join("_");
  }

  initIMEKeyAction() {
    this._keyActionAllMap = new Map;
    // Add default actions.
    this.registerDefaultActions();
  }

  private registerDefaultActions() {

    const emptyBlock = () => true;

    const hideIME = () => (this.hideIME(), false);
    this.addKeyAction("all", {key: "Esc", type: KeyEventType.up}, hideIME);

    // Alt + space - 切换内置/已配置的输入法方法.
    const IMESwitchKey1 = () => (this.handleIMESwitchKey1(), true);
    this.addKeyAction(Status.FOCUS, {key: SpecialKey.SPACE, type: KeyEventType.down, altKey: true}, IMESwitchKey1);

    // Control + Shift - 切换内置/已配置的输入法方法
    const IMESwitchKey2 = () => (this.handleIMESwitchKey2, true);
    this.addKeyAction(Status.FOCUS, {key: SpecialKey.SHIFT, type: KeyEventType.down, ctrlKey: true}, emptyBlock);
    this.addKeyAction(Status.FOCUS, {key: SpecialKey.SHIFT, type: KeyEventType.up, ctrlKey: true}, IMESwitchKey2);

    // Move highlight.
    const prevHighlight = () => (this.moveHighlight(-1), false);
    const nextHighlight = () => (this.moveHighlight(1), false);
    this.addKeyAction(Status.COMPOSING, {key: SpecialKey.UP, type: KeyEventType.down}, prevHighlight);
    this.addKeyAction(Status.COMPOSING, {key: SpecialKey.DOWN, type: KeyEventType.down}, nextHighlight);

    // Move cursor
    const moveCursorLeft = () => (this.moveCursor(-1), false);
    const moveCursorRight = () => (this.moveCursor(1), false);
    this.addKeyAction(Status.COMPOSING, {key: SpecialKey.LEFT, type: KeyEventType.down}, moveCursorLeft);
    this.addKeyAction(Status.COMPOSING, {key: SpecialKey.RIGHT, type: KeyEventType.down}, moveCursorRight);

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

  moveHighlight(value: 1 | -1) {
    this.model.highlight = value;
    this.setData({
      setCursorPosition: {
        contextID: this.model.contextID,
        candidateID: this.model.currentCandidateID
      }
    });
  }

  /** @todo 
   * 暂无法支持焦点移动,需要等待`zhime`重构到需要控制候选词的版本才能实现,当前是在decoder中实现
   */
  moveCursor(value: number) {
    
  }
  setCursor(value: number) {

  }

  updateStatus(type: IIMEMethodUnion, value: readonly any[]) {

    switch(type) {
      case "commitText":
        this.model.status = Status.COMMITTING;
        break;
      case "setCandidates":
      case "setComposition":
        this.model.status = Status.COMPOSING;
        break;
      case "clearComposition":
      case "setCandidateWindowProperties":
      case "hideInputView":
        if (type === "setCandidateWindowProperties" && (value[0] as chrome.input.ime.CandidateWindowParameter).properties.visible) return;
        this.model.status = Status.FOCUS;
        break;
      default:
        // pass.
    }
  }

  handleModelMessage(e: Event) {
    let [msg, port, render] = (e as CustomEvent<IIMEMethodRenderDetail>).detail;
    let {type, value} = msg.data as {type: IIMEMethodUnion, value: any[]};

    this.updateStatus(type, value);

    if (imeMethodList.indexOf(type) !== -1) {
      if (process.env.DEV) console.log("Trigger ime method", type, value);
      this.setData({[type]: value[0]}, render);
    } else if(imeEventList.indexOf(type) !== -1) {
      // pass.
    } else if (['print', 'printErr'].indexOf(type) !== -1 && (this as any)[type]) {
      (this as any)[type](...value);
    } else {
      console.warn("Not supported message handler", type, value);
    }

  }

  createDecoderPage() {
    if (this.model.isWebEnv) return;

    if (isExt && isWebWorker && !this.model.globalState.remote && !this.model.connected && !this.createDecoderPageWaitingPromise) {
      this.createDecoderPageWaitingPromise = chrome.tabs.create({
        active: true,
        url: "./main.html",
      }).then((tab) => {
        console.log("Opened the decoder page.", tab.groupId);
        return true; 
      });
    }
    
  }
  
}
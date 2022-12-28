import { IIMEMethodUnion, IMEControllerEventInterface, imeMethodList } from "src/consts/chromeosIME";
import { IModel, BaseModel } from "src/model/base";
import { ChromeOSModel, IIMEMethodRenderDetail } from "src/model/chromeos";
import { IEnv } from "src/consts/env";
import { Disposable } from "src/api/common/disposable";
import { PartialViewDataModel } from "src/model/datamodel";
import { View } from "src/view/view";
import { IView } from "src/view/base";
import { KeyRexExp, Status } from "src/model/consts";


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

export class Controller extends Disposable implements IMEControllerEventInterface {

  model: IModel;
  view: IView = new View();

  #keyActionTable: ActionType[] = [];

  constructor(public env: IEnv) {
    super();

    if (env == "chromeos") {
      this.model = new ChromeOSModel;
      this.model.addEventListener("onmessage", this.handleModelMessage.bind(this));
    } else {
      this.model = new BaseModel;
    }

  }

  setState() {
    
  }

  onInstalled(details: chrome.runtime.InstalledDetails) {
    
  } 
  
  onActivate(engineID: string, screen: string) {
    this.model.engineID = engineID;
    this.#keyActionTable = this.getKeyActionTable();
    this.model.reset();
    this.model.notifyUpdate("onActivate", [engineID, screen]);
  }

  onDeactivated(engineID: string) {
    this.model.notifyUpdate("onDeactivated", [engineID]);
  }

  onReset(engineID: string) {
    this.model.notifyUpdate("onReset", [engineID]);
  }

  onBlur(contextID: number) {
    this.model.focus = false;
    this.model.notifyUpdate("noBlur", [contextID]);
    this.model.status = Status.NO;
  }

  onFocus(context: chrome.input.ime.InputContext) {
    this.model.focus = true;
    this.model.status = Status.INITED;
    this.model.notifyUpdate("onFocus", [context]);
  }

  onKeyEvent(engineID: string, keyData: chrome.input.ime.KeyboardEvent, requestId: string) {
    if (this.preProcessKey(keyData)) {
      return true;
    }

    if (this.#keyActionTable && this.handleKeyInActionTable(keyData, this.#keyActionTable)) {
      return true;
    }

    this.model.notifyUpdate("onKeyEvent", [engineID, keyData, requestId]);
    return false; 
  }

  onCandidateClicked(engineID: string, candidateID: number, button: "left" | "middle" | "right") {
    this.model.notifyUpdate("onCandidateClicked", [engineID, candidateID, button]);
  }

  onInputContextUpdate(context: chrome.input.ime.InputContext) {
    this.model.notifyUpdate("onInputContextUpdate", [context]);
  }

  onSurroundingTextChanged(engineID: string, surroundingInfo: chrome.input.ime.SurroundingTextInfo) {
    this.model.notifyUpdate("onSurroundingTextChanged", [engineID, surroundingInfo]);
  }

  onMenuItemActivated(engineID: string, name: string) {
    this.model.notifyUpdate("onMenuItemActivated", [engineID, name]);
  }

  preProcessKey(keyData: chrome.input.ime.KeyboardEvent) {
    return false;
  }

  handleKeyInActionTable(keyData: chrome.input.ime.KeyboardEvent, table: ActionType[]) {
    return false;
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
      this.view.data = newData;
      return;
    }

    this.model.data = newData;
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
    } else {
      console.error("Not support handler", type, value);
    }

  }
  
}
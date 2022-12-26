import { IMEControllerEventInterface } from "src/consts/chromeosIME";
import { IModel, BaseModel } from "src/model/base";
import { ChromeOSModel } from "src/model/chromeos";
import { IEnv } from "src/consts/env";

type ActionType = [
  "keydown" | "keyup",
  [boolean, boolean, boolean], // Modifiers [Control, Shift, Alt].
  string | RegExp, // KeyCode / KeyChar / RegExp.
  null, // status. 
  Function | null, // Condition function.
  Function, // Action function.
  Object, // Action function scope
  any // action function args.
];

export class Controller extends EventTarget implements IMEControllerEventInterface {

  model: IModel;

  #keyActionTable: ActionType[] = [];

  constructor(public env: IEnv) {
    super();

    if (env == "chromeos") {
      this.model = new ChromeOSModel;
    } else {
      this.model = new BaseModel;
    }
  }

  onInstalled(details: chrome.runtime.InstalledDetails) {
    
  } 
  
  onActivate(engineID: string, screen: string) {
    this.model.engineID = engineID;
    this.#keyActionTable = this.getKeyActionTable();
    this.model.notifyUpdate("onActivate", [engineID, screen]);
  }

  onDeactivated(engineID: string) {
    this.model.notifyUpdate("onDeactivated", [engineID]);
  }

  onReset(engineID: string) {
    this.model.notifyUpdate("onReset", [engineID]);
  }

  onBlur(contextID: number) {
    this.model.notifyUpdate("noBlur", [contextID]);
  }

  onFocus(context: chrome.input.ime.InputContext) {
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
    return [];
  }
  
}
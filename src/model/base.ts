import { PartialViewDataModel } from "./datamodel";
import { defaultGlobalState, IGlobalState } from "./storage";

export interface IModel extends EventTarget {
  
  engineID: string;
  contextID: number;

  focus: boolean;

  data?: PartialViewDataModel;

  globalState: IGlobalState;

  notifyUpdate: (eventName: string, value: any[]) => boolean;

  reset(): void;

  clear(): void;

}

export class BaseModel extends EventTarget implements IModel {
  engineID: string = "Test";
  contextID: number = 0;
  focus: boolean = false;

  globalState = defaultGlobalState;

  #data: PartialViewDataModel = {};

  set data(value: PartialViewDataModel) {
    this.#data = value;
  }

  get data() {
    return this.#data;
  }

  notifyUpdate(eventName: string, value: any[]) {
    console.log(eventName, value);
    return true;
  }

  reset() {
  }

  clear() {
    this.focus = false;
    this.contextID = 0;
  }
}
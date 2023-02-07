import { IPort } from "src/api/common/port";
import { Status } from "./consts";
import { PartialViewDataModel } from "./datamodel";
import { defaultGlobalState, IGlobalState } from "./storage";

export interface IModel extends EventTarget {
  
  engineID: string;
  contextID: number;

  focus: boolean;

  status: Status;

  states?: PartialViewDataModel;

  globalState: IGlobalState;

  notifyUpdate: (eventName: string, value: any[]) => boolean;

  reset(): void;

  clear(): void;
  
  registerDecoderListener(decoderPort: IPort): void;

}

export class BaseModel extends EventTarget implements IModel {
  engineID: string = "zhime";
  contextID: number = 0;
  focus: boolean = false;
  status = Status.NO;

  globalState = defaultGlobalState;

  #states: PartialViewDataModel = {};

  set states(value: PartialViewDataModel) {
    this.#states = value;
  }

  get states() {
    return this.#states;
  }

  notifyUpdate(eventName: string, value: any[]) {
    return true;
  }

  reset() {
  }

  clear() {
    this.focus = false;
    this.contextID = 0;
  }

  registerDecoderListener() {}
}
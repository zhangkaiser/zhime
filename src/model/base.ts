import { IDataModel } from "./datamodel";
import { defaultGlobalState, IGlobalState } from "./storage";

export interface IModel extends EventTarget {
  
  engineID: string;
  contextID: number;

  data?: IDataModel;

  globalState: IGlobalState;

  notifyUpdate: (eventName: string, value: any[]) => boolean;

  reset(): void;

  clear(): void;

}

export class BaseModel extends EventTarget implements IModel {
  engineID: string = "Test";
  contextID: number = 0;

  globalState = defaultGlobalState;

  #data: IDataModel = {};

  set data(value: IDataModel) {
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
    
  }
}
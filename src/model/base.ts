import { IDataModel } from "./datamodel";

export interface IModel extends EventTarget {
  
  engineID: string;
  contextID: number;

  data?: IDataModel;

  notifyUpdate: (eventName: string, value: any[]) => boolean;

}

export class BaseModel extends EventTarget implements IModel {
  engineID: string = "Test";
  contextID: number = 0;

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
}
export interface IModel extends EventTarget {
  
  engineID: string;
  contextID: number;

  notifyUpdate: (eventName: string, value: any[]) => boolean;

}

export class BaseModel extends EventTarget implements IModel {
  engineID: string = "Test";
  contextID: number = 0;

  notifyUpdate(eventName: string, value: any[]) {
    console.log(eventName, value);
    return true;
  }
}
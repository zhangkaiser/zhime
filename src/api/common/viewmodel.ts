export interface IViewModel extends EventTarget {
  
  engineID: string;
  contextID: number;

  notifyUpdate: (eventName: string, value: any[]) => boolean;

}

export class ViewModel extends EventTarget implements IViewModel {
  engineID: string = "Test";
  contextID: number = 0;

  notifyUpdate(eventName: string, value: any[]) {
    console.log(eventName, value);
    return true;
  }
}
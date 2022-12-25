import { IViewModel } from "src/api/common/viewmodel";

export class ChromeOSViewModel extends EventTarget implements IViewModel {
  contextID: number = 0;
  engineID: string = "";

  notifyUpdate(eventName: string, value: any[]) {
    return true;
  }
}
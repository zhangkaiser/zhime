import { IMEMethodInterface } from "src/consts/chromeosIME";
import { ChromeOSView } from "src/viewmodel/chromeos";
import { IModel } from "./base";

export class ChromeOSModel extends EventTarget implements IModel {
  contextID: number = 0;
  engineID: string = "";

  view = new ChromeOSView;

  constructor() {
    super();
  }

  notifyUpdate(eventName: string, value: any[]) {
    return true;
  }

  
}
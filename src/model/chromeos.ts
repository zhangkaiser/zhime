import { IMEMethodInterface } from "src/consts/chromeosIME";
import { ChromeOSView } from "src/viewmodel/chromeos";
import { IModel } from "./base";

export class ChromeOSModel extends EventTarget implements IModel {
  contextID: number = 0;

  #engineID: string = "";
  set engineID(value: string) {
    this.#engineID = value;
  }
  get engineID() {
    return this.#engineID;
  }

  view = new ChromeOSView;

  

  // constructor() {
  //   super();
  // }

  notifyUpdate(eventName: string, value: any[]) {

    return true;
  }

  clear() {
    
  }

  reset() {

  }

  
}
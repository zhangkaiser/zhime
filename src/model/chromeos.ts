import { RemoteEventDispatcher } from "src/api/common/event";
import { IMEMethodInterface } from "src/consts/chromeosIME";
import { Disposable } from "src/api/common/disposable";
import { IPort } from "src/api/common/port";
import { Port } from "src/api/extension/port";
import { IMessageObjectType } from "src/api/common/message";
import { IModel } from "./base";
import { defaultGlobalState } from "./storage";;

export type IIMEMethodRenderDetail = [IMessageObjectType, IPort, boolean];

export class ChromeOSModel extends Disposable implements IModel {
  contextID: number = 0;
  globalState = defaultGlobalState;

  eventDispatcher = new RemoteEventDispatcher();

  #engineID: string = "";
  set engineID(value: string) {
    this.#engineID = value;
  }
  get engineID() {
    return this.#engineID;
  }

  notifyUpdate(eventName: string, value: any[]) {
    console.log("notifyUpdate", eventName, value);
    let results = this.eventDispatcher.dispatchMessage(eventName, value);
    return !!(results.filter((result) => result).length);
  }

  clear() {
    this.eventDispatcher.dispose();
  }

  reset() {
    this.clear();
    ChromeOSModel.clear(this.eventDispatcher);
    this.registerDecoder();
  }

  registerDecoder() {
    let decoderID = this.globalState.decoder;

    let decoderPort = new Port(decoderID);
    decoderPort.onmessage = (msg, port) => {
      this.dispatchEvent(new CustomEvent<IIMEMethodRenderDetail>("onmessage", {detail: [msg, port, true]}));
    }
    this.eventDispatcher.add(decoderPort);
  }

  [Symbol.toStringTag]() {
    return "ChromeOSModel";
  }
  
}
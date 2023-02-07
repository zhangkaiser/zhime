import { RemoteEventDispatcher } from "src/api/common/event";
import { IMEMethodInterface } from "src/consts/chromeosIME";
import { Disposable } from "src/api/common/disposable";
import { IPort } from "src/api/common/port";
import { Port } from "src/api/extension/port";
import { IMessageObjectType } from "src/api/common/message";
import { BaseModel, IModel } from "./base";
import { defaultGlobalState } from "./storage";import { Status } from "./consts";
;

export type IIMEMethodRenderDetail = [IMessageObjectType, IPort, boolean];

export class ChromeOSModel extends Disposable implements IModel {

  static RECONNECT_TIMEOUT = 3 * 60 * 1000;

  contextID: number = 0;
  status = Status.NO;

  #focus: boolean = false;
  #intervalID = 0;

  focusAction?: Function;
  blurAction?: Function;

  set focus(value: boolean) {
    this.#focus = value;
    if (value) this.focusAction ? this.focusAction() : "";
    else this.blurAction ? this.blurAction() : "";
  }
  get focus() {
    return this.#focus;
  }

  globalState = defaultGlobalState;

  eventDispatcher = new RemoteEventDispatcher();

  engineID: string = "zhime";

  notifyUpdate(eventName: string, value: any[]) {
    if (process.env.DEV) console.log("notifyUpdate", eventName, value);
    let results = this.eventDispatcher.dispatchMessage(eventName, value);
    return !!(results.filter((result) => result).length);
  }

  clear() {
    this.contextID = 0;
    this.focus = false;
    this.status = Status.NO;
    this.eventDispatcher.dispose();
  }

  reset() {
    this.clear();
    ChromeOSModel.clear(this.eventDispatcher);
    this.registerDecoder();
  }

  registerDecoder() {
    if (
      !this.globalState 
      || !Reflect.has(this.globalState, "decoder") 
      || !this.globalState.decoder
    ) {
      this.eventDispatcher.dispatchMessage = (eventName, value) => {
        if (eventName === "onKeyEvent") {
          console.log("Not found decoder.");
          this.dispatchEvent(
            new CustomEvent("onmessage", 
            {detail: [
              { 
                data: { type: "keyEventHandled", value: [[value[2], false]] }
              },
              null,
              true ]
            })
          );
        }
        return [true];
      }
      return;
    }
    let { remote: enableRemoteDecoder, decoder: decoderID } = this.globalState;

    if (!enableRemoteDecoder) {
      return;
    }

    let decoderPort = new Port(decoderID);

    this.focusAction = () => {
      this.#intervalID = setInterval(() => {
        if (process.env.DEV) console.log("focusAction.");
        decoderPort.reconnect();
      }, ChromeOSModel.RECONNECT_TIMEOUT) as any;
    }

    this.blurAction = () => {
      if(process.env.DEV) console.log("blurAction.");
      clearInterval(this.#intervalID);
    }

    this.registerDecoderListener(decoderPort);
  }

  registerDecoderListener(decoderPort: Port) {
    decoderPort.onmessage = (msg, port) => {
      this.dispatchEvent(new CustomEvent<IIMEMethodRenderDetail>("onmessage", {detail: [msg, port, true]}));
    }
    this.eventDispatcher.add(decoderPort);
  }

  [Symbol.toStringTag]() {
    return "ChromeOSModel";
  }
  
}
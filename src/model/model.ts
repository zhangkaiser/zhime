import { RemoteEventDispatcher } from "src/api/common/event";
import { IMEMethodInterface } from "src/consts/chromeosIME";
import { Disposable } from "src/api/common/disposable";
import { IPort, WebWorkerPort } from "src/api/common/port";
import { Port } from "src/api/extension/port";
import { IMessageObjectType } from "src/api/common/message";
import { isExt, isWebWorker } from "src/api/common/env";

import { defaultGlobalState, IGlobalState } from "./storage";
import { Status } from "./consts";
import { PartialViewDataModel } from "./datamodel";
import { EventEnum } from "src/consts/event";
import { DeocderType, IEnv, mainDecoders, webDecoders } from "src/consts/env";

export type IIMEMethodRenderDetail = [IMessageObjectType, IPort, boolean];


export interface IModel extends EventTarget {
  
  /** The engine id of IME. */
  engineID: string;
  /** The input context id of IME. */
  contextID: number;
  /** The focus status of IME. */
  focus: boolean;
  /** The main decoder connection status. */ 
  connected: boolean;
  /** The input status of IME. */
  status: Status;

  states?: PartialViewDataModel;

  globalState: IGlobalState;

  notifyUpdate: (eventName: string, value: any[]) => boolean;

  reset(): void;

  clear(): void;
}

export class Model extends Disposable implements IModel {

  constructor(readonly env: IEnv) {
    super();
    this.isWebEnv = env === "web";
  }

  static RECONNECT_TIMEOUT = 3 * 60 * 1000;

  contextID: number = 0;
  status = Status.NO;
  connected = false;
  isWebEnv = false;
  registedDecoder?: DeocderType;
  states?: PartialViewDataModel;

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
    let results = this.eventDispatcher.dispatchMessage(eventName, value);
    return !!(results.filter((result) => result).length);
  }

  clear() {
    this.contextID = 0;
    this.focus = false;
    this.status = Status.NO;
  }

  reset() {
    this.clear();
    this.registerDecoder();
  }

  resetEventDispatcher() {
    this.eventDispatcher.dispose();
    Model.clear(this.eventDispatcher);
  }

  registerDecoder() {
    if (process.env.DEV) console.log("Registering decoder.");

    // TODO(May be unnecessary.)
    if (
      !this.globalState 
      || !Reflect.has(this.globalState, "decoder") 
      || !this.globalState.decoder
    ) {
      if (process.env.DEV) console.log("Incorrect global state object.");
      this.eventDispatcher.dispatchMessage = (eventName, value) => {
        if (eventName === "onKeyEvent") {
          console.log("Not found decoder.");
          isExt && this.dispatchEvent(
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

    if ((isWebWorker && !enableRemoteDecoder) || decoderID === this.registedDecoder) {
      return;
    }
    
    this.resetEventDispatcher();

    if (this.isWebEnv || !enableRemoteDecoder) {
      this.registerWebDecoder(this.isWebEnv ? webDecoders : mainDecoders, decoderID);
    } else {
      this.registerRemoteDecoder(decoderID);
    }

    this.registedDecoder = decoderID;
  }

  registerRemoteDecoder(decoderID: string) {
    if (!isExt) return;
    let decoderPort = new Port(decoderID);

    this.focusAction = () => {
      this.#intervalID = setInterval(() => {
        if (process.env.DEV) console.log("focusAction.");
        decoderPort.reconnect();
      }, Model.RECONNECT_TIMEOUT) as any;
    }

    this.blurAction = () => {
      if(process.env.DEV) console.log("blurAction.");
      clearInterval(this.#intervalID);
    }

    this.addEventDispatcher(decoderPort);
    if (process.env.DEV) console.log("registered remote decoder.", decoderID);
  }

  registerWebDecoder(decoders: typeof webDecoders, decoderID: DeocderType) {

    if (!Reflect.has(decoders, decoderID)) return;

    let scriptPath = decoders[decoderID].scripts;
    let decoderPort = new WebWorkerPort(scriptPath);

    decoderPort.addEventListener("connected", () => {
      globalThis.imeWorker = decoderPort.worker;
      window.dispatchEvent(new Event("registedWorker"));
    });
    this.addEventDispatcher(decoderPort);

    if (process.env.DEV) console.log("registered web decoder.", scriptPath);
  }

  addEventDispatcher(decoderPort: IPort) {
    decoderPort.onmessage = (msg, port) => {
      // Dispatch decoder event.
      if (Reflect.has(EventEnum, msg.data.type)) {
        globalThis.dispatchEvent(new Event(msg.data.type));
        return;
      }
      this.dispatchEvent(new CustomEvent<IIMEMethodRenderDetail>("onmessage", {detail: [msg, port, true]}));
    }
    this.eventDispatcher.add(decoderPort);
  }

  [Symbol.toStringTag]() {
    return "Model";
  }
  
}
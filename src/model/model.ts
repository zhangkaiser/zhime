import { RemoteEventDispatcher } from "src/api/common/event";
import { IMEMethodInterface } from "src/consts/chromeosIME";
import { Disposable } from "src/api/common/disposable";
import { IPort, WebWorkerPort } from "src/api/common/port";
import { Port } from "src/api/extension/port";
import { IMessageObjectType } from "src/api/common/message";
import { IModel } from "./base";
import { defaultGlobalState } from "./storage";import { Status } from "./consts";
import { EventEnum } from "src/consts/event";
import { IEnv, mainDecoders, webDecoders } from "src/consts/env";
;

export type IIMEMethodRenderDetail = [IMessageObjectType, IPort, boolean];

export class Model extends Disposable implements IModel {

  constructor(readonly env: IEnv) {
    super();
  }

  static RECONNECT_TIMEOUT = 3 * 60 * 1000;

  contextID: number = 0;
  status = Status.NO;
  connected = false;
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
    Model.clear(this.eventDispatcher);
    this.registerDecoder();
  }

  registerDecoder() {

    // TODO(May be unnecessary.)
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

    if (this.env === "web") {
      if (Reflect.has(webDecoders, decoderID)) {
        let scriptPath = webDecoders[decoderID];
        this.registerWebDecoder(scriptPath.scripts);
      }
      return;
    }


    if (!enableRemoteDecoder) {
      if (typeof window === "object" && Reflect.has(mainDecoders, decoderID)) {
        let scriptPath = mainDecoders[decoderID];
        this.registerWebDecoder(scriptPath.scripts);
      }
    } else {
      this.registerRemoteDecoder(decoderID);
    }

  }

  registerRemoteDecoder(decoderID: string) {
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
  }

  registerWebDecoder(scriptPath: string) {
    let decoderPort = new WebWorkerPort(scriptPath);
    
    decoderPort.addEventListener("connected", () => {
      globalThis.imeWorker = decoderPort.worker;
      window.dispatchEvent(new Event("registedWorker"));
    });

    this.addEventDispatcher(decoderPort);

  }

  addEventDispatcher(decoderPort: IPort) {
    decoderPort.onmessage = (msg, port) => {
      // Dispatch decoder event.
      if (Reflect.has(EventEnum, msg.data.type)) {
        window.dispatchEvent(new Event(msg.data.type));
        return;
      }
      this.dispatchEvent(new CustomEvent<IIMEMethodRenderDetail>("onmessage", {detail: [msg, port, true]}));
    }
    this.eventDispatcher.add(decoderPort);
  }

  [Symbol.toStringTag]() {
    return "ChromeOSModel";
  }
  
}
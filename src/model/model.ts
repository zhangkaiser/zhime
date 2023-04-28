import { RemoteEventDispatcher } from "src/api/common/event";
import { Disposable } from "src/api/common/disposable";
import { IPort, WebWorkerPort } from "src/api/common/port";
import { Port } from "src/api/extension/port";
import { IMessageObjectType } from "src/api/common/message";
import { isExt, isWebWorker } from "src/api/common/env";

import { IMEStorageKey, storageInstance } from "./storage";
import { Status } from "./consts";
import { ViewDataStore } from "./datamodel";
import { EventEnum } from "src/consts/event";
import { DeocderType, RuntimeEnv, mainDecoders, webDecoders } from "src/consts/env";
import { Config, ConnectionType } from "./config";

export type IIMEMethodRenderDetail = [IMessageObjectType, IPort, boolean];


export interface IModel extends EventTarget {
  /** The input context id of IME. */
  contextID: number;
  /** The focus status of IME. */
  focus: boolean;
  /** The main decoder connection status. */ 
  connected: boolean;
  /** The input status of IME. */
  status: Status;

  store: ViewDataStore;

  notifyUpdate: (eventName: string, value: any[]) => boolean;

  reset(): void;

  clear(): void;
}

export class Model extends Disposable implements IModel {

  config = new Config();

  store = new ViewDataStore();

  constructor(readonly env: RuntimeEnv) {
    super();

    this.isWebEnv = env == RuntimeEnv.Web;
  }

  contextID: number = 0;
  status = Status.BLUR;
  connected = false;
  isWebEnv = false;
  registedMainDecoder?: string;

  shiftLock = false;
  _lastKeyIsShift = false;

  requestId = 0;

  #intervalID = 0;

  currentCandidateID = 0;
  focusAction?: Function;
  blurAction?: Function;

  set focus(value: boolean) {
    this.status = +value;
    if (value) this.focusAction ? this.focusAction() : "";
    else this.blurAction ? this.blurAction() : "";
  }
  get focus() {
    return !!this.status;
  }

  /** @todo 需要验证 */
  set highlight(value: -1 | 1) {
    this.currentCandidateID += value;
    if (this.currentCandidateID <= 0) this.currentCandidateID = 0;
    // this.
  }

  eventDispatcher = new RemoteEventDispatcher();

  notifyUpdate(eventName: string, value: any[]) {
    let results = this.eventDispatcher.dispatchMessage(eventName, value);
    return !!(results.filter((result) => result).length);
  }

  clear() {
    this.contextID = 0;
    this.focus = false;
    this.store.clear();
  }

  reset() {
    this.clear();
    this.loadMainDecoder();
    this.loadSubDecoders();
  }

  
  resetEventDispatcher() {
    this.eventDispatcher.dispose();
    Model.clear(this.eventDispatcher);
  }

  private loadMainDecoder() {
    if (process.env.DEV) console.log("Register decoder.");

    let { decoder, connection } = this.config;

    this.resetEventDispatcher();

    switch(connection) {
      case ConnectionType.Builtin:
        this.registerBuiltinDecoder(decoder);
        break;
      case ConnectionType.Ext:
        this.registerExtDecoder(decoder);
        break;
      case ConnectionType.Http:
        this.registerHTTPDecoder(decoder);
        break;
      case ConnectionType.WS:
        this.registerWSDecoder(decoder);
        break;
      default:
        // pass.
    }
    // if ((isWebWorker && !enableRemoteDecoder) || decoderID === this.registedDecoder) {
    //   return;
    // }
    
    // if (this.isWebEnv || !enableRemoteDecoder) {
    //   this.registerWebDecoder(this.isWebEnv ? webDecoders : mainDecoders, decoderID);
    // } else {
    //   this.registerRemoteDecoder(decoder);
    // }

    this.registedMainDecoder = decoder;
  }

  private loadSubDecoders() {
    
  }

  registerBuiltinDecoder(decoder: string) {

  }

  registerHTTPDecoder(decoder: string) {

  }

  registerWSDecoder(decoder: string) {

  }

  registerExtDecoder(decoder: string) {

  }

  registerRemoteDecoder(decoderID: string) {
    if (!isExt) return;
    let decoderPort = new Port(decoderID);

    this.focusAction = () => {
      this.#intervalID = setInterval(() => {
        if (process.env.DEV) console.log("focusAction.");
        decoderPort.reconnect();
      }, this.config.reconnectTimeout) as any;
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

  async loadConfig() {
    return await storageInstance.get(IMEStorageKey.config).then((res) => {
      if (res && res[IMEStorageKey.config]) {
        this.config = res[IMEStorageKey.config];
        return this.config;
      } else {
        return this.config;
      }
    });
  }

  [Symbol.toStringTag]() {
    return "Model";
  }
  
}
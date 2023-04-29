import { IEventDispatcher, RemoteEventDispatcher } from "src/api/common/event";
import { Disposable } from "src/api/common/disposable";
import { HTTPPort, InstancePort, IPort, WebSocketPort, WebWorkerPort } from "src/api/common/port";
import { ExtensionPort } from "src/api/extension/port";
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

  mainDispatcher: IEventDispatcher;
  subDispatcher: IEventDispatcher;

  constructor(readonly env: RuntimeEnv) {
    super();

    this.isWebEnv = env == RuntimeEnv.Web;

    this.mainDispatcher = new RemoteEventDispatcher();
    this.subDispatcher = new RemoteEventDispatcher();
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

  notifyUpdate(eventName: string, value: any[]) {
    let results = this.mainDispatcher.dispatchMessage(eventName, value);
    if (process.env.DEV) console.log(results);
    return true;
  }

  notifySubUpdate(eventName: string, value: any[]) {
    let results = this.subDispatcher.dispatchMessage(eventName, value);
    if (process.env.DEV) console.log(results);
    return true;
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
  
  resetMainDispatcher() {
    this.mainDispatcher.dispose();
    Disposable.clear(this.mainDispatcher);
  }

  resetSubDispatcher() {
    this.subDispatcher.dispose();
    Disposable.clear(this.subDispatcher);
  }

  private loadMainDecoder() {
    if (process.env.DEV) console.log("Register decoder.");

    let { decoder, connection } = this.config;

    this.resetMainDispatcher();
    let port = this.registerDecoder(connection, decoder);

    this.mainDispatcher.add(port);

    
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

  private registerDecoder(connection: ConnectionType, decoder: string): IPort {
    switch(connection) {
      case ConnectionType.Ext:
        return this.getExtDecoder(decoder);
      case ConnectionType.Http:
        return this.getHTTPDecoder(decoder);
      case ConnectionType.WS:
        return this.getWSDecoder(decoder);
      default:
        return this.getBuiltinDecoder(decoder);

    }
  }

  private loadSubDecoders() {

    const decoders = this.config.subDecoders;

    decoders.forEach(async (decoderConfig) => {
      let port = this.registerDecoder(decoderConfig.connection, decoderConfig.decoder);
    })
    
  }

  getBuiltinDecoder(decoder: string) {
    return new InstancePort(decoder);
  }

  getHTTPDecoder(decoder: string) {
    return new HTTPPort(decoder);
  }

  getWSDecoder(decoder: string) {
    return new WebSocketPort(decoder);
  }

  getExtDecoder(decoder: string) {
    return new ExtensionPort(decoder);
  }

  registerRemoteDecoder(decoderID: string) {
    if (!isExt) return;
    let decoderPort = new ExtensionPort(decoderID);

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
    this.mainDispatcher.add(decoderPort);
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
import { Disposable } from "src/api/common/disposable";
import { IDisposable } from "./disposable";
import { IMessageObjectType } from "./message";

export interface IPort extends IDisposable {

  name: string;

  connect: () => boolean;
  reconnect: () => boolean;

  postMessage: (value: IMessageObjectType, other?: any) => boolean;

  disconnect: () => void;

  onmessage?: (msg: IMessageObjectType, port: IPort) => void;
  ondisconnect?: (port: IPort) => void;

}

export interface IPortConstructor {
  new (name: string): IPort;
}

export interface IMiniPort {
  postMessage: (value: IMessageObjectType, other?: any) => boolean;
  dispose: () => void;
}

export function convertToPortInstance<T extends FunctionConstructor>(
  obj: T, 
  port: {
    postMessage: (msg: IMessageObjectType, other?: any) => void
  },
  overrideList: string[]
): any {
  
  let instance = Object.create(obj.prototype);
  overrideList.forEach((name) => {
    instance.__proto__[name] = (...args: any[]) => {
      port.postMessage({
        data: { type: name, value: args }
      });
    }
  });

  return instance;
}

export class WebWorkerPort extends Disposable implements IPort {

  constructor(name: string) {
    super();
    this.name = name;
  }


  ondisconnect?: ((port: IPort) => void) | undefined;
  onmessage?: (msg: IMessageObjectType, port: IPort) => void;

  scriptSrc= "";


  #worker?: Worker;
  
  set name(value: string) {
    this.scriptSrc = value;
  }

  connect() {
    try {
      this.#worker = new Worker(this.scriptSrc);
      this.dispatchEvent(new Event("connected"));
    } catch(e) {
      console.error(e);
      return false;
    }

    this.#worker!.onmessage = (ev) => {
      let data = ev.data as IMessageObjectType;
      if (this.onmessage) this.onmessage(data, this);
      else console.error("No register port `onmessage` handler.", this.scriptSrc);
    }

    this.disposable = {
      dispose: () => {
        this.#worker!.onmessage = null;
      }
    }

    return true;
  }

  reconnect() {
    return this.connect();
  }

  get worker() {
    return this.#worker;
  }

  postMessage(msg: IMessageObjectType) {
    if (!this.#worker) this.reconnect();

    try {
      this.#worker!.postMessage(msg);
    } catch(e) {
      console.error(e);
      return false;
    }
    return true;
  }

  disconnect() {
    this.#worker?.terminate();
  }

}
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
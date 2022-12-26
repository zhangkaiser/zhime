import { IDisposable } from "./disposable";
import { IMessageObjectType } from "./message";

export interface IPort extends IDisposable {

  name: string;

  connect: () => boolean;
  reconnect: () => boolean;

  postMessage: (value: IMessageObjectType) => boolean;

  disconnect: () => void;

  onmessage?: (msg: IMessageObjectType, port: IPort) => void;
  ondisconnect?: (port: IPort) => void;

}

export interface IPortConstructor {
  new (name: string): IPort;
}

import { IDisposable } from "./disposable";

export interface IPort extends IDisposable {

  name: string;

  connect: () => boolean;
  reconnect: () => boolean;

  postMessage: (value: IMessageObject<any>) => boolean;

  disconnect: () => void;

  onmessage?: (msg: IMessageObject<any>, port: IPort) => void;
  ondisconnect?: (port: IPort) => void;

}

export interface IPortConstructor {
  new (name: string): IPort;
}

import { Disposable } from "src/api/common/disposable";
import { IPort } from "./port";

export interface IRemoteMessageHandler {
  handleMessage(msg: IMessageObject<any>): boolean;
  verifyAuth(name: string, type: string): boolean;

}

export class RemoteEventDispatcher extends Disposable {

  constructor(public handler: IRemoteMessageHandler) {
    super();
  }

  get ports() {
    return this.getDisposables() as Map<string | symbol, IPort>;
  }

  add(port: IPort) {
    this.setCurrentEventName(port.name);
    this.disposable = port;
  }

  connects() {
    this.ports.forEach((item) => (item as IPort).connect());
  }

  dispatch(type: string, value: any[]) {
    let msg = {data: {type, value}};
    this.ports.forEach((item) => {
      if (!this.handler.verifyAuth(item.name, type)) return;
      item.postMessage(msg);
    });
  }

  dispose() {
    this.ports.forEach((port) => port.disconnect());
  }

}
import { Disposable } from "src/api/common/disposable";
import { IPort } from "./port";

export interface IEventDispatcherHandler {
  verifyAuth?(name: string, type: string): boolean;
}

export interface IEventDispatcher {
  dispatchMessage(type: string, value: any[]): boolean[];
}

export class RemoteEventDispatcher extends Disposable implements IEventDispatcher {

  constructor(public handler: IEventDispatcherHandler = {}) {
    super();
  }

  get ports() {
    return this.getDisposables() as Map<string | symbol, IPort>;
  }

  add(port: IPort) {
    this.setCurrentEventName(port.name);
    this.disposable = port;
  }

  // connects() {
  //   this.ports.forEach((item) => (item as IPort).connect());
  // }

  dispatchMessage(type: string, value: any[]) {
    let msg = {data: {type, value}};
    let status: boolean[] = [];
    this.ports.forEach((item) => {
      if (this.handler.verifyAuth && !this.handler.verifyAuth(item.name, type)) {
        status.push(false);
        return ;
      }

      if (item.postMessage(msg)) status.push(true);
      else status.push(false);
    });
    return status;
  }

  // dispose() {
  //   this.ports.forEach((port) => port.disconnect());
  // }

  [Symbol.toStringTag]() {
    return "RemoteEventDispatcher";
  }

}

export class EventDispatcher extends Disposable implements IEventDispatcher {
  dispatchMessage(type: string, value: any[]) {
    return [true];
  }
}
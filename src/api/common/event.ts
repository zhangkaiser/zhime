import { Disposable, IDisposable } from "src/api/common/disposable";
import { IPort } from "./port";

export interface IEventDispatcherHandler {
  isAllow?(port: IPort, type: string): boolean;
}

export interface IEventDispatcher extends Disposable {
  handler?: IEventDispatcherHandler;
  add(port: IPort): void;
  dispatchMessage(type: string, value: any[]): any;
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

  dispatchMessage(type: string, value: any[]) {
    const msg = {data: {type, value}};
    const portStatus = new Map<IPort, boolean>;
    this.ports.forEach((item) => {
      if (this.handler.isAllow && !this.handler.isAllow(item, type)) {
        portStatus.set(item, false);
        return ;
      }

      portStatus.set(item, item.postMessage(msg));
    });

    return portStatus;
    
  }

  [Symbol.toStringTag]() {
    return "RemoteEventDispatcher";
  }

}

export class EventDispatcher extends Disposable implements IEventDispatcher {
  
  add() {}

  dispatchMessage(type: string, value: any[]) {
    return [true];
  }
}

export function registerEmitterEventDisposable<T extends Function>(eventObj: {
  on: (eventName: string, handler: any) => void, off:(eventName: string) => void}, eventName: string, callback: T): IDisposable {
  eventObj.on(eventName, callback);
  return {
    dispose() {
      eventObj.off(eventName);
    }
  }
}

export function registerGlobalEventDisposable<T extends Function>(eventObj: any, eventName: string, callback: T): IDisposable {
  eventObj[eventName] = callback;
  return {
    dispose() {
      eventObj[eventName] = null;
    }
  }
}

export function registerEventTargetDisposable<T extends Function>(eventObj: EventTarget, eventName: string, callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
  eventObj.addEventListener(eventName, callback, options);
  return {
    dispose() {
      eventObj.removeEventListener(eventName, callback, options);
    }
  }
}
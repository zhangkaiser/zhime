import { IPort } from "./port";

export interface IRemoteMessageHandler {
  handleMessage(msg: IMessageObject<any>): boolean;
  verifyAuth(name: string, type: string): boolean;
}


export class RemoteEventDispatcher {

  ports: IPort[] = [];

  constructor(public controller: IRemoteMessageHandler) {

  }

  add(port: IPort) {
    this.ports.push(port);
  }

  connects() {
    this.ports.forEach((item) => item.connect());
  }

  dispatch(type: string, value: any[]) {
    
    let msg = {data: {type, value}};
    this.ports.forEach((item) => {
      if (!this.controller.verifyAuth(item.name, type)) return;
      item.postMessage(msg);
    })
  }

  disposes() {
    this.ports.forEach((port) => {
      port.disconnect();
    });
  }

}
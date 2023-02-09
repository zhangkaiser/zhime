import { IPort, IPortConstructor } from "src/api/common/port";
import { registerEventDisposable } from "src/api/extension/event";
import { Disposable } from "src/api/common/disposable";
import { IMessageObjectType } from "src/api/common/message";

export class Port extends Disposable implements IPort {

  #port?: chrome.runtime.Port;

  ondisconnect?: ((port: IPort) => void) | undefined;
  onmessage?: (msg: IMessageObjectType, port: IPort) => void;
  

  constructor(readonly name: string) {
    super();
  }

  connect() {
    try {
      this.#port = chrome.runtime.connect(this.name);
    } catch(e) {
      console.error(e);
      return false;
    }

    this.registerEvent();

    return true;
  }

  registerEvent() {
    this.disposable = registerEventDisposable(this.#port!.onMessage, (msg: IMessageObjectType, port) => {  
      if (this.onmessage) this.onmessage(msg, this); 
      else console.error("No register port `onmessage` handler.", this.name);
    });

    this.disposable = registerEventDisposable(this.#port!.onDisconnect, (port) => {
      this.#port = undefined;
      if (this.ondisconnect) this.ondisconnect(this);
    });
  }

  reconnect() {
    return this.connect();
  }

  postMessage(msg: IMessageObjectType) {
    if (!this.#port) this.reconnect();

    try {
      this.#port!.postMessage(msg);
    } catch(e) {
      console.error(e);
      return false;
    }

    return true;
  }

  protected setPort(port: chrome.runtime.Port) {
    this.#port = port;
    this.registerEvent();
  }

  disconnect() {
    this.#port?.disconnect();
  }

  dispose() {
    this.disconnect();
  }
}

export class PortInstance extends Port {
  constructor(port: chrome.runtime.Port) {
    super(port.name);
    this.setPort(port);
  }

  reconnect() {
    console.info("Port instance not support reconnect!");
    return false;
  }
}

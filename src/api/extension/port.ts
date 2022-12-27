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

    this.disposable = registerEventDisposable(this.#port!.onMessage, (msg: IMessageObjectType, port) => {  
      if (this.onmessage) this.onmessage(msg, this); 
      else console.error("No register port `onmessage` handler.", this.name);
    });

    this.disposable = registerEventDisposable(this.#port!.onDisconnect, (port) => {
      this.#port = undefined;
      if (this.ondisconnect) this.ondisconnect(this);
    });

    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return false;
    }

    return true;
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

  disconnect() {
    this.#port?.disconnect();
  }

  dispose() {
    this.disconnect();
  }
}

import { Disposable } from "src/api/common/disposable";
import { WebWorkerPort } from "src/api/common/port";
import { webDecoders } from "src/consts/env";
import { IModel } from "./base";
import { ChromeOSModel, IIMEMethodRenderDetail } from "./chromeos";

export class WebModel extends ChromeOSModel implements IModel {
  
  engineID = "web";
  contextID = 0;
  
  registerDecoder() {
    let decoderID = this.globalState.decoder as keyof typeof webDecoders;
    // TODO.
    if (!Reflect.has(webDecoders, decoderID)) return;

    let decoderConfig = webDecoders[decoderID];

    let decoderPort = new WebWorkerPort(decoderConfig.scripts);

    decoderPort.addEventListener("connected", () => {
      globalThis.imeWorker = decoderPort.worker;
      window.dispatchEvent(new Event("registedWorker"));
    });

    decoderPort.onmessage = (msg, port) => {
      // Dispatch decoder event.
      if (["loadedWasm"].indexOf(msg.data.type) > -1) {
        window.dispatchEvent(new Event(msg.data.type));
        return;
      }
      this.dispatchEvent(new CustomEvent<IIMEMethodRenderDetail>("onmessage", {detail: [msg, port, true]}));
    }

    this.eventDispatcher.add(decoderPort);

  }

  [Symbol.toStringTag]() {
    return "WebModel";
  }

}
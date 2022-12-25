import { IDisposable } from "src/api/common/disposable";

export function registerEventDisposable<T extends Function>(eventObj: chrome.events.Event<T>, callback: T): IDisposable {
  eventObj.addListener(callback);
  return {
    dispose() {
      eventObj.removeListener(callback)
    }
  }
}
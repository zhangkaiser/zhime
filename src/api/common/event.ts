export type IChromeEvent = chrome.events.Event<any>;


export class Disposable extends EventTarget implements IDisposable {

  #disposes = new Map<string | symbol, IDisposable>();

  #currentEventName = "";

  setCurrentEventName(value: string) {
    this.#currentEventName = value;
  }

  set disposable(disposable: IDisposable) {
    if (this.#currentEventName) {
      if (this.#disposes.has(this.#currentEventName)) {
        let oldDisposable = this.#disposes.get(this.#currentEventName);
        oldDisposable?.dispose();
      }
      this.#disposes.set(this.#currentEventName, disposable);
      this.setCurrentEventName("");
    } else {
      let key = Symbol("event");
      this.#disposes.set(key, disposable);
    }
  }

  dispose() {
    this.#disposes.forEach((item) => {
      item.dispose();
    });

    this.#disposes.clear();
  }

}

export interface IDisposable {
  dispose: () => void;
}

export class Disposable extends EventTarget implements IDisposable {

  #disposes = new Map<string | symbol, IDisposable>();

  #currentEventName = "";

  setCurrentEventName(value: string) {
    this.#currentEventName = value;
  }

  getDisposable(key: string) {
    return this.#disposes.get(key);
  }

  getDisposables() {
    return this.#disposes;
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
  }

  static delete(disposes: Map<string | symbol, IDisposable>, key: string) {
    disposes.delete(key);
  }

  static clear(disposes: Map<string | symbol, IDisposable>) {
    disposes.clear();
  }
  
  static dispose(disposes: Map<string | symbol, IDisposable>, key: string) {
    disposes.get(key)?.dispose();
  }

}
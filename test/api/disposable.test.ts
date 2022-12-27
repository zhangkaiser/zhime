
import { expect } from "chai";

import { Disposable } from "src/api/common/disposable";

const disposeDemo = {
  name: "hello",
  dispose() {
    this['name'] = "";
  }
}

describe("class Disposable", function() {

  describe("disposable setter", function() {
    let instance = new Disposable();
    let disposables = instance.getDisposables();

    it('Add disposable to #dispose', () => {
      instance.disposable = disposeDemo;
      expect(disposables.size).to.be.gt(0);
      
      Disposable.clear(instance);
      expect(disposables.size).to.be.equal(0);

      instance.setCurrentEventName("hello");
      instance.disposable = disposeDemo;
      instance.setCurrentEventName("hello");
      instance.disposable = disposeDemo;
      instance.disposable = disposeDemo;
      expect(disposables.size).to.be.equal(2);
      
      let disposable = instance.getDisposable("hello");
      expect(disposable).to.be.equal(disposeDemo);
      expect((disposable as any).name).to.be.empty;

      Disposable.delete(instance, "hello");
      expect(disposables.size).to.be.equal(1);
      expect(instance.getDisposable("hello")).to.be.undefined;

      instance.disposable = disposeDemo;
      expect(disposables.size).to.be.equal(2);
    });
  })
})
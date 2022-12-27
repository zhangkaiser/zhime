
import { expect } from "chai";

import "mock/localStorage";
import "mock/chrome.storage.local";

import { setGlobalLocalStorageInstance, storageInstance } from "src/model/storage";
import { LocalStorage as ExtLocalStorage } from "src/api/extension/storage";
import { LocalStorage } from "src/api/common/storage";

describe("Global local storage instance", function() {
  it("Test local storage instance.", async function() {

    expect(storageInstance instanceof LocalStorage).to.be.eq(true);

    setGlobalLocalStorageInstance(ExtLocalStorage<any>);

    expect(storageInstance instanceof ExtLocalStorage).to.be.eq(true);
    expect(storageInstance instanceof LocalStorage).to.be.eq(false);
  });

})
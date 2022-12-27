import { LocalStorage } from "src/api/extension/storage";

import { expect } from "chai";
import "mock/chrome.storage.local";

describe("class extension.LocalStorage", function() {

  interface IStorageTable {
    test: string;
    value: string;
    name: string;
    num: number;
  }

  let storage = new LocalStorage<IStorageTable>();

  it("Test type defined.", async function() {
    storage.set("name", "kaiser zh");
    let data = await storage.get("name");

    expect(data).to.be.property("name");
  })
})
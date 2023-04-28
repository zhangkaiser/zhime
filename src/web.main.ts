import { setGlobalLocalStorageInstance } from "./model/storage";
import { LocalStorage } from "src/api/common/storage";
import { changeGlobalConsole } from "src/api/common/console";

import { WebController } from "./controller/web";

async function main() {
  changeGlobalConsole("web-main");
  setGlobalLocalStorageInstance(LocalStorage<any>);

  const controller = new WebController();

  controller.registerWindowListeners(); 
  controller.registerIMEViewListeners();
  controller.registerModelEvent();
  controller.registerIMEEvent();
  controller.registerIMElifecycleEvent();
}

main();
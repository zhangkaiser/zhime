import { setGlobalLocalStorageInstance } from "./model/storage";
import { LocalStorage } from "src/api/common/storage";
import { WebController } from "./web-controller";
import { changeGlobalConsole } from "./api/common/console";

async function main() {
  changeGlobalConsole("web-main");
  setGlobalLocalStorageInstance(LocalStorage<any>);

  const controller = new WebController();

  controller.registerWindowListeners(); 
  controller.registerIMEViewListeners();
  await controller.initialize();
  
  controller.registerModelEvent();
  controller.registerIMEEvent();
  controller.registerIMElifecycleEvent();
}

main();
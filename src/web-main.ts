import { setGlobalLocalStorageInstance } from "./model/storage";
import { LocalStorage } from "src/api/common/storage";
import { WebController } from "./web-controller";

async function main() {
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
import { LocalStorage } from "src/api/extension/storage";
import { changeGlobalConsole } from "./api/common/console";
import { ChromeOSController } from "./chromeos-controller";
import { setGlobalLocalStorageInstance } from "./model/storage";

async function main() {
  changeGlobalConsole("background");
  setGlobalLocalStorageInstance(LocalStorage<any>);
  
  let controller = new ChromeOSController();

  await controller.initialize();

  controller.registerLifecycleEvent();
  controller.registerConnectionEvent();

  controller.registerIMElifecycleEvent();
  controller.registerIMEEvent();
  controller.registerSelfEvents();
  controller.registerModelEvent();

}

main();
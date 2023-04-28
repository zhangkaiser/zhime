import { LocalStorage } from "src/api/extension/storage";
import { changeGlobalConsole } from "src/api/common/console";
import { ChromeOSController } from "./controller/chromeos";
import { setGlobalLocalStorageInstance } from "./model/storage";

async function main() {
  changeGlobalConsole("background");
  setGlobalLocalStorageInstance(LocalStorage<any>);
  
  let controller = new ChromeOSController();

  controller.registerLifecycleEvent();
  controller.registerConnectionEvent();

  controller.registerIMElifecycleEvent();
  controller.registerIMEEvent();
  controller.registerSelfEvents();
  controller.registerModelEvent();
  
}

main();
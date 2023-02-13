import { LocalStorage } from "src/api/extension/storage";
import { registerEventDisposable } from "src/api/extension/event";
import { addBeforeUnloadInfo, removeBeforeUnloadInfo } from "src/api/common/window";
import { setGlobalLocalStorageInstance } from "./model/storage";
import { ChromeOSController } from "./chromeos-controller";
import { changeGlobalConsole } from "./api/common/console";


let intervalID = 0;

function connectPort(name: string) {
  let port = chrome.runtime.connect({name});

  registerEventDisposable(port.onDisconnect, (_port) => {
    removeBeforeUnloadInfo();
    close();
  });
}

async function main() {
  changeGlobalConsole("decoder-page");
  setGlobalLocalStorageInstance(LocalStorage<any>);

  let controller = new ChromeOSController();

  await controller.initialize();

  controller.registerLifecycleEvent();
  controller.registerIMElifecycleEvent();
  controller.registerIMEEvent();
  controller.registerModelEvent();

  addBeforeUnloadInfo("当前IME正在运行.");

  const { decoder } = controller.model.globalState;
  
  intervalID = setInterval(() => {
    connectPort(decoder);
  }, 3 * 60 * 1000) as any as number;

  connectPort(decoder);
}

main();
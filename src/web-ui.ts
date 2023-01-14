/**
 * WEB入口
 * - 加载输入法解析器到Worker
 * - 构建IME API
 * - 处理交互
 */
import { Controller } from "./controller";
import { LocalStorage } from "src/api/common/storage";
import { setGlobalLocalStorageInstance, storageInstance } from "./model/storage";
import { imeView } from "./view/webime";
import { IView } from "./view/base";

class WebUI extends Controller {

  constructor() {
    super("web");
  }
  
  initialize() {
    this.render();

    this.loadIMEStateStorage();
    this.createWorker();
    // 在页面被创建时构建。
    // - 初始化IME。
    // - 用户初始化。
  }

  createWorker() {

  }

  loadIMEStateStorage() {

  }

  render() {

  }
}

function main() {
  setGlobalLocalStorageInstance(LocalStorage<any>);

  let controller = new WebUI();
  controller.view = imeView! as any as IView;
  
}
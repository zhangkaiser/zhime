/**
 * WEB入口
 * - 加载输入法解析器到Worker
 * - 构建IME API
 * - 处理交互
 */
import { Controller } from "./controller";
import { LocalStorage } from "src/api/common/storage";
import { setGlobalLocalStorageInstance, storageInstance } from "./model/storage";
import type { WebIMEView } from "./view/webime";
import { IView } from "./view/base";
import { html, render } from "lit";

import "./view/webime";


class WebUI extends Controller {

  requestId = 0;
  contextID = 0;

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

  registerWindowEvents() {

    window.onkeydown = this.onKeyEventAdapter.bind(this);
    window.onkeyup = this.onKeyEventAdapter.bind(this);

    window.onfocus = this.onFocusAdapter.bind(this);
    window.onblur = () => {
      this.onBlur(this.contextID);
    }

    window.oncancel = console.log.bind(null, "oncancel");
    window.onchange = console.log.bind(null, "onchange");
    window.oninput = console.log.bind(null, "oninput"); 
  }

  loadIMEStateStorage() {
    this.model.globalState = {
      decoder: "librime"
    }
  }

  render() {
  }

  printErr(args: any) {
    console.log(args[0]);
  }

  onKeyEventAdapter(e: KeyboardEvent) {
    this.requestId++;
    const {ctrlKey, altKey, shiftKey, code, key, metaKey, type} = e;
    const keyData = {
      ctrlKey, altKey, shiftKey,
      type, code, key, 
      metaKey, 
    }
    return this.onKeyEvent('zhime', keyData, '' + this.requestId);
  }

  onFocusAdapter(e: Event) {
    this.contextID++;
    let context = {contextID: this.contextID};
    this.onFocus(context as any);
  }
}

function main() {
  setGlobalLocalStorageInstance(LocalStorage<any>);
  const controller = new WebUI();
  controller.initialize();

  controller.registerWindowEvents();

  const container = document.getElementById("container");

  render(html`
  <web-ime-view id="ime" ?hidden=${true}></web-ime-view>
  <textarea style="width: 100vw;height: 100vh;" id="input"></textarea>
  `, container!);

  const imeView = document.getElementById("ime") as WebIMEView;
  imeView.addEventListener("onActivate", () => {
    controller.onActivate("zhime", "");
  });
  
  controller.view = imeView as any as IView; 
}

main();
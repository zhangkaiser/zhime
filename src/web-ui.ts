/**
 * WEB入口
 * - 加载输入法解析器到Worker
 * - 构建IME API
 * - 处理交互
 */
import { Controller } from "./controller";
import { LocalStorage } from "src/api/common/storage";
import { setGlobalLocalStorageInstance, storageInstance } from "./model/storage";
import { IView } from "./view/base";
import { html, render } from "lit";

import "./components/tui-editor";
import "./view/webime";

import type { TuiEditor } from "./components/tui-editor";
import type { WebIMEView } from "./view/webime";
import { Status } from "./model/consts";


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

    window.document.onkeydown = this.onKeyEventAdapter.bind(this);
    window.document.onkeyup = this.onKeyEventAdapter.bind(this);

    window.onfocus = this.onFocusAdapter.bind(this);
    window.onblur = () => {
      this.onBlur(this.contextID);
    }

    window.document.oninput = console.log.bind(null, "oninput"); 
  }

  loadIMEStateStorage() {
    this.model.globalState = {
      decoder: "librime"
    }
  }

  render() {
  }

  printErr(args: any) {
    console.warn(args[0]);
  }

  async onKeyEventAdapter(e: KeyboardEvent) {
    this.requestId++;
    const {ctrlKey, altKey, shiftKey, code, key, metaKey, type} = e;
    const keyData = {
      ctrlKey, altKey, shiftKey,
      type, code, key, 
      metaKey,
    }

    if (code === "Backquote" && key === "Unidentified") {
      keyData.key = "`";
    }

    if (key === "Process") return; // OS IME processor.
    
    let requestId = '' + this.requestId;
    if (!this.onKeyEvent('zhime', keyData, requestId)) {
      console.log("module.status", requestId, this.model.status);
      if (this.model.status === Status.INITED && ['Backspace', 'Enter', 'Escape', " "].indexOf(key) > -1) {
        return;
      }
    }
    e.preventDefault();
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
  <tui-editor id="editor">
  </tui-editor>`, container!);

  const imeView = document.createElement("ime-input-view") as WebIMEView;
  let editorElem = document.getElementById("editor") as TuiEditor;
  let imeWidght = imeView.getImeWidghtElem();

  imeView.addEventListener("activate", () => {
    controller.onActivate("zhime", "");
  });

  imeView.addEventListener("show", () => {
    let pos = editorElem.editor.getSelection();
    editorElem.editor.addWidget(imeWidght, "bottom", pos[0]);
  });

  imeView.addEventListener("commit", (e) => {
    editorElem.editor.insertText((e as CustomEvent).detail.text);
  })
  
  controller.view = imeView; 
}

main();
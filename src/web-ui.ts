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
import "./components/edit-header";
import "../librime/emscripten/src/options-page";

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

  onKeyEventAdapter(e: KeyboardEvent) {
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
      if (this.model.status === Status.INITED && (key.length != 1 || key == ' ' || /^[0-9]/.test(key))) {
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
  <div id="loading">正在加载依赖中</div>
  <tui-editor id="editor"></tui-editor>
  <edit-header>
    <div slot="left-name">编辑器设置</div>
    <div slot="left">none</div>
    <div slot="right-name"><span>浏览器设置</span></div>
    <options-page slot="right" id="ime-options"></options-page>

  </edit-header>
  `, container!);

  const imeView = document.createElement("ime-input-view") as WebIMEView;
  const editorElem = document.getElementById("editor") as TuiEditor;
  const optionsPage = document.getElementById("ime-options") as any;
  const loading = document.getElementById("loading") as HTMLDivElement;
  loading.style.position = "fixed";
  loading.style.top = "0";
  loading.style.left = "0";
  loading.style.right = "0";
  loading.style.bottom = "0";
  loading.style.zIndex = "214783647";
  loading.style.lineHeight = "100vh";
  loading.style.textAlign = "center";
  loading.style.backgroundColor = "#fff";

  
  window.addEventListener("registedWorker", () => {
    imeWorker && optionsPage.setWorker(imeWorker);
  });

  window.addEventListener("loadedWasm", () => {
    loading.hidden = true;
  })

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
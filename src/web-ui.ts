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

import tuiEditorStyles from "@toast-ui/editor/dist/toastui-editor.css";

import "./components/tui-editor";
import "./view/webime";
import "./components/edit-header";
import "../librime/emscripten/src/options-page";

import type { TuiEditor } from "./components/tui-editor";
import type { EditHeader } from "./components/edit-header";
import type { WebIMEView } from "./view/webime";
import type { OptionsPage } from "../librime/emscripten/src/options-page";
import type { IMEWidght } from "./components/ime-widght";

import { Status } from "./model/consts";
import { registerEmitterEventDisposable, registerEventTargetDisposable, registerGlobalEventDisposable } from "./api/common/event";


class WebUI extends Controller {

  requestId = 0;
  contextID = 0;

  containerElem = document.getElementById("container")!;
  loadingElem = document.getElementById("loading") as HTMLDivElement;
  imeView: WebIMEView;
  editor: TuiEditor;
  optionsPage: OptionsPage;
  edits: EditHeader;
  imeWidght: IMEWidght;

  _lastKeyIsShift = false;
  shiftLock = false;


  constructor() {
    super("web");
    this.render();
    this.imeView = document.createElement("ime-input-view") as WebIMEView;
    this.editor = document.getElementById("tui-editor") as TuiEditor;
    this.optionsPage = document.getElementById("ime-options") as OptionsPage;
    this.edits = document.getElementById("edits") as EditHeader;
    this.imeWidght = this.imeView.getImeWidghtElem() as IMEWidght;
    this.view = this.imeView;
  }

  registerWindowListeners() {
    this.disposable = registerGlobalEventDisposable(this.editor, "onkeydown", this.onKeyEventAdapter.bind(this));
    this.disposable = registerGlobalEventDisposable(this.editor, "onkeyup", this.onKeyEventAdapter.bind(this));
    this.disposable = registerGlobalEventDisposable(window, "onclose", this.onDeactivated.bind(this));

    // TODO(针对移动端／虚拟键盘中无法正确触发KeyboardEvent的可以在此事件中进行封装适配).
    this.disposable = registerGlobalEventDisposable(window.document, "oninput", console.log.bind(null, "oninput"));

    this.disposable = registerEventTargetDisposable(window, "registedWorker", this.onRegistedWorker.bind(this));
    this.disposable = registerEventTargetDisposable(window, "loadedWasm", this.onLoadedWasm.bind(this))
  }

  registerFocusListeners() {
    this.disposable = registerEmitterEventDisposable(this.editor.editor, "focus", this.onFocusAdapter.bind(this));
    this.disposable = registerEmitterEventDisposable(this.editor.editor, "blur", () => { this.onBlur(this.contextID) });

  }

  onRegistedWorker() {
    imeWorker && this.optionsPage.setWorker(imeWorker);
  }

  onLoadedWasm() {
    this.loadingElem.hidden = true;
  }

  setGlobalStorage() {
    storageInstance.set("global_state", {
      decoder: "librime",
      remote: false
    });
    this.initialize();
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

    if (ctrlKey && !altKey && !shiftKey && ['`', 'Control'].indexOf(keyData.key) === -1) {
      return;
    }

    if (type === "keydown") {
      if (this.handleShiftKey(keyData) || this.shiftLock) return ;
    } else {
      if (this._lastKeyIsShift) {
        this.shiftLock = !this.shiftLock;
      }
      if (this.model.status !== Status.INITED) {
        this.shiftLock = false;
      }
      if (key === "Shift") {
        return;
      }
    }
    
    let requestId = '' + this.requestId;
    if (!this.onKeyEvent('zhime', keyData, requestId)) {
      if (this.model.status === Status.INITED && (key.length != 1 || key == ' ' || /^[0-9]/.test(key))) {
        return;
      }
    }
    e.preventDefault();
  }

  handleShiftKey(keyEvent: chrome.input.ime.KeyboardEvent) {
    if (keyEvent.shiftKey && keyEvent.key === "Shift") {
      this._lastKeyIsShift = keyEvent.code === "ShiftLeft";

      if (!this._lastKeyIsShift) {
        keyEvent.key = "Shift_R";
        keyEvent.shiftKey = false;
      }
    } else {
      this._lastKeyIsShift = false;
    }

    if (/^[A-Z]$/.test(keyEvent.key)) return true;

    return false;
  }

  onFocusAdapter(e: Event) {
    this.contextID++;
    let context = {contextID: this.contextID};
    this.onFocus(context as any);
  }

  showOptionsPage() {
    this.edits.showPage("rightEdit");
  }

  openOptionsPage() {
    this.setGlobalStorage();
    this.showOptionsPage();
  }

  render() {
    render(html`
    <style>${tuiEditorStyles}</style>
    <tui-editor id="tui-editor">
      <div id="editor"></div>
    </tui-editor>
    <edit-header id="edits">
      <div slot="left-name">编辑器设置</div>
      <div slot="left">none</div>
      <div slot="right-name"><span>输入法设置</span></div>
      <options-page slot="right" id="ime-options"></options-page>
    </edit-header>
    `, this.containerElem);
  }

  registerIMEViewListeners() {
    this.disposable = registerEventTargetDisposable(this.imeView, "activate", () => {
      this.onActivate("zhime", "");
    });
    this.disposable = registerEventTargetDisposable(this.imeView, "show", () => {
      let pos = this.editor.editor.getSelection();
      this.editor.editor.addWidget(this.imeWidght, "bottom", pos[0]);
    });
  
    this.disposable = registerEventTargetDisposable(this.imeView, "commit", (e) => {
      this.editor.editor.insertText((e as CustomEvent).detail.text);
    });
  }
}

async function main() {
  setGlobalLocalStorageInstance(LocalStorage<any>);

  const controller = new WebUI();

  controller.registerWindowListeners(); 
  controller.registerIMEViewListeners();
  await controller.initialize();
  controller.registerFocusListeners();

}

main();

import { LitElement, html, css, render } from "lit";
import { customElement, query, queryAll, state } from "lit/decorators.js";
import { LocalStorage } from "src/api/extension/storage";

import shuangpinIcon from "./icons/chromeos-shuangpin-ime";
import rimeIcon from "./icons/rime";

import type { OptionsPage as LibrimeOptionsPage } from "../librime/emscripten/src/options-page";

import { DeocderType, mainDecoders } from "./consts/env";
import { defaultGlobalState, IGlobalState, setGlobalLocalStorageInstance, storageInstance } from "./model/storage";

interface DecoderInfo {
  name: string,
  description: string,
  github?: string,
  download?: string,
  store?: string,
  id: string,
  author: string,
  version: string,
  icon: string
}

const decoders: DecoderInfo[] = [
  {
    name: "ChromeOS-ShuangPin-ime",
    description: "一块轻量级的输入法后端，基于google-input-tools+android googlepinyin开发的项目，支持大部分双拼解决方案和拼音输入。",
    github: "https://github.com/zhangkaiser/chromeos-shuangpin-ime",
    download: "",
    store: "https://chrome.google.com/webstore/detail/fifkgdfgcgfejffmmmnmmkhckkojpdom",
    id: "fifkgdfgcgfejffmmmnmmkhckkojpdom",
    author: "Kaiser Zh",
    icon: shuangpinIcon,
    version: "0.0.1"
  },
  {
    name: "librime-wasm",
    "description": "完全基于RIME的一款解析器，支持自定义管理、上传、生成解决方案，更加灵活的特性。",
    github: "https://github.com/zhangkaiser/librime-wasm",
    "download": "",
    store: "https://chrome.google.com/webstore/detail/gagncmhbopmancichjkcbpjblagihplm",
    id: "gagncmhbopmancichjkcbpjblagihplm",
    author: "Kaiser Zh",
    icon: rimeIcon,
    version: "0.0.1"
  }
]

const optionsInfo = [
  {
    description: "点击`部署方案/自定义部署方案/修改方案`后，需点击`保存并更新页面`按钮 方案才会部署成功。",
  },
  {
    description: "内置了`rime输入法`解析器（支持选择内置方案/自定义方案/修改用户词库）。",
  },
  {
    description: "rime解析器同时部署多个内置输入法方案，在输入框中使用快捷键（Ctrl + `）进行切换方案（例：简/繁体切换，中/英文切换，标点符号切换）。",
  },
  {
    description: "使用扩展解析器时可以使用多种方案。",
  }
];

const modes = [
  {
    name: "内置解析器"
  },
  {
    name: "本地扩展解析器"
  }
];

@customElement("zhime-options")
class OptionsPage extends LitElement {

  static styles = css`
    :host {
      font-size: 125%;
    }
    .full-box {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .item-box {
      width: 85%;
      border: 2px solid #000000;
      padding:7px 14px;
    }
    .item-box .name {
      display: flex;
      color: rgb(32, 33, 36);
    }
    .item-box .name .author {
      margin-left: 7px;
      font-weight: 300;
    }

    .choose {
      background-color: blue;
    }

    .input-box {
      display: flex;
      line-height: 28px;
    }

    input#maindecoder {
      border: 2px solid #000000;
      margin: 0 9px;
      width: 30vw;
    }

    .line-title {
      margin-top: 30px;
    }

    .download {
      display: flex;
      justify-content: flex-end;
    }

    .download-btn {
      line-height: 28px;
      margin-right: 14px;
    }

    .active {
      border-width: 2px 2px 0 2px;
      border-style: solid;
      z-index: 1024;
      font-weight: bold;
      border-radius: 2px;
      background: #ebebeb;
    }

    .modes {
      display: flex;
    }

    .mode-item {
      padding: 24px 32px;
      cursor: pointer;
    }

    .mode-container {
      width: 85vw;
      height: 60vh;
      overflow: scroll;
      padding: 7px 14px;
      background: #ebebeb;
      border: 2px solid black;
      margin: -2px;
      z-index: 1023;
    }

    ::scrollbar {
      width: 9px;
      background-color: rgba(240, 240, 240, 1);
    }
    
    .info-bg {
      width: 85vw;
    }
    
  `;

  @state() globalState: IGlobalState = defaultGlobalState;

  constructor() {
    super();
    setGlobalLocalStorageInstance(LocalStorage<any>);
    storageInstance.get("global_state").then((res) => {
      if (res && res['global_state']) {
        this.changeGlobalState(res['global_state']);
      }
    });
  }

  changeGlobalState(newState: Partial<IGlobalState>) {
    this.globalState = {
      ...defaultGlobalState,
      ...newState
    }
    // TODO(Simple implementation.)
    if (this.globalState.remote) {
      this.currentMode = 1
    } else {
      this.currentMode = 0
    }

    storageInstance.set("global_state", this.globalState);
  }

  get mainElement() {
    return this.shadowRoot!.getElementById("maindecoder") as HTMLInputElement;
  }

  @state() currentMode = 0;

  success() {
    let { value } = this.mainElement;
    this.changeGlobalState({
      decoder: value as DeocderType
    });

    setTimeout(() => {
      alert("本地扩展ID设置成功，将重新重启！");
      chrome.runtime.reload();
    }, 1000);
  }

  onClickDownloadBtn(ev: Event) {
    let target = ev.target as HTMLDivElement;
    let { id } = target;
  }

  chooseMode(e: Event) {
    let target = e.currentTarget as HTMLDivElement;
    let index = + (target.dataset.index ?? 0);
    if (this.currentMode === index) return;

    let state:any = { remote: !!index }
    if (index === 0) {
      state.decoder = "librime";
    } else {
      state.decoder = "";
    }
    this.changeGlobalState(state);
  }

  #workers: Record<string, Worker> = {

  }

  #optionsPage!: LibrimeOptionsPage;

  builtinDecoderOptionsUI() {
    
    import("../librime/emscripten/src/options-page").then((res) => {
      let scriptPath = mainDecoders.librime.scripts;
      if (!(scriptPath in this.#workers)) {
        this.#optionsPage = document.createElement("options-page") as LibrimeOptionsPage;
        let worker = new Worker(scriptPath);
        res.changeAssetsPath("web");
        this.#workers[scriptPath] = worker;
        this.#optionsPage.setWorker(worker);
      }
      let container = this.shadowRoot!.getElementById("options-container") as HTMLDivElement;
      container.innerHTML = "";
      container.appendChild(this.#optionsPage);
    });
    return html`<div id="options-container"></div>`;
  }

  extDecoderOptionsUI() {
    return html`
      <div class="input-box">
        <span>主解析器扩展ID</span>
        <input id="maindecoder" placeholder="在此输入解析器的扩展ID">
        <div class="">
          <button @click=${this.success}>保存</button>
        </div>
      </div>
      <div class="line-title">
        <span><h1>当前支持的解析器</h1></span>
      </div>
      ${decoders.map((decoderInfo) => html`
        <div class="item-box">
          <div class="name">
            <h3>${decoderInfo.name}</h3>
            <h3 class="author">${decoderInfo.author}</h3>
          </div>
          <div class="desc">
            <span>${decoderInfo.description}</span>
          </div>
          <div class="download" .id=${decoderInfo.id} @click=${this.onClickDownloadBtn} >
            <div class="download-btn" ?hidden=${!Reflect.has(decoderInfo, "github")}>
              <a .href=${decoderInfo.github}>GitHub</a>
            </div>
            <div class="download-btn" ?hidden=${!Reflect.has(decoderInfo, "download")}>
              <a .href=${decoderInfo.download}>直接下载</a>
            </div>
            <div class="download-btn" ?hidden=${!Reflect.has(decoderInfo, "store")}
              <a .href=${decoderInfo.store}>Google Web Store安装</a>
            </div>

          </div>
        </div>
      `)}
    `;
  }

  getModeContainerUI() {
    return html`
      ${this.currentMode === 0 ? this.builtinDecoderOptionsUI() : this.extDecoderOptionsUI()}
    `;
  }

  connectionModeUI() {
    return html`
      <div class="modes">
        ${modes.map((item, index) => html`
          <div @click="${this.chooseMode}" class=${this.currentMode == index ? "mode-item active" : "mode-item"} data-index="${index}">
            <span>${item.name}</span>
          </div>
        `)}
      </div>
      <div class="mode-container">
        ${this.getModeContainerUI()}
      </div>
    `;
  }

  optionsInfoUI() {
    return html`
      <div class="info-bg">
        <div class="line-title">
          <span><h1>当前支持状态</h1></span>
        </div>
        ${optionsInfo.map((item, index) => html`
          <div class="info-box">
            <div class="desc">
              <span><b>${index + 1}. </b> ${item.description}</span>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  render() {
    return html`
      <div class="full-box">
        ${this.connectionModeUI()}
        ${this.optionsInfoUI()}
      </div>

    `;
  }

}

let container = document.getElementById("container");

render(
  html`"<zhime-options></zhime-options>"`,
  container!
)
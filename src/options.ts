
import { LitElement, html, css, render } from "lit";
import { customElement, query, queryAll, state } from "lit/decorators.js";
import shuangpinIcon from "./icons/chromeos-shuangpin-ime";
import rimeIcon from "./icons/rime";


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

@customElement("options-page")
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
      width: 75vw;
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
    
  `;

  get mainElement() {
    return this.shadowRoot!.getElementById("maindecoder") as HTMLInputElement;
  }

  success() {
    let { value } = this.mainElement;
    chrome.storage.local.set({
      global_state: {
        decoder: value
      }
    }, () => {
      alert("保存成功，点击确定后将重启此扩展");
      chrome.runtime.reload();
    });
  }

  onClickDownloadBtn(ev: Event) {
    let target = ev.target as HTMLDivElement;
    let { id } = target;
  }

  render() {
    return html`
      <div class="full-box">
        <div class="input-box">
          <span>主解析器扩展ID</span>
          <input id="maindecoder" placeholder="在此输入解析器的扩展ID">
          <div class="">
            <button @click=${this.success}>保存</button>
          </div>
        </div>
        
        <div class="line-title">
          <span><h1>当前支持的解析器<h1></span>
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
              <div class="download-btn" ?hidden=${!Reflect.has(decoderInfo, "“store")}
                <a .href=${decoderInfo.store}>Google Web Store安装</a>
              </div>

            </div>
          </div>
        `)}
      </div>
    `;
  }

}

let container = document.getElementById("container");

render(
  html`"<options-page></options-page>"`,
  container!
)
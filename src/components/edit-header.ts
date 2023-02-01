import { LitElement, html, css, render } from "lit";
import { property, customElement, state } from "lit/decorators.js";


@customElement("edit-header")
class EditHeader extends LitElement {
  static styles = css`
  .header-bg {

  }
  .header-box {
    height: 8vh;
    background: linear-gradient( to right, green, blue);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-align: center;
    display: flex;
    justify-content: space-between;
  }
  .logo {
    font-size: 200%;
    font-weight: bolder;
  }
  `;

  render() {
    return html`
    <div class="header-bg">
      <div class="header-box">
        <slot name="left"></slot>
        <p>
          <span class="logo">ZH IME</span>
          <span>Web中文输入法</span>
        </p>
        <slot name="right"></slot>
      </div>

    </div>
    `;
  }
}
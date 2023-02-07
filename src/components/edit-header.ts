import { LitElement, html, css, render } from "lit";
import { property, customElement, state, query } from "lit/decorators.js";


@customElement("edit-header")
export class EditHeader extends LitElement {
  static styles = css`
  .header-bg {

  }
  .header-box {
    height: 8vh;
    display: flex;
    justify-content: space-between;
  }
  .logo {
    font-size: 200%;
    font-weight: bolder;
  }
  .edit-container {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 10vh;
    left: 0;
    background: #ebebeb;
    padding: 32px;
    overflow: scroll;
  }
  `;

  showEditPage(e: Event) {
    let target = e.currentTarget as HTMLDivElement;
    let nextElement = target.nextElementSibling as HTMLTableSectionElement;
    if (nextElement && nextElement.tagName === "SECTION") {
      nextElement.hidden = !nextElement.hidden;
    }
  }

  showPage(pageTag: "leftEdit" | "rightEdit") {
    return this[pageTag].hidden = false;
  }

  @query("#left") protected leftEdit!: HTMLDivElement;
  @query("#right") protected rightEdit!: HTMLDivElement;

  render() {
    return html`
    <div class="header-bg">
      <div class="header-box">
        <div>
          <div class="" @click=${this.showEditPage}>
            <slot name="left-name"></slot>
          </div>
          <section id="left" class="edit-container" hidden>
            <slot name="left"></slot>
          </section>
        </div>
        <p>
          <span class="logo">ZH IME</span>
          <span>Web中文输入法</span>
        </p>
        <div>
          <div class="" @click=${this.showEditPage}>
            <slot name="right-name"></slot>
          </div>
          <section id="right" class="edit-container" hidden>
            <slot name="right"></slot>
          </section>
        </div>
      </div>

    </div>
    `;
  }
}
import { LitElement, html, css, render } from "lit";
import { property, customElement } from "lit/decorators.js";
import { IDataModel } from "src/model/datamodel";
import { IView } from "./base";

@customElement("web-ime-view")
export class WebIMEView extends LitElement implements IView {

  constructor() {
    super();
    addEventListener("load", () => {
      this.dispatchEvent(new Event("onActivate"));
    });
  }
  @property() states = {};

  commitText() {

  }

  hideInputView() {

  }


  cursor() {
    return html`
    <div class="cursors" id="cursor">
      <div class="curosr">&nbsp;</div>
    </div>
    `
  }


  composition() {
    return html`
    <div class="composition-bg">
      <div class="composition-box">

      </div>
    </div>
    `;
  }

  candidates() {
    return html`
    <div class="candidates-bg">
      <div class="candidate-box">
      </div>
    </div>
    `;
  }


  render() {
    return html`
      <div class="input-view-bg" style="position: fixed;z-index: 999999;">
        ${JSON.stringify(this.states)}
        <div class="input-view-box">
          <div class="line">
            ${this.composition()}
          </div>
          <div class="container">
            ${this.candidates()}
          </div>

        </div>
      </div>
    `;
  }
}
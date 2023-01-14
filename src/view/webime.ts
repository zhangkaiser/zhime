import { LitElement, html, css, render } from "lit";
import { property, customElement } from "lit/decorators.js";
import { IDataModel } from "src/model/datamodel";
import { IView } from "./base";

@customElement("web-ime-view")
class WebIMEView extends LitElement implements IView {
  @property() data = {};

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
      <div class="input-view-bg">
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

let container = document.getElementById("container");

render(html`
<web-ime-view id="ime"></web-ime-view>
`, container!)


export let imeView = document.getElementById("ime");

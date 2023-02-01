import { LitElement, html, css, render } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { IDataModel, PartialViewDataModel } from "src/model/datamodel";
import { IView } from "./base";

import "src/components/ime-widght";

import type { IMEWidght } from "src/components/ime-widght";

const styles = css`

`;

@customElement("ime-input-view")
export class WebIMEView extends LitElement implements IView {

  #imeWidghtElem?: IMEWidght;
  
  static styles = styles;

  constructor() {
    super();
    addEventListener("load", () => this.dispatchEvent(new Event("activate")));
  }

  @state() show = false;
  showing() {
    if (this.show) return;
    this.show = true;
    this.getImeWidghtElem().style.visibility = "visible";
    this.dispatchEvent(new Event("show"));
  }

  hiding() {
    if (this.show) {
      this.show = false;
      this.getImeWidghtElem().style.visibility = "hidden";
    }
  }

  #states: PartialViewDataModel = {

  }

  set states(data: PartialViewDataModel) {
    if (typeof data !== "object") {
      data = {}
    }

    let {
      setComposition, clearComposition,
      hideInputView,
      setCandidates, setCandidateWindowProperties,
      commitText
    } = data;


    if (setComposition) {
      let imeWidghtElem = this.getImeWidghtElem();
      this.showing();
      imeWidghtElem.setComposition(setComposition);
    }
    if (clearComposition) {
      let imeWidghtElem = this.getImeWidghtElem();
      imeWidghtElem.clearComposition();
      this.hiding();
    }

    if (hideInputView) {
      this.hiding();
    }

    if (setCandidates) {
      let imeWidghtElem = this.getImeWidghtElem();
      this.showing();
      imeWidghtElem.setCandidates(setCandidates);
    }

    if (setCandidateWindowProperties) {
      let imeWidghtElem = this.getImeWidghtElem();
      imeWidghtElem.setCandidateWindowProperties(setCandidateWindowProperties);
    }

    if (commitText) {
      this.commitText(commitText.text);
      this.hiding();
    }
  }

  commitText(text: string) {
    this.dispatchEvent(new CustomEvent("commit", {
      detail: {text},
      bubbles: true,
      composed: true
    }));
  }

  getImeWidghtElem() {
    if (!this.#imeWidghtElem) {
      this.#imeWidghtElem = document.createElement("ime-widght") as IMEWidght;
    }
    return this.#imeWidghtElem;
  }

  // render() {
  //   return html`<ime-widght id="imeWidght" .style="visibility:${this.show ? 'visible' : 'hidden'}"></ime-widght>`;
  // }
}

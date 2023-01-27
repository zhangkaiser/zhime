import { LitElement, html, css, render } from "lit";
import { property, customElement } from "lit/decorators.js";
import { styleMap, StyleInfo } from "lit/directives/style-map.js";
import { IDataModel, PartialViewDataModel } from "src/model/datamodel";
import { IView } from "./base";

const styles = css`
.input-view-bg {
  position: fixed;
  z-index: 9999999;
  background: #fff;
}

.input-view-box {
  border: 1px solid #000;
  min-width: 100px;
}

.composition-bg {
  padding: 4px 7px;
}

.candidates-bg {
}

.candidates-box {
  min-width: 100px;
  padding: 4px 0;
}

.candidate-bg {
  display: flex;
  flex-direction: row;
  line-height: 1.2em;
}

.candidate-bg .label {
  min-width: 7px;
  margin: 4px;
}

.candidate-box {
  display: flex;
  flex-direction: row;
  justify-items: stretch;
  padding: 4px 7px;
}

.annotation {
  opacity: 0.8;
}
`;

@customElement("web-ime-view")
export class WebIMEView extends LitElement implements IView {
  
  static styles = styles;

  constructor() {
    super();
    addEventListener("load", () => {
      this.dispatchEvent(new Event("onActivate"));
    });
  }

  #states: PartialViewDataModel = {

  }

  set states(value: PartialViewDataModel) {
    this.#states = Reflect.has(value, 'hideInputView') 
    ? {} 
    : {
      ...this.#states,
      ...value
    }
    this.requestUpdate();
  }

  @property() 
  get states() {
    return this.#states;
  } 

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
    let { setComposition, clearComposition, setCursorPosition } = this.states;
    if (clearComposition) {
      delete this.states['clearComposition'];
      return ;
    }
    return html`
    <div class="composition-bg">
      <div class="composition-box">
        <div class="text">${setComposition?.text}</div>
      </div>
    </div>
    `;
  }

  candidate(item: chrome.input.ime.CandidateTemplate) {
    return html`
      <div class="candidate-bg">
        <div class="label">${item.label}</div>
        <div class="candidate-box">
          <div class="candidate">${item.candidate}</div>
          <div class="annotation">${item.annotation}</div>
        </div>
      </div>
    `;
  }

  candidates() {

    let { setCandidates, setCandidateWindowProperties } = this.states;
    let { cursorVisible, vertical = true, visible = true, windowPosition } = setCandidateWindowProperties?.properties ?? {};

    let candidates = setCandidates?.candidates ?? [];

    const candidateWindowStyle: StyleInfo = {
      display: visible ? 'flex' : 'none',
      flexDirection: vertical ? "column" : "row"
    }
    return html`
    <div class="candidates-bg">
      <div class="candidates-box" style=${styleMap(candidateWindowStyle)}>
        ${candidates.map((candidate) => this.candidate(candidate))}
      </div>
    </div>
    `;
  }

  render() {
    let {setComposition, setCandidates} = this.#states;
    let hidden = !setComposition && !setCandidates ? true : false;
    return html`
      <div class="input-view-bg" style="position: fixed;z-index: 999999;" ?hidden=${hidden}>
        <div class="input-view-box">
          ${this.composition()}
          ${this.candidates()}
        </div>
      </div>
    `;
  }
}

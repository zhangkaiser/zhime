import { LitElement, html, css, render } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { styleMap, StyleInfo } from "lit/directives/style-map.js";
import { getTempStrArr } from "src/utils/template-strings-array";

import styles from "../css/ime.css";

@customElement("ime-widght")
export class IMEWidght extends LitElement {
  static styles = css(getTempStrArr([styles]));
  /** Composition Window */
  setComposition(params: chrome.input.ime.CompositionParameters) {
    this.compositionText = params.text;
  }
  clearComposition() {
    this.compositionText = "";
  }

  @state() compositionText = "";
  
  /** Candidate Window */
  setCandidateWindowProperties(params: chrome.input.ime.CandidateWindowParameter) {
    let {vertical, visible} = params.properties;
    this.vertical = !!vertical;
    this.visibleCandidateWindow = !!visible;
  }

  setCandidates(params: chrome.input.ime.CandidatesParameters) {
    let {candidates = []} = params;
    this.candidates = candidates;
  }

  @state() visibleCandidateWindow = false;
  @state() vertical = true;
  @state() candidates:chrome.input.ime.CandidateTemplate[] = [];
  
  protected compositionUI() {
   return html`
    <div class="composition-bg">
      <div class="composition-box">
        <div class="text">${this.compositionText}</div>
      </div>
    </div>
   `; 
  }

  protected candidateUI(result: chrome.input.ime.CandidateTemplate) {
    return html`
      <div class="candidate-bg">
        <div class="label">${result.label}</div>
        <div class="candidate-box">
          <div class="candidate">${result.candidate}</div>
          <div class="annotation">${result.annotation}</div>
        </div>
      </div>
    `;
  }

  protected candidatesUI() {
    const candidateWindowStyle: StyleInfo = {
      display: this.visibleCandidateWindow ? 'flex' : 'none',
      flexDirection: this.vertical ? 'column' : 'row'
    }

    return html`
    <div class="candidates-bg">
      <div class="candidates-box" style=${styleMap(candidateWindowStyle)}>
        ${this.candidates.map((candidate) => this.candidateUI(candidate))}
      </div>
    </div>
    `;
  }

  render() {
    return html`
    <div class="input-view-bg" style="position: fixed;z-index: 999999;">
        <div class="input-view-box">
          ${this.compositionUI()}
          ${this.candidatesUI()}
        </div>
      </div>
    `;
  }
}
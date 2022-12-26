import { IPort } from "src/api/common/port";

export class ChromeOSView {

  set clearComposition(value: any[]) {
    chrome.input.ime.clearComposition(value[0]);
  }

  set commitText(value: any) {
    chrome.input.ime.commitText(value[0]);
  }

  set deleteSurroundingText(value: any) {
    chrome.input.ime.deleteSurroundingText(value[0]);
  }

  set hideInputView(value: any) {
    chrome.input.ime.hideInputView();
  }

  set keyEventHandled(value: [string, boolean]) {
    chrome.input.ime.keyEventHandled(value[0], true);
  }

  set sendKeyEvents(value: any) {
    chrome.input.ime.sendKeyEvents(value[0]);
  }

  set setAssistiveWindowButtonHighlighted(value: any) {
    chrome.input.ime.setAssistiveWindowButtonHighlighted(value[0]);
  }

  set setCandidates(value: any) {
    chrome.input.ime.setCandidates(value[0]);
  }

  set setCandidateWindowProperties(value: any) {
    chrome.input.ime.setCandidateWindowProperties(value[0]);
  }

  set setComposition(value: any) {
    chrome.input.ime.setComposition(value[0]);
  }

  set setCursorPosition(value: any) {
    chrome.input.ime.setCursorPosition(value[0]);
  }

  set setMenuItems(value: any) {
    chrome.input.ime.setMenuItems(value[0]);
  }

  set updateMenuItems(value: any) {
    chrome.input.ime.updateMenuItems(value[0]);
  }

}
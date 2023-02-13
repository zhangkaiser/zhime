import { IDataModel } from "src/model/datamodel";
import { IView } from "./base";

export class ChromeOSView implements IView, IDataModel {

  set states(valueObj: IDataModel) {
    for (let item in valueObj) {
      if (item in this) {
        this[item as keyof IDataModel] = valueObj[item  as keyof IDataModel];
      }
    }
  }

  set clearComposition(value: any) {
    chrome.input.ime.clearComposition(value);
  }

  set commitText(value: any) {
    chrome.input.ime.commitText(value);
  }

  set deleteSurroundingText(value: any) {
    chrome.input.ime.deleteSurroundingText(value);
  }

  set hideInputView(value: boolean) {
    if (value) {
      chrome.input.ime.hideInputView();
    }
  }

  set keyEventHandled(value: [string, boolean]) {
    chrome.input.ime.keyEventHandled(value[0], value[1]);
  }

  set sendKeyEvents(value: any) {
    chrome.input.ime.sendKeyEvents(value);
  }

  set setAssistiveWindowProperties(value: any) {
    chrome.input.ime.setAssistiveWindowProperties(value);
  };

  set setAssistiveWindowButtonHighlighted(value: any) {
    chrome.input.ime.setAssistiveWindowButtonHighlighted(value);
  }

  set setCandidates(value: any) {
    chrome.input.ime.setCandidates(value);
  }

  set setCandidateWindowProperties(value: any) {
    chrome.input.ime.setCandidateWindowProperties(value);
  }

  set setComposition(value: any) {
    chrome.input.ime.setComposition(value);
  }

  set setCursorPosition(value: any) {
    chrome.input.ime.setCursorPosition(value);
  }

  set setMenuItems(value: any) {
    chrome.input.ime.setMenuItems(value);
  }

  set updateMenuItems(value: any) {
    chrome.input.ime.updateMenuItems(value);
  }

}
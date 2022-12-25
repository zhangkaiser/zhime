import { IMEControllerEventInterface } from "src/consts/chromeosIME";
import { IViewModel, ViewModel } from "src/api/common/viewmodel";
import { ChromeOSViewModel } from "src/viewmodel/chromeos";

export class Controller extends EventTarget implements IMEControllerEventInterface {

  viewModel: IViewModel;

  constructor(public env: IEnv) {
    super();

    if (env == "chromeos") {
      this.viewModel = new ChromeOSViewModel;
    } else {
      this.viewModel = new ViewModel;
    }
  }

  onInstalled(details: chrome.runtime.InstalledDetails) {
    
  }
  
  onActivate(engineID: string, screen: string) {
    this.viewModel.engineID = engineID;
    this.viewModel.notifyUpdate("onActivate", [engineID, screen]);
  }

  onDeactivated(engineID: string) {
    this.viewModel.notifyUpdate("onDeactivated", [engineID]);
  }

  onReset(engineID: string) {
    this.viewModel.notifyUpdate("onReset", [engineID]);
  }

  onBlur(contextID: number) {
    this.viewModel.notifyUpdate("noBlur", [contextID]);
  }

  onFocus(context: chrome.input.ime.InputContext) {
    this.viewModel.notifyUpdate("onFocus", [context]);
  }

  onKeyEvent(engineID: string, keyData: KeyboardEvent, requestId: string) {
    this.viewModel.notifyUpdate("onKeyEvent", [engineID, keyData, requestId]);
    return false;
    
  }

  onCandidateClicked(engineID: string, candidateID: number, button: "left" | "middle" | "right") {
    this.viewModel.notifyUpdate("onCandidateClicked", [engineID, candidateID, button]);
  }

  onInputContextUpdate(context: chrome.input.ime.InputContext) {
    this.viewModel.notifyUpdate("onInputContextUpdate", [context]);
  }

  onSurroundingTextChanged(engineID: string, surroundingInfo: chrome.input.ime.SurroundingTextInfo) {
    this.viewModel.notifyUpdate("onSurroundingTextChanged", [engineID, surroundingInfo]);
  }

  onMenuItemActivated(engineID: string, name: string) {
    this.viewModel.notifyUpdate("onMenuItemActivated", [engineID, name]);
  }
  
}

export interface IDataModel {
  

  /**
   * Sets the current candidate list. 
   * This fails if this extension doesn't own the active IME
   */
  setCandidates: chrome.input.ime.CandidatesParameters;

  /**
   * Adds the provided menu items or Updates the state of the MenuItems specified
   * to the language menu when this IME is active.
   */
  setMenuItems: chrome.input.ime.ImeParameters;
  updateMenuItems: chrome.input.ime.MenuItemParameters;

  /**
   * Clear or Set the current composition. 
   * If this extension does not own the active IME, this fails.
   */
  setComposition: chrome.input.ime.CompositionParameters;
  clearComposition: chrome.input.ime.ClearCompositionParameters;

  /**
   * Set the position of the cursor in the candidate window. This is a no-op if
   * this extension does not own the active IME.
   */
  setCursorPosition: chrome.input.ime.CursorPositionParameters;

  setCandidateWindowProperties: chrome.input.ime.CandidateWindowParameter;

  /**
   * Shows or Hides an assistive window with the given properties.
   */
  setAssistiveWindowProperties: {
    contextID: number;
    properties: chrome.input.ime.AssistiveWindowProperties;
  };

  /**
   * Highlights/Unhighlights a button in an assistive window.
   */
  setAssistiveWindowButtonHighlighted: {
    contextID: number; 
    buttonID: chrome.input.ime.AssistiveWindowButton; 
    windowType: "undo"; 
    announceString?: string | undefined; 
    highlighted: boolean; 
  }

  /**
   * Deletes the text around the caret.
   */
  deleteSurroundingText: chrome.input.ime.DeleteSurroundingTextParameters

  /**
   * Hides the input view window, which is popped up automatically by system.
   * If the input view window is already hidden, this function will do nothing. 
   */
  hideInputView: boolean;

  /**
   * Indicates that the key event received by onKeyEvent is handled. This should
   * only be called if the onKeyEvent listener is asynchronous.
   */
  keyEventHandled: [string, boolean];

  /**
   * Sends the key event. This function is expected to be used by virtual 
   * keyboards. When key(s) on a virtual keyboard is pressed by a user, this
   * function is used to propagate that event to the system.
   */
  sendKeyEvents: chrome.input.ime.SendKeyEventParameters;

  commitText: chrome.input.ime.CommitTextParameters;
}

export type PartialViewDataModel = Partial<IDataModel>;
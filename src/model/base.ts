import { IPort } from "src/api/common/port";
import { Status } from "./consts";
import { PartialViewDataModel } from "./datamodel";
import { defaultGlobalState, IGlobalState } from "./storage";

export interface IModel extends EventTarget {
  
  /** The engine id of IME. */
  engineID: string;
  /** The input context id of IME. */
  contextID: number;
  /** The focus status of IME. */
  focus: boolean;
  /** The main decoder connection status. */ 
  connected: boolean;
  /** The input status of IME. */
  status: Status;

  states?: PartialViewDataModel;

  globalState: IGlobalState;

  notifyUpdate: (eventName: string, value: any[]) => boolean;

  reset(): void;

  clear(): void;
}


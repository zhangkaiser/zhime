import { ILocalStorageConstructor, LocalStorage } from "src/api/common/storage";
import { DeocderType } from "src/consts/env";

/**
 * Global state storage interface.
 */
export interface IGlobalState {
  readonly decoder: DeocderType;
  readonly remote: boolean;
}

export const defaultGlobalState: IGlobalState = {
  decoder: "librime",
  remote: false
}

export interface IDecoderItemModel {

}

export interface IMELocalStorageTable {
  global_state: IGlobalState,
  decoders: {[name: string]: IDecoderItemModel}
}

export let storageInstance = new LocalStorage<IMELocalStorageTable>(); 
export function setGlobalLocalStorageInstance(obj: ILocalStorageConstructor<IMELocalStorageTable>) {
  storageInstance = new obj();
}


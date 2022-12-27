import { ILocalStorageConstructor, LocalStorage } from "src/api/common/storage";

/**
 * Global state storage interface.
 */
export interface IGlobalState {
  readonly decoder: string;
}

export const defaultGlobalState = {
  decoder: ""
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


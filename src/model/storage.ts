import { ILocalStorageConstructor, LocalStorage } from "src/api/common/storage";

/**
 * Global state storage interface.
 */
interface IGlobalState {

  decoder: string;
}

interface IDecoderItemModel {

}

export interface IMELocalStorageTable {
  global_state: IGlobalState,
  decoders: {[name: string]: IDecoderItemModel}
}


export let storageInstance = new LocalStorage<IMELocalStorageTable>(); 
export function setGlobalLocalStorageInstance(obj: ILocalStorageConstructor<IMELocalStorageTable>) {
  storageInstance = new obj();
}


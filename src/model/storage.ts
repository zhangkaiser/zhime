import { ILocalStorageConstructor, LocalStorage } from "src/api/common/storage";
import { Config } from "./config";

export const enum IMEStorageKey {
  config
}

export interface IMELocalStorageTable {
  [IMEStorageKey.config]: Config
}

export let storageInstance = new LocalStorage<IMELocalStorageTable>(); 
export function setGlobalLocalStorageInstance(StorageConstructor: ILocalStorageConstructor<IMELocalStorageTable>) {
  storageInstance = new StorageConstructor();
}


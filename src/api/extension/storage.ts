
import { ILocalStorage } from "src/api/common/storage";

export class LocalStorage implements ILocalStorage {
  set<T extends keyof ILocalStorageTable>(key: T, value: ILocalStorageTable[T]) {
    chrome.storage.local.set({
      [key]: value
    });
  }

  async get<T extends keyof ILocalStorageTable>(key: T | T[]): Promise<Record<T, ILocalStorageTable[T]> | null | undefined> {
    return chrome.storage.local.get(key) as Promise<Record<T, ILocalStorageTable[T]> | null | undefined>;
  }

  clear() {
    chrome.storage.local.clear();
  }

  remove<T extends keyof ILocalStorageTable>(key: T | T[]) {
    chrome.storage.local.remove(key);
  }
}

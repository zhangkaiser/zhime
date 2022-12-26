
import { ILocalStorage } from "src/api/common/storage";

export class LocalStorage<T extends Object> implements ILocalStorage<T> {
  set<K extends keyof T>(key: K, value: T[K]) {
    chrome.storage.local.set({
      [key]: value
    });
  }

  get<K extends keyof T>(key: K | K[]):Promise<Record<K, T[K]> | null | undefined> {
    return chrome.storage.local.get(key as string) as any;
  }

  clear() {
    chrome.storage.local.clear();
  }

  remove<K extends keyof T>(key: K | K[]) {
    chrome.storage.local.remove(key as any);
  }
}

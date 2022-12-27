
export interface ILocalStorage<T extends Record<string, any>> {
  set<K extends keyof T>(key: K, value: T[K]): void;
  get<K extends keyof T>(key: K | K[]): Promise<Record<K, T[K]> | null | undefined>;
  clear(): void;
  remove<K extends keyof T>(key: K | K[]): void;
}

// export type ILocalStorage = Pick<typeof chrome.storage.local, "get" | "set" | "clear" | "remove"> 

export interface ILocalStorageConstructor<T extends Object> {
  new (): ILocalStorage<T>;
  prototype: ILocalStorage<T>;
}


export class LocalStorage<T extends Object> implements ILocalStorage<T> {
  set<K extends keyof T>(key: K, value: T[K]) {
    localStorage.setItem(key as string, JSON.stringify(value));
  }
  async get<K extends keyof T>(key: K | K[]): Promise<Record<K, T[K]> | null | undefined> {
    let list: K[] = [];
    if (typeof key === "string") list = [key];
    else list = key as K[];

    let entries: [string, any][] = [];

    list.forEach((item) => localStorage.getItem(item as string) ? entries.push([item as string, JSON.stringify(localStorage.getItem(item as string))]) : "");

    return Object.fromEntries(entries) as any;
  }

  clear() {
    localStorage.clear();
  }

  remove<K extends keyof T>(key: K | K[]) {
    if (typeof key === "string") localStorage.removeItem(key);
    else (key as []).forEach((item) => localStorage.removeItem(item));
  }
}

export interface IStorageGlobalState {

}

export interface ILocalStorageTable {
  global_state: IStorageGlobalState
}

export interface ILocalStorage {
  set<T extends keyof ILocalStorageTable>(key: T, value: ILocalStorageTable[T]): void;
  get<T extends keyof ILocalStorageTable>(key: T | T[]): Promise<Record<T, ILocalStorageTable[T]> | null | undefined>;
  clear(): void;
  remove<T extends keyof ILocalStorageTable>(key: T | T[]): void;
}
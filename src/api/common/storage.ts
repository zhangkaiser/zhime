

export interface ILocalStorage<T extends Object> {
  set<K extends keyof T>(key: K, value: T[K]): void;
  get<K extends keyof T>(key: K | K[]): Promise<Record<K, T[K]> | null | undefined>;
  clear(): void;
  remove<K extends keyof T>(key: K | K[]): void;
}
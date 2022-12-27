
const data = new Map<string, any>();


const storageAPI = {
  local: {
    clear: async () => {data.clear()},
    set: async (items: {[key: string]: any}) => {
      for (let key in items) data.set(key, items[key]);
    },
    QUOTA_BYTES : 1024, 
    async getBytesInUse() {
      return 0;
    },
    async remove(key: string | string[]) {
      if (typeof key === "string") data.delete(key);
      else key.forEach((item) => data.delete(item));
    }, 
    async get(key: string | string[] | { [key: string]: any; } | null | undefined) {
      
      let list: string[] = [];
      if (typeof key === "string") list = [key];
      else if (Array.isArray(key)) list = key;
      else if (key) {
        list = Object.keys(key);
      }

      let entries: [string, any][] = [];
      list.forEach((item) => data.has(item) ? entries.push([item, data.get(item)]) : "");

      return Object.fromEntries(entries);
    
    },
    async setAccessLevel(value: any) { },
    onChanged: {} as any
  }
} as any

if (globalThis.chrome) {
  globalThis.chrome.storage = storageAPI;
} else {
  globalThis.chrome = {
    storage: storageAPI
  } as any;
}
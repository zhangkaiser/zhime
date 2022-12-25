
interface IDisposable {
  dispose: () => void;
}

type IEnv = "chromeos" | "vscode" | "extensions";
interface IStorageGlobalState {

}

interface ILocalStorageTable {
  global_state: IStorageGlobalState
}

interface IMessageTypeTable {
  a: string
}

interface IMessageObject<T extends keyof IMessageTypeTable> {
  extID?: string,
  cb?: (response: any) => void,
  data: {
    type: T,
    value: IMessageTypeTable[T]
  }
}
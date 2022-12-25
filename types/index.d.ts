
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

}

interface IMessageObject<T extends keyof IMessageType> {
  extID?: string,
  cb?: (response: any) => void,
  data: {
    type: T,
    value: IMessageTypeTable[T]
  }
}
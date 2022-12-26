

export interface IMessageTypeTable {
  test: string
}

export interface IMessageObject<T extends keyof IMessageTypeTable> {
  extID?: string,
  cb?: (response: any) => void,
  data: {
    type: T,
    value: IMessageTypeTable[T]
  }
}
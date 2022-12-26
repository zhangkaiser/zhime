

export interface IMessageObjectType {
  extID?: string,
  cb?: (response: any) => void,
  data: {
    type: string,
    value: any[]
  }
}
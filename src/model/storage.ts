
/**
 * Global state storage interface.
 */
interface IGlobalState {

  decoder: string;
}

interface IDecoderItemModel {
  
}

export interface ILocalStorageTable {
  global_state: IGlobalState,
  decoders: {[name: string]: IDecoderItemModel}
}
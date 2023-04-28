
export const enum ConnectionType {
  Builtin,
  Ext,
  Http,
  WS
}

export const enum SubRegistrationHook {

}

export class Config {
  
  /**
   * 主要是解决chromeos mv3 service_worker生命周期问题
   * - 在chrome v100版本已经修复了这个问题
   * @see https://developer.chrome.com/docs/extensions/migrating/known-issues/
   */
  reconnectTimeout = 3 * 60 * 1000;
  
  /** Engine ID */
  engineID: string = "zhime";

  /** Main decoder name/ID/URL */
  decoder: string = "shuangpin";

  /** Main decoder connection type */
  connection: ConnectionType = ConnectionType.Builtin;

  /** Sub decoders */
  subDecoders: {
    decoder: string,
    connection: ConnectionType,
    registrations: SubRegistrationHook[]
  }[] = [];

  static revert(key: keyof InstanceType<typeof Config>) {
    return new Config()[key];
  }

  static reset() {
    return new Config();
  }
}
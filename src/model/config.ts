

export class Config {
  /**
   * 主要是解决chromeos mv3 service_worker生命周期问题
   * - 在chrome v100版本已经修复了这个问题
   * @see https://developer.chrome.com/docs/extensions/migrating/known-issues/
   */
  reconnectTimeout = 3 * 60 * 1000;

  engineID: string = "zhime";
}
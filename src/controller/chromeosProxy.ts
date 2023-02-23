// 向外部提供的View API，解决不同的交互差异。

import { IMEMethodInterface, imeMethodList } from "src/consts/chromeosIME";

class ZhimeAPIProxy {
  [name: string]: any;

  // controller: IController;

  constructor(public handler: any) {
    imeMethodList.forEach((methodName) => {
      this[methodName] = (...args: any[]) => {
        this.handleMethod(methodName, args);
      }
    });
  }

  handleMethod(methodName: string, args: any[]) {
    
  }
}

const ZhimeAPI = ZhimeAPIProxy as any as IMEMethodInterface;

export default ZhimeAPI;
import {IModel} from "src/model/base";
import { Disposable } from "src/api/common/disposable";

export class Model extends Disposable implements IModel {
  engineID: string = "";
  contextID: number = 0;

  notifyUpdate() {
    return true;
  }

}
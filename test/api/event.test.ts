
import { expect } from "chai";

import { IEventDispatcherHandler, RemoteEventDispatcher } from "src/api/common/event";
import { IMessageObjectType } from "src/api/common/message";
import { IPort } from "src/api/common/port";

interface IPortMessage {
  name: string[];
  domain: string[];
  address: string[];
  age: number[];
}



class Port<T extends Object, K extends keyof T> implements IPort {

  status = false;

  connectNum = 0;

  constructor(public name: string) {

  }

  connect() {

    this.status = true;
    this.connectNum++;
    return true;
  }

  reconnect() {
    this.connect();
    if (this.connectNum % 2) {
      return false;
    }
    return true;
  }

  postMessage(value: IMessageObjectType) {
    if (!this.status) {
      this.connect();
    }

    if ('onmessage' in this) {
      (this as any)['onmessage'](<IMessageObjectType>{data: {
        type: "test",
        value: ["demo1", "demo2"]
      }})
    }
    return true;

  }

  disconnect() {
    this.status = false;
  }
  
  dispose() {
    this.status = false;
  }
}

const handler: IEventDispatcherHandler = {
  verifyAuth(name: string, type: string) {
    if (name == "port2") {
      return false;
    }

    if (name == "port3" && type === "name") {
      return true;
    }

    return true;
  }
}

describe("class RemoteEventDispatcher", function() {

  describe("#add", function() {

    it("Add port", function() {
      let eventDispatcher = new RemoteEventDispatcher();

      let port1 = new Port<IPortMessage, keyof IPortMessage>("port1");
      eventDispatcher.add(port1);
      
      expect(eventDispatcher.getDisposable(port1.name)).to.be.eq(port1);
    });
    
  });

  describe("#dispatchMessage", function() {

    it("Verify handler effect", function() {
      let eventDispatcher = new RemoteEventDispatcher();
      let eventDispatcher1 = new RemoteEventDispatcher(handler);

      let port1 = new Port<IPortMessage, keyof IPortMessage>("port1");
      let port2 = new Port<IPortMessage, keyof IPortMessage>("port2");
      let port3 = new Port<IPortMessage, keyof IPortMessage>("port3");

      eventDispatcher.add(port1);
      eventDispatcher.add(port2);
      eventDispatcher.add(port3);

      eventDispatcher1.add(port1);
      eventDispatcher1.add(port2);
      eventDispatcher1.add(port3);

      let mock = [
        ['name', 'kaiser'],
        ['address', 'CQ'],
        ['age', 0]
      ]

      mock.forEach((item) => {
        let status = eventDispatcher.dispatchMessage(item[0] as string, [item[1]]);
        expect(status.filter(bool => bool)).to.be.length(3);
      });

      mock.forEach((item) => {
        let status = eventDispatcher1.dispatchMessage(item[0] as string, [item[1]]);
        expect(status.filter(bool => bool)).to.be.length(2);
      })

    });


  })
})
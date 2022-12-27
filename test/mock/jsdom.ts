import { JSDOM } from "jsdom";

(globalThis as any).jsdom = new JSDOM("", {
  url: "http://localhost"
});


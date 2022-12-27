import "./jsdom";

globalThis.localStorage = (globalThis as any).jsdom.window.localStorage;

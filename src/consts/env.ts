
export type IEnv = "chromeos" | "vscode" | "extensions" | "web";
export type DeocderType = "librime" | "shuangpin";

export const webDecoders = {
  librime: { 
    scripts: "./decoders/pthread.js"
  },
  shuangpin: {
    scripts: "./decoders/shuangpin.js"
  }
}

export const mainDecoders = {
  librime: {
    scripts: "./web/decoders/pthread.js"
  },
  shuangpin: {
    scripts: "./web/decoders/shuangpin.js"
  }
}

export type IEnv = "chromeos" | "vscode" | "extensions" | "web";

export const webDecoders = {
  shuangpin: {
    scripts: "./decoders/shuangpin.js",
  },
  librime: { 
    scripts: "./decoders/librime.js"
  }
}
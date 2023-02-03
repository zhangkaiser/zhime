
export type IEnv = "chromeos" | "vscode" | "extensions" | "web";

export const webDecoders = {
  librime: { 
    scripts: "./decoders/pthread.js"
  }
}
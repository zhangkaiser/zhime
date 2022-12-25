
interface IDisposable {
  dispose: () => void;
}

type IEnv = "chromeos" | "vscode" | "extensions";

/// <reference types="@types/emscripten" />

export interface EmscriptenMoreModule extends EmscriptenModule {
  ENVIRONMENT_IS_PTHREAD: boolean;
}
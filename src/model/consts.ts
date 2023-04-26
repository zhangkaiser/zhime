
export const enum Status {
  BLUR = 0,
  FOCUS,
  COMPOSING,
  COMMITTING
}

export const KeyRexExp = {
  NUMBER: /^[0-9]$/,
  LOW_LETTER: /^[a-z]$/,
  UP_LETTER: /^[A-Z]$/,
  LETTER: /^[a-zA-Z]$/,
  NUMBER_AND_LOW_LETTER: /^[a-z0-9]$/,
}

export enum Status {
  NO, // No focus.
  INITED, 
  SHOWING,
  COMPOSING,
  COMMITTING, 
  FETCHING
}

export const KeyRexExp = {
  NUMBER: /^[0-9]$/,
  LOW_LETTER: /^[a-z]$/,
  UP_LETTER: /^[A-Z]$/,
  LETTER: /^[a-zA-Z]$/,
  NUMBER_AND_LOW_LETTER: /^[a-z0-9]$/,
}
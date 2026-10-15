import { PlayerAttributes } from "./Round";

export const VALID_NOTES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export function isValidNote(n: number): boolean {
  return VALID_NOTES.includes(n as typeof VALID_NOTES[number]);
}

export function hasValidNotes(attrs: PlayerAttributes): boolean {
  return isValidNote(attrs.fisico) && isValidNote(attrs.habilidade) && isValidNote(attrs.defesa);
}

import { ObjectId } from "mongodb";

// ---- Player ----
export interface PlayerAttributes {
  fisico: number;
  habilidade: number;
  defesa: number;
}

export type Position = "ATA" | "ZAG";

export type PlayerType = "mensalista" | "diarista";

export interface Player {
  _id?: ObjectId;
  name: string;
  positions: Position[];
  currentStats: PlayerAttributes;
  googleEmail?: string | null;
  isLinked: boolean;
  type?: PlayerType;
}

// ---- Round ----
export type RoundStatus = "open" | "closed" | "applied";

export interface Round {
  _id?: ObjectId;
  createdAt: Date;
  closedAt?: Date | null;
  status: RoundStatus;
  playerIds: string[];
  adminNotes: Record<string, PlayerAttributes>;
  votedEmails: string[];
  voteCount: number;
}

// ---- Vote (anonymous) ----
export interface Vote {
  _id?: ObjectId;
  roundId: ObjectId;
  ratings: Record<string, PlayerAttributes>;
  submittedAt: Date;
}

// ---- Helpers ----
export const VALID_NOTES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export function isValidNote(n: number): boolean {
  return VALID_NOTES.includes(n as typeof VALID_NOTES[number]);
}

export function calculateOverall(stats: PlayerAttributes): number {
  return Math.round(
    stats.fisico * 0.4 + stats.habilidade * 0.35 + stats.defesa * 0.25
  );
}

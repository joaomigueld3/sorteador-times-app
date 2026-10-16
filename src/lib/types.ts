import { ObjectId } from "mongodb";
import type { PlayerType } from "../core/domain/Player";

// ---- Player ----
export interface PlayerAttributes {
  fisico: number;
  habilidade: number;
  defesa: number;
}

export type Position = "ATA" | "ZAG";

export type { PlayerType };

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
export { VALID_NOTES, isValidNote } from "../core/domain/Rating";

export function calculateOverall(stats: PlayerAttributes): number {
  return Math.round(
    stats.fisico * 0.4 + stats.habilidade * 0.35 + stats.defesa * 0.25
  );
}

import { PlayerAttributes } from "./Round";

export interface Vote {
  _id?: string;
  roundId: string;
  ratings: Record<string, PlayerAttributes>;
  submittedAt: Date;
}

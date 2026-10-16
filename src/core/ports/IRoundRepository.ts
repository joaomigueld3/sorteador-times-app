import { Round, PlayerAttributes } from "../domain/Round";

export interface IRoundRepository {
  findById(id: string): Promise<Round | null>;
  create(data: { playerIds: string[]; adminNotes: Record<string, PlayerAttributes> }): Promise<string>;
  addVoter(roundId: string, email: string, name?: string): Promise<boolean>;
  findAll(): Promise<Round[]>;
}

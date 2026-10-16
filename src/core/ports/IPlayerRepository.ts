import { Player } from "../domain/Player";

export interface IPlayerRepository {
  findByEmail(email: string): Promise<Player | null>;
}

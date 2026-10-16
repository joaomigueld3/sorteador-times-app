export type PlayerType = "mensalista" | "diarista";

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
}

/** Diaristas participam das partidas, mas não avaliam os colegas nas rodadas de notas. */
export function canVoteInRounds(player: Pick<Player, "type">): boolean {
  return player.type !== "diarista";
}

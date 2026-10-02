export interface PlayerAttributes {
  fisico: number;
  habilidade: number;
  defesa: number;
}

export interface Round {
  _id?: string;
  createdAt: Date;
  closedAt: Date | null;
  status: "open" | "closed" | "applied";
  playerIds: string[];
  adminNotes: Record<string, PlayerAttributes>;
  votedEmails: string[];
  voteCount: number;
}

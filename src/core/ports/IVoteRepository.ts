import { Vote } from "../domain/Vote";

export interface IVoteRepository {
  create(vote: Omit<Vote, "_id">): Promise<string>;
}

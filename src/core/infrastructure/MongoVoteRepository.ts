import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { IVoteRepository } from "../../core/ports/IVoteRepository";
import { Vote } from "../../core/domain/Vote";

export class MongoVoteRepository implements IVoteRepository {
  async create(vote: Omit<Vote, "_id">): Promise<string> {
    const db = await getDb();
    const result = await db.collection("votes").insertOne({
      roundId: new ObjectId(vote.roundId),
      ratings: vote.ratings,
      submittedAt: vote.submittedAt,
    });
    return result.insertedId.toString();
  }
}

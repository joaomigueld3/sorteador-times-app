import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { IRoundRepository } from "../../core/ports/IRoundRepository";
import { Round, PlayerAttributes } from "../../core/domain/Round";

interface RoundDoc {
  _id: ObjectId;
  createdAt: Date;
  closedAt: Date | null;
  status: "open" | "closed" | "applied";
  playerIds: string[];
  adminNotes: Record<string, PlayerAttributes>;
  votedEmails: string[];
  votedNames?: string[];
  voteCount: number;
}

export class MongoRoundRepository implements IRoundRepository {
  async findById(id: string): Promise<Round | null> {
    const db = await getDb();
    const doc = await db.collection<RoundDoc>("rounds").findOne({ _id: new ObjectId(id) });
    if (!doc) return null;
    return {
      _id: doc._id.toString(),
      createdAt: doc.createdAt,
      closedAt: doc.closedAt,
      status: doc.status,
      playerIds: doc.playerIds,
      adminNotes: doc.adminNotes,
      votedEmails: doc.votedEmails,
      votedNames: doc.votedNames,
      voteCount: doc.voteCount,
    };
  }

  async create(data: { playerIds: string[]; adminNotes: Record<string, PlayerAttributes> }): Promise<string> {
    const db = await getDb();
    const result = await db.collection<RoundDoc>("rounds").insertOne({
      _id: new ObjectId(),
      createdAt: new Date(),
      closedAt: null,
      status: "open",
      playerIds: data.playerIds,
      adminNotes: data.adminNotes,
      votedEmails: [],
      votedNames: [],
      voteCount: 0,
    });
    return result.insertedId.toString();
  }

  async addVoter(roundId: string, email: string, name?: string): Promise<boolean> {
    const db = await getDb();
    const updateQuery: { $push: { votedEmails: string; votedNames?: string }; $inc: { voteCount: number } } = {
      $push: { votedEmails: email },
      $inc: { voteCount: 1 },
    };
    if (name) {
      updateQuery.$push.votedNames = name;
    }
    
    const result = await db.collection<RoundDoc>("rounds").updateOne(
      {
        _id: new ObjectId(roundId),
        status: "open",
        votedEmails: { $ne: email },
      },
      updateQuery
    );
    return result.matchedCount > 0;
  }

  async findAll(): Promise<Round[]> {
    const db = await getDb();
    const docs = await db.collection<RoundDoc>("rounds").find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((doc) => ({
      _id: doc._id.toString(),
      createdAt: doc.createdAt,
      closedAt: doc.closedAt,
      status: doc.status,
      playerIds: doc.playerIds,
      adminNotes: doc.adminNotes,
      votedEmails: doc.votedEmails,
      voteCount: doc.voteCount,
    }));
  }
}

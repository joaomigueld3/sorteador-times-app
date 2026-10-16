import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { IPlayerRepository } from "../../core/ports/IPlayerRepository";
import { Player, PlayerType } from "../../core/domain/Player";

interface PlayerDoc {
  _id: ObjectId;
  name: string;
  type?: PlayerType;
  googleEmail?: string | null;
}

export class MongoPlayerRepository implements IPlayerRepository {
  async findByEmail(email: string): Promise<Player | null> {
    const db = await getDb();
    const doc = await db.collection<PlayerDoc>("players").findOne({ googleEmail: email });
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      name: doc.name,
      type: doc.type ?? "mensalista",
    };
  }
}

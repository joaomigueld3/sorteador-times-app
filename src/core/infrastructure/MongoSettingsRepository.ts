import { getDb } from "@/lib/mongodb";
import { ISettingsRepository } from "../../core/ports/ISettingsRepository";
import { Settings } from "../../core/domain/Settings";

interface SettingsDoc {
  _id: string;
  weights: Settings["weights"];
}

export class MongoSettingsRepository implements ISettingsRepository {
  private readonly SETTINGS_ID = "global_settings";

  async getSettings(): Promise<Settings | null> {
    const db = await getDb();
    const doc = await db.collection<SettingsDoc>("settings").findOne({ _id: this.SETTINGS_ID });
    if (!doc) return null;
    return { weights: doc.weights };
  }

  async saveSettings(settings: Settings): Promise<void> {
    const db = await getDb();
    await db.collection<SettingsDoc>("settings").updateOne(
      { _id: this.SETTINGS_ID },
      { $set: { weights: settings.weights } },
      { upsert: true }
    );
  }
}

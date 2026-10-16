import { Settings } from "../domain/Settings";

export interface ISettingsRepository {
  getSettings(): Promise<Settings | null>;
  saveSettings(settings: Settings): Promise<void>;
}

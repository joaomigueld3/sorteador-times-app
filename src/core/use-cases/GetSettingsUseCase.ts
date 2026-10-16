import { Settings, DEFAULT_SETTINGS } from "../domain/Settings";
import { ISettingsRepository } from "../ports/ISettingsRepository";

export class GetSettingsUseCase {
  constructor(private settingsRepo: ISettingsRepository) {}

  async execute(): Promise<Settings> {
    let settings = await this.settingsRepo.getSettings();
    if (!settings) {
      settings = DEFAULT_SETTINGS;
      await this.settingsRepo.saveSettings(settings);
    }
    return settings;
  }
}

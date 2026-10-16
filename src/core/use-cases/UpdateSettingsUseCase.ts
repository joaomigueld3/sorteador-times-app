import { Settings } from "../domain/Settings";
import { ISettingsRepository } from "../ports/ISettingsRepository";

export class UpdateSettingsUseCase {
  constructor(private settingsRepo: ISettingsRepository) {}

  async execute(settings: Settings): Promise<void> {
    await this.settingsRepo.saveSettings(settings);
  }
}

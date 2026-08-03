import { sys } from 'cc';
import {
  createDefaultReleaseSave,
  decodeReleaseSave,
  languageFromLocale,
  serializeReleaseSave,
  type LevelDefinition,
  type ReleaseSaveData,
} from './shared/game/index';

const RELEASE_SAVE_KEY = 'cubic.release-save.v1';

export class ReleaseSaveRepository {
  constructor(private readonly levels: readonly LevelDefinition[]) {}

  load(): ReleaseSaveData {
    try {
      return decodeReleaseSave(
        sys.localStorage.getItem(RELEASE_SAVE_KEY),
        this.levels,
        languageFromLocale(sys.languageCode),
      );
    } catch (error) {
      console.warn('Release save could not be loaded.', error);
      return createDefaultReleaseSave(this.levels, languageFromLocale(sys.languageCode));
    }
  }

  save(data: ReleaseSaveData): void {
    try {
      sys.localStorage.setItem(RELEASE_SAVE_KEY, serializeReleaseSave(data));
    } catch (error) {
      console.warn('Release save could not be written.', error);
    }
  }

  reset(): ReleaseSaveData {
    const data = createDefaultReleaseSave(this.levels, languageFromLocale(sys.languageCode));
    this.save(data);
    return data;
  }
}

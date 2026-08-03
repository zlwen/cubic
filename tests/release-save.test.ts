import {
  createDefaultReleaseSave,
  decodeReleaseSave,
  getHighestUnlockedIndex,
  hasCompleteLocalizationCatalogs,
  languageFromLocale,
  nextGameLanguage,
  normalizeReleaseSave,
  onboardingTopics,
  pendingOnboardingTopics,
  PuzzleEngine,
  resetCampaignProgress,
  resumeSavedRun,
  serializeReleaseSave,
  translate,
  withUnlockedLevel,
} from '../src/game/index';
import type { LevelDefinition, PuzzleAction, PuzzleState, ReleaseSaveData } from '../src/game/index';
import { chapterOneLevels } from '../src/levels/index';

const check = {
  equal<T>(actual: T, expected: T, message?: string) {
    if (actual !== expected) throw new Error(message ?? `Expected ${String(expected)}, got ${String(actual)}`);
  },
  deepEqual(actual: unknown, expected: unknown, message?: string) {
    const actualJson = JSON.stringify(actual);
    const expectedJson = JSON.stringify(expected);
    if (actualJson !== expectedJson) throw new Error(message ?? `Expected ${expectedJson}, got ${actualJson}`);
  },
};

function acceptedPrefix(
  level: LevelDefinition,
  predicate: (state: PuzzleState) => boolean,
): PuzzleAction[] {
  const engine = new PuzzleEngine(level);
  const actions: PuzzleAction[] = [];
  for (const action of level.solution ?? []) {
    if (action === 'switch-cube') {
      engine.switchActiveCube();
    } else {
      const result = engine.move(action);
      if (result.status !== 'moved') break;
    }
    actions.push(action);
    if (predicate(engine.getState())) return actions;
  }
  throw new Error(`Could not find a resumable action prefix for ${level.id}.`);
}

function savedRun(level: LevelDefinition, actions: readonly PuzzleAction[]): ReleaseSaveData {
  return {
    ...createDefaultReleaseSave(chapterOneLevels),
    currentRun: { levelId: level.id, actions, elapsedSeconds: 17.5 },
  };
}

function testBasicResumeRoundTrip() {
  const level = chapterOneLevels[0];
  const actions = (level.solution ?? []).slice(0, 2);
  const original = savedRun(level, actions);
  const decoded = decodeReleaseSave(serializeReleaseSave(original), chapterOneLevels);
  const resumed = resumeSavedRun(decoded, chapterOneLevels);
  check.equal(resumed?.levelIndex, 0);
  check.deepEqual(resumed?.actions, actions);
  check.equal(resumed?.elapsedSeconds, 17.5);
  check.equal(resumed?.engine.getState().steps, 2);
}

function testBridgeAndSplitResume() {
  const bridgeLevel = chapterOneLevels.find((level) => (level.bridges?.length ?? 0) > 0);
  if (!bridgeLevel) throw new Error('Campaign must contain a bridge level.');
  const initialBridgeState = new PuzzleEngine(bridgeLevel).getState().bridgeStates;
  const bridgeActions = acceptedPrefix(bridgeLevel, (state) =>
    Object.keys(state.bridgeStates).some((id) => state.bridgeStates[id] !== initialBridgeState[id]));
  const bridgeResumed = resumeSavedRun(savedRun(bridgeLevel, bridgeActions), chapterOneLevels);
  check.deepEqual(
    bridgeResumed?.engine.getState().bridgeStates,
    (() => {
      const engine = new PuzzleEngine(bridgeLevel);
      for (const action of bridgeActions) {
        if (action === 'switch-cube') engine.switchActiveCube();
        else engine.move(action);
      }
      return engine.getState().bridgeStates;
    })(),
  );

  const splitLevel = chapterOneLevels.find((level) => (level.splits?.length ?? 0) > 0);
  if (!splitLevel) throw new Error('Campaign must contain a split level.');
  const splitActions = acceptedPrefix(splitLevel, (state) => state.split !== null);
  const splitResumed = resumeSavedRun(savedRun(splitLevel, splitActions), chapterOneLevels);
  check.equal(splitResumed?.engine.getState().split !== null, true);
}

function testMalformedAndUnsupportedSaveRecovery() {
  const unlocked = chapterOneLevels[5];
  const recovered = normalizeReleaseSave({
    version: 99,
    currentRun: { levelId: chapterOneLevels[0].id, actions: ['right'], elapsedSeconds: 8 },
    highestUnlockedLevelId: unlocked.id,
    soundEnabled: false,
    acknowledgedTutorials: ['movement', 'unknown', 'goal'],
  }, chapterOneLevels);
  check.equal(recovered.currentRun, null);
  check.equal(getHighestUnlockedIndex(recovered, chapterOneLevels), 5);
  check.equal(recovered.soundEnabled, false);
  check.deepEqual(recovered.acknowledgedTutorials, ['movement', 'goal']);

  const malformedRun = normalizeReleaseSave({
    version: 1,
    currentRun: { levelId: chapterOneLevels[0].id, actions: ['bogus'], elapsedSeconds: 8 },
    highestUnlockedLevelId: unlocked.id,
  }, chapterOneLevels);
  check.equal(malformedRun.currentRun, null);
  check.equal(getHighestUnlockedIndex(malformedRun, chapterOneLevels), 5);
  check.deepEqual(decodeReleaseSave('{broken', chapterOneLevels), createDefaultReleaseSave(chapterOneLevels));
}

function testUnlockProgressionIsMonotonic() {
  const defaults = createDefaultReleaseSave(chapterOneLevels);
  const unlocked = withUnlockedLevel(defaults, 4, chapterOneLevels);
  check.equal(getHighestUnlockedIndex(unlocked, chapterOneLevels), 4);
  check.equal(withUnlockedLevel(unlocked, 2, chapterOneLevels), unlocked);
}

function testContextualOnboardingSelection() {
  const firstTopics = pendingOnboardingTopics(chapterOneLevels[0], []);
  check.deepEqual(firstTopics.map((topic) => topic.id), ['movement', 'goal']);

  const bridgeLevel = chapterOneLevels.find((level) =>
    level.tiles.some((tile) => tile.type === 'soft-switch') && (level.bridges?.length ?? 0) > 0);
  if (!bridgeLevel) throw new Error('Campaign must contain a soft-switch bridge level.');
  check.deepEqual(
    pendingOnboardingTopics(bridgeLevel, ['movement', 'goal']).map((topic) => topic.id),
    ['soft-switch', 'bridge'],
  );

  const splitLevel = chapterOneLevels.find((level) => (level.splits?.length ?? 0) > 0);
  if (!splitLevel) throw new Error('Campaign must contain a split level.');
  check.deepEqual(
    pendingOnboardingTopics(splitLevel, onboardingTopics
      .filter((topic) => !['split', 'switch-cube', 'recombine'].includes(topic.id))
      .map((topic) => topic.id)).map((topic) => topic.id),
    ['split', 'switch-cube', 'recombine'],
  );
}

function testNewGamePreservesPreferencesAndTutorials() {
  const progressed: ReleaseSaveData = {
    ...withUnlockedLevel(createDefaultReleaseSave(chapterOneLevels), 8, chapterOneLevels),
    currentRun: { levelId: chapterOneLevels[8].id, actions: [], elapsedSeconds: 42 },
    soundEnabled: false,
    acknowledgedTutorials: ['movement', 'goal', 'fragile'],
  };
  const reset = resetCampaignProgress(progressed, chapterOneLevels);
  check.equal(reset.currentRun, null);
  check.equal(getHighestUnlockedIndex(reset, chapterOneLevels), 0);
  check.equal(reset.soundEnabled, false);
  check.equal(reset.language, progressed.language);
  check.deepEqual(reset.acknowledgedTutorials, progressed.acknowledgedTutorials);
}

function testLanguageSelectionAndCatalogs() {
  check.equal(languageFromLocale('zh-CN'), 'zh-CN');
  check.equal(languageFromLocale('zh-Hans-HK'), 'zh-CN');
  check.equal(languageFromLocale('zh_TW'), 'zh-TW');
  check.equal(languageFromLocale('zh-Hant'), 'zh-TW');
  check.equal(languageFromLocale('en-US'), 'en');
  check.equal(languageFromLocale('ja-JP'), 'en');
  check.equal(languageFromLocale(undefined), 'en');
  check.equal(nextGameLanguage('zh-CN'), 'zh-TW');
  check.equal(nextGameLanguage('zh-TW'), 'en');
  check.equal(nextGameLanguage('en'), 'zh-CN');
  check.equal(hasCompleteLocalizationCatalogs(), true);
  check.equal(translate('zh-CN', 'resumeGameStage', { stage: '08' }), '继续游戏  -  08');
  check.equal(translate('zh-TW', 'stageComplete'), '關卡完成');
  check.equal(translate('en', 'stageComplete'), 'STAGE COMPLETE');
}

function testLanguageSaveCompatibility() {
  const level = chapterOneLevels[0];
  const actions = (level.solution ?? []).slice(0, 2);
  const legacySave = normalizeReleaseSave({
    version: 1,
    currentRun: { levelId: level.id, actions, elapsedSeconds: 9 },
    highestUnlockedLevelId: chapterOneLevels[4].id,
    soundEnabled: false,
    acknowledgedTutorials: ['movement'],
  }, chapterOneLevels, 'zh-TW');
  check.equal(legacySave.language, 'zh-TW');
  check.equal(legacySave.currentRun?.levelId, level.id);
  check.equal(getHighestUnlockedIndex(legacySave, chapterOneLevels), 4);

  const selectedSave = normalizeReleaseSave({
    ...legacySave,
    language: 'zh-CN',
  }, chapterOneLevels, 'en');
  check.equal(selectedSave.language, 'zh-CN');

  const invalidLanguage = normalizeReleaseSave({
    ...legacySave,
    language: 'fr',
  }, chapterOneLevels, 'en');
  check.equal(invalidLanguage.language, 'en');
}

testBasicResumeRoundTrip();
testBridgeAndSplitResume();
testMalformedAndUnsupportedSaveRecovery();
testUnlockProgressionIsMonotonic();
testContextualOnboardingSelection();
testNewGamePreservesPreferencesAndTutorials();
testLanguageSelectionAndCatalogs();
testLanguageSaveCompatibility();

console.log('release save tests passed');

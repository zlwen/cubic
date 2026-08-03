import { PuzzleEngine } from './PuzzleEngine';
import { isGameLanguage } from './localization';
import type { GameLanguage } from './localization';
import type { LevelDefinition, PuzzleAction } from './types';

export const RELEASE_SAVE_VERSION = 1 as const;

export const tutorialTopicIds = [
  'movement',
  'goal',
  'fragile',
  'soft-switch',
  'hard-switch',
  'bridge',
  'split',
  'switch-cube',
  'recombine',
] as const;

export type TutorialTopicId = typeof tutorialTopicIds[number];

export interface SavedRun {
  readonly levelId: string;
  readonly actions: readonly PuzzleAction[];
  readonly elapsedSeconds: number;
}

export interface ReleaseSaveData {
  readonly version: typeof RELEASE_SAVE_VERSION;
  readonly currentRun: SavedRun | null;
  readonly highestUnlockedLevelId: string;
  readonly soundEnabled: boolean;
  readonly language: GameLanguage;
  readonly acknowledgedTutorials: readonly TutorialTopicId[];
}

export interface ResumedRun {
  readonly levelIndex: number;
  readonly engine: PuzzleEngine;
  readonly actions: readonly PuzzleAction[];
  readonly elapsedSeconds: number;
}

const directions = new Set<PuzzleAction>(['up', 'down', 'left', 'right', 'switch-cube']);
const tutorialTopics = new Set<string>(tutorialTopicIds);

export function createDefaultReleaseSave(
  levels: readonly LevelDefinition[],
  language: GameLanguage = 'en',
): ReleaseSaveData {
  if (levels.length === 0) throw new Error('At least one level is required for release save data.');
  return {
    version: RELEASE_SAVE_VERSION,
    currentRun: null,
    highestUnlockedLevelId: levels[0].id,
    soundEnabled: true,
    language,
    acknowledgedTutorials: [],
  };
}

export function decodeReleaseSave(
  serialized: string | null | undefined,
  levels: readonly LevelDefinition[],
  fallbackLanguage: GameLanguage = 'en',
): ReleaseSaveData {
  if (!serialized) return createDefaultReleaseSave(levels, fallbackLanguage);
  try {
    return normalizeReleaseSave(JSON.parse(serialized), levels, fallbackLanguage);
  } catch {
    return createDefaultReleaseSave(levels, fallbackLanguage);
  }
}

export function normalizeReleaseSave(
  input: unknown,
  levels: readonly LevelDefinition[],
  fallbackLanguage: GameLanguage = 'en',
): ReleaseSaveData {
  const defaults = createDefaultReleaseSave(levels, fallbackLanguage);
  if (!isRecord(input)) return defaults;

  const highestUnlockedLevelId = validLevelId(input.highestUnlockedLevelId, levels)
    ?? defaults.highestUnlockedLevelId;
  const soundEnabled = typeof input.soundEnabled === 'boolean'
    ? input.soundEnabled
    : defaults.soundEnabled;
  const language = isGameLanguage(input.language) ? input.language : defaults.language;
  const acknowledgedTutorials = Array.isArray(input.acknowledgedTutorials)
    ? [...new Set(input.acknowledgedTutorials.filter(isTutorialTopicId))]
    : defaults.acknowledgedTutorials;
  const currentRun = input.version === RELEASE_SAVE_VERSION
    ? normalizeSavedRun(input.currentRun, levels)
    : null;

  return {
    version: RELEASE_SAVE_VERSION,
    currentRun,
    highestUnlockedLevelId,
    soundEnabled,
    language,
    acknowledgedTutorials,
  };
}

export function serializeReleaseSave(save: ReleaseSaveData): string {
  return JSON.stringify(save);
}

export function resumeSavedRun(
  save: ReleaseSaveData,
  levels: readonly LevelDefinition[],
): ResumedRun | null {
  const run = save.currentRun;
  if (!run) return null;
  const levelIndex = levels.findIndex((level) => level.id === run.levelId);
  if (levelIndex < 0) return null;

  const engine = replayActions(levels[levelIndex], run.actions);
  if (!engine) return null;
  return {
    levelIndex,
    engine,
    actions: [...run.actions],
    elapsedSeconds: run.elapsedSeconds,
  };
}

export function getHighestUnlockedIndex(
  save: ReleaseSaveData,
  levels: readonly LevelDefinition[],
): number {
  const index = levels.findIndex((level) => level.id === save.highestUnlockedLevelId);
  return index < 0 ? 0 : index;
}

export function withUnlockedLevel(
  save: ReleaseSaveData,
  levelIndex: number,
  levels: readonly LevelDefinition[],
): ReleaseSaveData {
  const boundedIndex = Math.max(0, Math.min(Math.floor(levelIndex), levels.length - 1));
  const currentHighest = getHighestUnlockedIndex(save, levels);
  if (boundedIndex <= currentHighest) return save;
  return {
    ...save,
    highestUnlockedLevelId: levels[boundedIndex].id,
  };
}

export function resetCampaignProgress(
  save: ReleaseSaveData,
  levels: readonly LevelDefinition[],
): ReleaseSaveData {
  if (levels.length === 0) throw new Error('At least one level is required to reset campaign progress.');
  return {
    ...save,
    currentRun: null,
    highestUnlockedLevelId: levels[0].id,
  };
}

function normalizeSavedRun(input: unknown, levels: readonly LevelDefinition[]): SavedRun | null {
  if (!isRecord(input)) return null;
  const levelId = validLevelId(input.levelId, levels);
  if (!levelId || !Array.isArray(input.actions)) return null;
  const actions = input.actions.filter(isPuzzleAction);
  if (actions.length !== input.actions.length) return null;
  const elapsedSeconds = typeof input.elapsedSeconds === 'number'
    && Number.isFinite(input.elapsedSeconds)
    && input.elapsedSeconds >= 0
    ? input.elapsedSeconds
    : 0;
  const level = levels.find((candidate) => candidate.id === levelId);
  if (!level || !replayActions(level, actions)) return null;
  return { levelId, actions, elapsedSeconds };
}

function replayActions(
  level: LevelDefinition,
  actions: readonly PuzzleAction[],
): PuzzleEngine | null {
  const engine = new PuzzleEngine(level);
  for (const action of actions) {
    if (action === 'switch-cube') {
      if (!engine.getState().split) return null;
      engine.switchActiveCube();
      continue;
    }
    const result = engine.move(action);
    if (result.status !== 'moved') return null;
  }
  const state = engine.getState();
  return state.failed || state.completed ? null : engine;
}

function validLevelId(input: unknown, levels: readonly LevelDefinition[]): string | null {
  if (typeof input !== 'string') return null;
  return levels.some((level) => level.id === input) ? input : null;
}

function isPuzzleAction(value: unknown): value is PuzzleAction {
  return typeof value === 'string' && directions.has(value as PuzzleAction);
}

function isTutorialTopicId(value: unknown): value is TutorialTopicId {
  return typeof value === 'string' && tutorialTopics.has(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

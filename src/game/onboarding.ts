import type { LevelDefinition } from './types';
import type { TutorialTopicId } from './releaseSave';

export interface OnboardingTopic {
  readonly id: TutorialTopicId;
  readonly title: string;
  readonly symbol: string;
  readonly body: string;
}

export const onboardingTopics: readonly OnboardingTopic[] = [
  {
    id: 'movement',
    title: 'ROLL THE BLOCK',
    symbol: '  UP\nLEFT  RIGHT\n DOWN',
    body: 'Swipe up, down, left, or right. Each swipe rolls the block one step in that screen direction.',
  },
  {
    id: 'goal',
    title: 'ENTER THE GOAL',
    symbol: 'UPRIGHT\n  +\n HOLE',
    body: 'Finish the stage by standing the whole block upright over the dark hole so it can drop inside.',
  },
  {
    id: 'fragile',
    title: 'FRAGILE TILE',
    symbol: 'GLASS\n  X',
    body: 'You may cross this translucent tile while lying down. Standing upright on it will break it.',
  },
  {
    id: 'soft-switch',
    title: 'SOFT SWITCH',
    symbol: 'ROUND\nPRESS',
    body: 'Any part of the whole block or either split cube can press it. Each press toggles its bridge between visible and hidden.',
  },
  {
    id: 'hard-switch',
    title: 'HARD SWITCH',
    symbol: 'STAND\n  X',
    body: 'An X-marked hard switch responds only when the unsplit whole block stands upright on it.',
  },
  {
    id: 'bridge',
    title: 'CONTROLLED BRIDGE',
    symbol: 'ON  /  OFF',
    body: 'Switches can enable, disable, or toggle connected bridge spans. Check the route after every press.',
  },
  {
    id: 'split',
    title: 'SPLIT TILE',
    symbol: 'ONE\n2\nTWO',
    body: 'Stand upright on the four-mark tile to divide the block into two independently positioned cubes.',
  },
  {
    id: 'switch-cube',
    title: 'SWITCH ACTIVE CUBE',
    symbol: 'A  /  B',
    body: 'Only the highlighted cube moves. Use Switch Block at the upper left to select the other cube.',
  },
  {
    id: 'recombine',
    title: 'RECOMBINE',
    symbol: 'A + B\nBLOCK',
    body: 'Move the two cubes onto orthogonally adjacent tiles. They will automatically reform the whole block.',
  },
];

export function onboardingTopicsForLevel(level: LevelDefinition): OnboardingTopic[] {
  const included = new Set<TutorialTopicId>(['movement', 'goal']);
  const tileTypes = new Set(level.tiles.map((tile) => tile.type));
  if (tileTypes.has('fragile')) included.add('fragile');
  if (tileTypes.has('soft-switch')) included.add('soft-switch');
  if (tileTypes.has('hard-switch')) included.add('hard-switch');
  if ((level.bridges?.length ?? 0) > 0) included.add('bridge');
  if ((level.splits?.length ?? 0) > 0 || tileTypes.has('split')) {
    included.add('split');
    included.add('switch-cube');
    included.add('recombine');
  }
  return onboardingTopics.filter((topic) => included.has(topic.id));
}

export function pendingOnboardingTopics(
  level: LevelDefinition,
  acknowledged: readonly TutorialTopicId[],
): OnboardingTopic[] {
  const acknowledgedSet = new Set<TutorialTopicId>(acknowledged);
  return onboardingTopicsForLevel(level).filter((topic) => !acknowledgedSet.has(topic.id));
}

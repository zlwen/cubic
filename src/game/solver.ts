import { PuzzleEngine } from './PuzzleEngine';
import type { LevelDefinition, PuzzleAction, PuzzleState } from './types';

export interface SolverResult {
  readonly solution: readonly PuzzleAction[] | null;
  readonly visitedStates: number;
  readonly exhausted: boolean;
}

const directions: readonly PuzzleAction[] = ['up', 'down', 'left', 'right'];

export function findSolution(level: LevelDefinition, maxVisited = 20_000): SolverResult {
  const initial = new PuzzleEngine(level).getState();
  const queue: PuzzleAction[][] = [[]];
  const seen = new Set<string>([stateKey(initial)]);
  let queueIndex = 0;

  while (queueIndex < queue.length && seen.size < maxVisited) {
    const path = queue[queueIndex];
    queueIndex += 1;
    const engine = replay(level, path);
    const actions = engine.getState().split ? [...directions, 'switch-cube' as const] : directions;

    for (const action of actions) {
      const candidate = new PuzzleEngine(level);
      replayInto(candidate, path);
      if (action === 'switch-cube') candidate.switchActiveCube();
      else candidate.move(action);

      const state = candidate.getState();
      if (state.failed) continue;
      const nextPath = [...path, action];
      if (state.completed) {
        return { solution: nextPath, visitedStates: seen.size, exhausted: false };
      }
      const key = stateKey(state);
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push(nextPath);
      if (seen.size >= maxVisited) break;
    }
  }

  return {
    solution: null,
    visitedStates: seen.size,
    exhausted: queueIndex >= queue.length,
  };
}

function replay(level: LevelDefinition, path: readonly PuzzleAction[]): PuzzleEngine {
  const engine = new PuzzleEngine(level);
  replayInto(engine, path);
  return engine;
}

function replayInto(engine: PuzzleEngine, path: readonly PuzzleAction[]): void {
  for (const action of path) {
    if (action === 'switch-cube') engine.switchActiveCube();
    else engine.move(action);
  }
}

function stateKey(state: PuzzleState): string {
  const block = `${state.block.anchor.x},${state.block.anchor.z},${state.block.orientation}`;
  const split = state.split
    ? `${state.split.cubes[0].x},${state.split.cubes[0].z};${state.split.cubes[1].x},${state.split.cubes[1].z};${state.split.activeCube}`
    : '-';
  const bridges = Object.keys(state.bridgeStates)
    .sort()
    .map((id) => `${id}:${state.bridgeStates[id] ? 1 : 0}`)
    .join(';');
  return `${block}|${split}|${bridges}`;
}

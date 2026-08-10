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
  const queues: Array<Array<{ path: PuzzleAction[]; state: PuzzleState }>> = [
    [{ path: [], state: initial }],
  ];
  const bestMoveCounts = new Map<string, number>([[stateKey(initial), 0]]);
  let visitedStates = 1;
  let exhausted = true;

  for (let moveCount = 0; moveCount < queues.length && visitedStates < maxVisited; moveCount += 1) {
    const queue = queues[moveCount] ?? [];
    for (let queueIndex = 0; queueIndex < queue.length && visitedStates < maxVisited; queueIndex += 1) {
      const { path, state: current } = queue[queueIndex];
      const actions = current.split ? [...directions, 'switch-cube' as const] : directions;

      for (const action of actions) {
        const candidate = new PuzzleEngine(level);
        replayInto(candidate, path);
        if (action === 'switch-cube') candidate.switchActiveCube();
        else candidate.move(action);

        const state = candidate.getState();
        if (state.failed) continue;
        const nextPath = [...path, action];
        if (state.completed) {
          return { solution: nextPath, visitedStates, exhausted: false };
        }
        const nextMoveCount = moveCount + (action === 'switch-cube' ? 0 : 1);
        const key = stateKey(state);
        if ((bestMoveCounts.get(key) ?? Number.POSITIVE_INFINITY) <= nextMoveCount) continue;
        bestMoveCounts.set(key, nextMoveCount);
        visitedStates += 1;
        if (!queues[nextMoveCount]) queues[nextMoveCount] = [];
        queues[nextMoveCount].push({ path: nextPath, state });
        if (visitedStates >= maxVisited) {
          exhausted = false;
          break;
        }
      }
    }
  }

  return {
    solution: null,
    visitedStates,
    exhausted,
  };
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

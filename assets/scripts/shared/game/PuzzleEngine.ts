import { coordKey, occupiedCells, sameCoord } from './coords';
import { assertValidLevel, LevelMap } from './level';
import { rollBlock } from './movement';
import type {
  BlockState,
  Direction,
  GridCoord,
  LevelDefinition,
  MoveResult,
  PuzzleState,
  SplitBlockState,
} from './types';

export class PuzzleEngine {
  private readonly levelMap: LevelMap;
  private history: PuzzleState[] = [];
  private state: PuzzleState;

  constructor(readonly level: LevelDefinition) {
    assertValidLevel(level);
    this.levelMap = new LevelMap(level);
    this.state = this.initialState();
  }

  getState(): PuzzleState {
    return this.cloneState(this.state);
  }

  getOccupiedCells(): GridCoord[] {
    if (this.state.split) {
      return this.state.split.cubes.map((cube) => ({ ...cube }));
    }
    return occupiedCells(this.state.block);
  }

  move(direction: Direction): MoveResult {
    const previous = this.getState();
    if (this.state.failed || this.state.completed) {
      return this.invalidResult(previous, direction, 'Level is already resolved.');
    }
    return this.state.split
      ? this.moveSplit(previous, direction, this.state.split)
      : this.moveWhole(previous, direction);
  }

  switchActiveCube(): PuzzleState {
    if (!this.state.split || this.state.failed || this.state.completed) {
      return this.getState();
    }
    const previous = this.getState();
    this.history.push(previous);
    this.state = {
      ...this.state,
      split: {
        cubes: this.cloneCubes(this.state.split.cubes),
        activeCube: this.state.split.activeCube === 0 ? 1 : 0,
      },
    };
    return this.getState();
  }

  undo(): PuzzleState {
    const previous = this.history.pop();
    if (previous) this.state = previous;
    return this.getState();
  }

  restart(): PuzzleState {
    this.history = [];
    this.state = this.initialState();
    return this.getState();
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  private moveWhole(previous: PuzzleState, direction: Direction): MoveResult {
    const nextBlock = rollBlock(this.state.block, direction);
    const nextCells = occupiedCells(nextBlock);
    if (nextBlock.orientation === 'standing' && sameCoord(nextBlock.anchor, this.level.goal)) {
      return this.commit(previous, direction, {
        ...this.state,
        block: nextBlock,
        split: null,
        steps: this.state.steps + 1,
        completed: true,
      }, 'completed', nextCells, 'The block dropped into the goal hole.');
    }

    if (!this.levelMap.supports(nextCells, this.state.bridgeStates)) {
      return this.commitFailure(previous, direction, {
        ...this.state,
        block: nextBlock,
        split: null,
        steps: this.state.steps + 1,
      }, nextCells, 'The block fell from the board.');
    }

    if (nextBlock.orientation === 'standing'
      && this.levelMap.tileAt(nextBlock.anchor)?.type === 'fragile') {
      return this.commitFailure(previous, direction, {
        ...this.state,
        block: nextBlock,
        split: null,
        steps: this.state.steps + 1,
      }, nextCells, 'The standing block broke a fragile tile.');
    }

    let bridgeStates = this.applyWholeSwitches(nextBlock, this.state.bridgeStates);
    const splitDefinition = nextBlock.orientation === 'standing'
      ? this.levelMap.splitAt(nextBlock.anchor)
      : undefined;
    const split = splitDefinition
      ? {
          cubes: this.cloneCubes(splitDefinition.destinations),
          activeCube: 0 as const,
        }
      : null;
    if (split && !this.levelMap.supports(split.cubes, bridgeStates)) {
      return this.commitFailure(previous, direction, {
        ...this.state,
        block: nextBlock,
        split,
        bridgeStates,
        steps: this.state.steps + 1,
      }, split.cubes, 'A split cube destination is unsupported.');
    }
    return this.commit(previous, direction, {
      ...this.state,
      block: nextBlock,
      split,
      bridgeStates,
      steps: this.state.steps + 1,
    }, 'moved', split?.cubes ?? nextCells);
  }

  private moveSplit(
    previous: PuzzleState,
    direction: Direction,
    split: SplitBlockState,
  ): MoveResult {
    const active = split.activeCube;
    const cubes = this.cloneCubes(split.cubes);
    cubes[active] = this.moveCube(cubes[active], direction);
    if (!this.levelMap.supports([cubes[active]], this.state.bridgeStates)) {
      return this.commitFailure(previous, direction, {
        ...this.state,
        split: { cubes, activeCube: active },
        steps: this.state.steps + 1,
      }, cubes, 'The active split cube fell from the board.');
    }

    const bridgeStates = this.applySoftSwitch(cubes[active], this.state.bridgeStates);
    const recombined = this.recombinedBlock(cubes);
    return this.commit(previous, direction, {
      ...this.state,
      block: recombined ?? this.state.block,
      split: recombined ? null : { cubes, activeCube: active },
      bridgeStates,
      steps: this.state.steps + 1,
    }, 'moved', recombined ? occupiedCells(recombined) : cubes);
  }

  private applyWholeSwitches(
    block: BlockState,
    current: PuzzleState['bridgeStates'],
  ): PuzzleState['bridgeStates'] {
    let result = { ...current };
    const applied = new Set<string>();
    for (const cell of occupiedCells(block)) {
      const tile = this.levelMap.tileAt(cell);
      const qualifies = tile?.type === 'soft-switch'
        || (tile?.type === 'hard-switch' && block.orientation === 'standing');
      if (!qualifies || applied.has(coordKey(cell))) continue;
      result = this.applySwitch(cell, result);
      applied.add(coordKey(cell));
    }
    return result;
  }

  private applySoftSwitch(
    cell: GridCoord,
    current: PuzzleState['bridgeStates'],
  ): PuzzleState['bridgeStates'] {
    return this.levelMap.tileAt(cell)?.type === 'soft-switch'
      ? this.applySwitch(cell, current)
      : { ...current };
  }

  private applySwitch(
    cell: GridCoord,
    current: PuzzleState['bridgeStates'],
  ): PuzzleState['bridgeStates'] {
    const next = { ...current };
    for (const action of this.levelMap.switchAt(cell)?.actions ?? []) {
      if (action.mode === 'enable') next[action.bridgeId] = true;
      else if (action.mode === 'disable') next[action.bridgeId] = false;
      else next[action.bridgeId] = !next[action.bridgeId];
    }
    return next;
  }

  private recombinedBlock(cubes: readonly [GridCoord, GridCoord]): BlockState | null {
    const [first, second] = cubes;
    if (first.z === second.z && Math.abs(first.x - second.x) === 1) {
      return {
        anchor: { x: Math.min(first.x, second.x), z: first.z },
        orientation: 'lying-x',
      };
    }
    if (first.x === second.x && Math.abs(first.z - second.z) === 1) {
      return {
        anchor: { x: first.x, z: Math.min(first.z, second.z) },
        orientation: 'lying-z',
      };
    }
    return null;
  }

  private moveCube(cube: GridCoord, direction: Direction): GridCoord {
    if (direction === 'left') return { x: cube.x - 1, z: cube.z };
    if (direction === 'right') return { x: cube.x + 1, z: cube.z };
    if (direction === 'up') return { x: cube.x, z: cube.z - 1 };
    return { x: cube.x, z: cube.z + 1 };
  }

  private commitFailure(
    previous: PuzzleState,
    direction: Direction,
    candidate: PuzzleState,
    cells: readonly GridCoord[],
    message: string,
  ): MoveResult {
    return this.commit(previous, direction, {
      ...candidate,
      failed: true,
      completed: false,
    }, 'fallen', cells, message);
  }

  private commit(
    previous: PuzzleState,
    direction: Direction,
    candidate: PuzzleState,
    status: MoveResult['status'],
    cells: readonly GridCoord[],
    message?: string,
  ): MoveResult {
    this.history.push(previous);
    this.state = this.cloneState(candidate);
    return {
      status,
      direction,
      previous,
      current: this.getState(),
      occupiedCells: cells.map((cell) => ({ ...cell })),
      message,
    };
  }

  private invalidResult(previous: PuzzleState, direction: Direction, message: string): MoveResult {
    return {
      status: 'invalid',
      direction,
      previous,
      current: this.getState(),
      occupiedCells: this.getOccupiedCells(),
      message,
    };
  }

  private initialState(): PuzzleState {
    const bridgeStates: Record<string, boolean> = {};
    for (const bridge of this.level.bridges ?? []) {
      bridgeStates[bridge.id] = bridge.initiallyActive;
    }
    return {
      levelId: this.level.id,
      block: {
        anchor: { ...this.level.start.anchor },
        orientation: this.level.start.orientation,
      },
      split: null,
      bridgeStates,
      steps: 0,
      failed: false,
      completed: false,
    };
  }

  private cloneState(state: PuzzleState): PuzzleState {
    return {
      ...state,
      block: {
        anchor: { ...state.block.anchor },
        orientation: state.block.orientation,
      },
      split: state.split
        ? {
            cubes: this.cloneCubes(state.split.cubes),
            activeCube: state.split.activeCube,
          }
        : null,
      bridgeStates: { ...state.bridgeStates },
    };
  }

  private cloneCubes(cubes: readonly [GridCoord, GridCoord]): [GridCoord, GridCoord] {
    return [{ ...cubes[0] }, { ...cubes[1] }];
  }
}

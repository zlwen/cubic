export type Orientation = 'standing' | 'lying-x' | 'lying-z';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type PuzzleAction = Direction | 'switch-cube';

export type TileType = 'normal' | 'fragile' | 'soft-switch' | 'hard-switch' | 'split';

export type BridgeActionMode = 'enable' | 'disable' | 'toggle';

export interface GridCoord {
  readonly x: number;
  readonly z: number;
}

export interface TileDefinition {
  readonly x: number;
  readonly z: number;
  readonly type: TileType;
}

export interface BlockState {
  readonly anchor: GridCoord;
  readonly orientation: Orientation;
}

export interface BridgeDefinition {
  readonly id: string;
  readonly cells: readonly GridCoord[];
  readonly initiallyActive: boolean;
}

export interface BridgeAction {
  readonly bridgeId: string;
  readonly mode: BridgeActionMode;
}

export interface SwitchDefinition extends GridCoord {
  readonly actions: readonly BridgeAction[];
}

export interface SplitDefinition extends GridCoord {
  readonly destinations: readonly [GridCoord, GridCoord];
}

export interface SplitBlockState {
  readonly cubes: readonly [GridCoord, GridCoord];
  readonly activeCube: 0 | 1;
}

export interface LevelDefinition {
  readonly id: string;
  readonly title: string;
  readonly passcode: string;
  readonly author: string;
  readonly original: true;
  readonly tiles: readonly TileDefinition[];
  readonly bridges?: readonly BridgeDefinition[];
  readonly switches?: readonly SwitchDefinition[];
  readonly splits?: readonly SplitDefinition[];
  readonly start: BlockState;
  readonly goal: GridCoord;
  readonly solution?: readonly PuzzleAction[];
  readonly par?: number;
}

export type MoveStatus = 'moved' | 'invalid' | 'fallen' | 'completed';

export interface MoveResult {
  readonly status: MoveStatus;
  readonly direction: Direction;
  readonly previous: PuzzleState;
  readonly current: PuzzleState;
  readonly occupiedCells: readonly GridCoord[];
  readonly supportedCells?: readonly GridCoord[];
  readonly message?: string;
}

export interface PuzzleState {
  readonly levelId: string;
  readonly block: BlockState;
  readonly split: SplitBlockState | null;
  readonly bridgeStates: Readonly<Record<string, boolean>>;
  readonly steps: number;
  readonly failed: boolean;
  readonly completed: boolean;
}

export interface LevelValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

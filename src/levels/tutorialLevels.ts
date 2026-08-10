import { occupiedCells, rollBlock } from '../game/index';
import type {
  BlockState,
  BridgeActionMode,
  BridgeDefinition,
  Direction,
  GridCoord,
  LevelDefinition,
  PuzzleAction,
  SplitDefinition,
  SwitchDefinition,
  TileDefinition,
  TileType,
} from '../game/index';

const author = 'Cubic Team';

interface TraceFrame {
  readonly cells: readonly GridCoord[];
  readonly whole: BlockState | null;
  readonly landed: boolean;
}

interface MechanicPlan {
  readonly fragileCount?: number;
  readonly gates?: ReadonlyArray<{
    readonly type: 'soft-switch' | 'hard-switch';
    readonly mode?: BridgeActionMode;
    readonly bridgeCellCount?: number;
    readonly switchFrame?: number;
    readonly switchCellIndex?: 0 | 1;
    readonly bridgePlacements?: ReadonlyArray<{
      readonly frame: number;
      readonly cellIndex?: 0 | 1;
    }>;
  }>;
}

interface LevelMeta {
  readonly id: string;
  readonly title: string;
  readonly passcode: string;
}

interface SplitPlan {
  readonly destinations: readonly [GridCoord, GridCoord];
  readonly actions: readonly PuzzleAction[];
}

function key(coord: GridCoord): string {
  return `${coord.x},${coord.z}`;
}

function cloneCoord(coord: GridCoord): GridCoord {
  return { x: coord.x, z: coord.z };
}

function goalRing(goal: GridCoord): GridCoord[] {
  const result: GridCoord[] = [];
  for (let z = -1; z <= 1; z += 1) {
    for (let x = -1; x <= 1; x += 1) {
      if (x !== 0 || z !== 0) result.push({ x: goal.x + x, z: goal.z + z });
    }
  }
  return result;
}

function wholeTrace(solution: readonly Direction[]): TraceFrame[] {
  let block: BlockState = { anchor: { x: 0, z: 0 }, orientation: 'standing' };
  const frames: TraceFrame[] = [{ cells: occupiedCells(block), whole: block, landed: false }];
  for (const direction of solution) {
    block = rollBlock(block, direction);
    frames.push({ cells: occupiedCells(block), whole: block, landed: true });
  }
  return frames;
}

function splitTrace(
  prefix: readonly Direction[],
  split: SplitPlan,
  suffix: readonly Direction[],
): { frames: TraceFrame[]; solution: PuzzleAction[]; splitDefinition: SplitDefinition } {
  let block: BlockState = { anchor: { x: 0, z: 0 }, orientation: 'standing' };
  const frames: TraceFrame[] = [{ cells: occupiedCells(block), whole: block, landed: false }];
  for (let index = 0; index < prefix.length; index += 1) {
    block = rollBlock(block, prefix[index]);
    if (index + 1 < prefix.length) {
      frames.push({ cells: occupiedCells(block), whole: block, landed: true });
    }
  }
  if (block.orientation !== 'standing') throw new Error('Split prefix must end standing.');
  const splitDefinition: SplitDefinition = {
    ...block.anchor,
    destinations: [cloneCoord(split.destinations[0]), cloneCoord(split.destinations[1])],
  };
  const cubes: [GridCoord, GridCoord] = [cloneCoord(split.destinations[0]), cloneCoord(split.destinations[1])];
  let active: 0 | 1 = 0;
  frames.push({ cells: cubes.map(cloneCoord), whole: null, landed: true });
  for (const action of split.actions) {
    if (action === 'switch-cube') {
      active = active === 0 ? 1 : 0;
      frames.push({ cells: cubes.map(cloneCoord), whole: null, landed: false });
      continue;
    }
    const current = cubes[active];
    cubes[active] = action === 'left'
      ? { x: current.x - 1, z: current.z }
      : action === 'right'
        ? { x: current.x + 1, z: current.z }
        : action === 'up'
          ? { x: current.x, z: current.z - 1 }
          : { x: current.x, z: current.z + 1 };
    const [first, second] = cubes;
    if (first.z === second.z && Math.abs(first.x - second.x) === 1) {
      block = { anchor: { x: Math.min(first.x, second.x), z: first.z }, orientation: 'lying-x' };
      frames.push({ cells: occupiedCells(block), whole: block, landed: true });
    } else if (first.x === second.x && Math.abs(first.z - second.z) === 1) {
      block = { anchor: { x: first.x, z: Math.min(first.z, second.z) }, orientation: 'lying-z' };
      frames.push({ cells: occupiedCells(block), whole: block, landed: true });
    } else {
      frames.push({ cells: cubes.map(cloneCoord), whole: null, landed: true });
    }
  }
  if (!frames[frames.length - 1].whole) throw new Error('Split actions must recombine the cubes.');
  for (const direction of suffix) {
    block = rollBlock(block, direction);
    frames.push({ cells: occupiedCells(block), whole: block, landed: true });
  }
  return {
    frames,
    solution: [...prefix, ...split.actions, ...suffix],
    splitDefinition,
  };
}

function buildLevel(
  meta: LevelMeta,
  frames: readonly TraceFrame[],
  solution: readonly PuzzleAction[],
  mechanics: MechanicPlan = {},
  splitDefinition?: SplitDefinition,
): LevelDefinition {
  const final = frames[frames.length - 1].whole;
  if (!final || final.orientation !== 'standing') throw new Error(`${meta.id} must finish standing.`);
  const goal = cloneCoord(final.anchor);
  const tileTypes = new Map<string, TileType>();
  for (const frame of frames.slice(0, -1)) {
    for (const cell of frame.cells) tileTypes.set(key(cell), 'normal');
  }
  for (const cell of goalRing(goal)) tileTypes.set(key(cell), 'normal');
  tileTypes.delete(key(goal));
  if (splitDefinition) tileTypes.set(key(splitDefinition), 'split');

  const firstSeen = new Map<string, number>();
  const standingCells = new Set<string>();
  frames.forEach((frame, index) => {
    for (const cell of frame.cells) {
      if (!firstSeen.has(key(cell))) firstSeen.set(key(cell), index);
    }
    if (frame.whole?.orientation === 'standing') standingCells.add(key(frame.whole.anchor));
  });

  const bridges: BridgeDefinition[] = [];
  const switches: SwitchDefinition[] = [];
  const reserved = new Set<string>(splitDefinition ? [key(splitDefinition)] : []);
  const gates = mechanics.gates ?? [];
  for (const gate of gates) {
    if (gate.switchFrame === undefined) continue;
    const frame = frames[gate.switchFrame];
    const cell = gate.switchCellIndex === undefined
      ? frame.whole?.orientation === 'standing' ? frame.whole.anchor : frame.cells[0]
      : frame.cells[gate.switchCellIndex];
    reserved.add(key(cell));
  }
  for (let gateIndex = 0; gateIndex < gates.length; gateIndex += 1) {
    const gate = gates[gateIndex];
    const usableEnd = Math.max(3, frames.length - 2);
    const switchTarget = Math.max(1, Math.floor(((gateIndex + 1) * usableEnd) / (gates.length + 2)));
    const bridgeTarget = Math.max(switchTarget + 1, Math.floor(((gateIndex + 2) * usableEnd) / (gates.length + 2)));
    const switchFrameIndex = gate.switchFrame ?? findSwitchFrame(
      frames,
      gate.type,
      switchTarget,
      frames.length - 1,
      reserved,
      tileTypes,
    );
    const switchFrame = frames[switchFrameIndex];
    const switchCell = gate.switchCellIndex === undefined
      ? switchFrame.whole?.orientation === 'standing'
        ? switchFrame.whole.anchor
        : switchFrame.cells.find((cell) => !reserved.has(key(cell)))!
      : switchFrame.cells[gate.switchCellIndex];
    const switchKey = key(switchCell);
    reserved.add(switchKey);
    tileTypes.set(switchKey, gate.type);

    const bridgeId = `gate-${gateIndex + 1}`;
    const bridgeCells: GridCoord[] = [];
    const bridgeCellCount = gate.bridgePlacements?.length ?? gate.bridgeCellCount ?? 1;
    for (let cellIndex = 0; cellIndex < bridgeCellCount; cellIndex += 1) {
      const placement = gate.bridgePlacements?.[cellIndex];
      const bridgeCell = placement
        ? frames[placement.frame].cells[placement.cellIndex ?? 0]
        : findBridgeCell(
            frames,
            bridgeTarget + cellIndex,
            switchFrameIndex,
            firstSeen,
            reserved,
            goal,
          );
      reserved.add(key(bridgeCell));
      tileTypes.delete(key(bridgeCell));
      bridgeCells.push(cloneCoord(bridgeCell));
    }
    bridges.push({ id: bridgeId, cells: bridgeCells, initiallyActive: false });
    switches.push({
      ...cloneCoord(switchCell),
      actions: [{
        bridgeId,
        mode: gate.mode ?? (gate.type === 'soft-switch' ? 'toggle' : 'enable'),
      }],
    });
  }

  let fragileRemaining = mechanics.fragileCount ?? 0;
  const fragileFrames = frames
    .slice(1, -1)
    .filter((frame) => frame.landed && frame.whole?.orientation !== 'standing')
    .sort((first, second) => Number(first.whole !== null) - Number(second.whole !== null));
  for (const frame of fragileFrames) {
    if (fragileRemaining === 0) break;
    if (!frame.landed || frame.whole?.orientation === 'standing') continue;
    for (const cell of frame.cells) {
      const cellKey = key(cell);
      if (fragileRemaining === 0) break;
      if (
        reserved.has(cellKey)
        || standingCells.has(cellKey)
        || tileTypes.get(cellKey) !== 'normal'
      ) continue;
      tileTypes.set(cellKey, 'fragile');
      reserved.add(cellKey);
      fragileRemaining -= 1;
    }
  }
  if (fragileRemaining > 0) throw new Error(`${meta.id} lacks safe fragile placements.`);

  const tiles: TileDefinition[] = [...tileTypes.entries()].map(([coord, type]) => {
    const [x, z] = coord.split(',').map(Number);
    return { x, z, type };
  });
  return {
    ...meta,
    author,
    original: true,
    start: { anchor: { x: 0, z: 0 }, orientation: 'standing' },
    goal,
    tiles,
    bridges: bridges.length > 0 ? bridges : undefined,
    switches: switches.length > 0 ? switches : undefined,
    splits: splitDefinition ? [splitDefinition] : undefined,
    solution,
    par: solution.filter((action) => action !== 'switch-cube').length,
  };
}

function withSolution(
  level: LevelDefinition,
  solution: readonly PuzzleAction[],
): LevelDefinition {
  return {
    ...level,
    solution,
    par: solution.filter((action) => action !== 'switch-cube').length,
  };
}

function findSwitchFrame(
  frames: readonly TraceFrame[],
  type: 'soft-switch' | 'hard-switch',
  target: number,
  before: number,
  reserved: ReadonlySet<string>,
  tileTypes: ReadonlyMap<string, TileType>,
): number {
  const candidates: number[] = [];
  for (let index = 1; index < Math.min(before, frames.length - 1); index += 1) {
    const frame = frames[index];
    if (!frame.landed) continue;
    if (!frame.whole) continue;
    if (type === 'hard-switch' && frame.whole?.orientation !== 'standing') continue;
    if (!frame.cells.some((cell) => !reserved.has(key(cell)) && tileTypes.has(key(cell)))) continue;
    candidates.push(index);
  }
  if (candidates.length === 0) throw new Error(`No ${type} placement before frame ${before}.`);
  return candidates.reduce((best, value) =>
    Math.abs(value - target) < Math.abs(best - target) ? value : best);
}

function findBridgeCell(
  frames: readonly TraceFrame[],
  target: number,
  after: number,
  firstSeen: ReadonlyMap<string, number>,
  reserved: ReadonlySet<string>,
  goal: GridCoord,
): GridCoord {
  for (let index = Math.max(after + 1, target); index < frames.length - 1; index += 1) {
    const cell = frames[index].cells.find((candidate) =>
      firstSeen.get(key(candidate))! > after
      && !reserved.has(key(candidate))
      && key(candidate) !== key(goal));
    if (cell) return cell;
  }
  for (let index = after + 1; index < frames.length - 1; index += 1) {
    const cell = frames[index].cells.find((candidate) =>
      firstSeen.get(key(candidate))! > after
      && !reserved.has(key(candidate))
      && key(candidate) !== key(goal));
    if (cell) return cell;
  }
  throw new Error(`No bridge placement after frame ${after}.`);
}

const wholeBlueprints: ReadonlyArray<{
  meta: LevelMeta;
  route: readonly Direction[];
  mechanics?: MechanicPlan;
}> = [
  { meta: { id: 'south-step', title: 'South Step', passcode: 'RIFT' }, route: ['left', 'left'] },
  { meta: { id: 'first-roll', title: 'First Roll', passcode: 'CUBE' }, route: ['up', 'right', 'right', 'up'] },
  { meta: { id: 'quiet-corner', title: 'Quiet Corner', passcode: 'VEIL' }, route: ['left', 'up', 'left', 'up', 'left', 'down'] },
  { meta: { id: 'narrow-return', title: 'Narrow Return', passcode: 'TILT' }, route: ['up', 'left', 'down', 'down', 'left', 'up'] },
  { meta: { id: 'gate-primer', title: 'Gate Primer', passcode: 'GATE' }, route: ['left', 'down', 'down', 'left', 'left', 'up', 'up', 'left'], mechanics: { gates: [{ type: 'soft-switch' }] } },
  { meta: { id: 'copper-relay', title: 'Copper Relay', passcode: 'RLAY' }, route: ['left', 'down', 'down', 'left', 'down', 'right', 'right', 'down'], mechanics: { gates: [{ type: 'hard-switch' }] } },
  { meta: { id: 'twin-causeway', title: 'Twin Causeway', passcode: 'TWAY' }, route: ['right', 'up', 'right', 'up', 'up', 'up', 'right', 'up'], mechanics: { gates: [{ type: 'soft-switch' }] } },
  { meta: { id: 'brittle-turn', title: 'Brittle Turn', passcode: 'BRIT' }, route: ['right', 'down', 'right', 'down', 'left', 'down', 'right', 'right'], mechanics: { fragileCount: 1 } },
  { meta: { id: 'thin-margin', title: 'Thin Margin', passcode: 'MRGN' }, route: ['up', 'right', 'down', 'left', 'down', 'left', 'left', 'down', 'down', 'right'], mechanics: { fragileCount: 2 } },
  { meta: { id: 'ember-plate', title: 'Ember Plate', passcode: 'EMPL' }, route: ['down', 'right', 'down', 'down', 'right', 'right', 'up', 'right', 'down', 'left', 'left', 'left'], mechanics: { fragileCount: 2, gates: [{ type: 'soft-switch' }] } },
  { meta: { id: 'toggle-run', title: 'Toggle Run', passcode: 'TGLR' }, route: ['right', 'right', 'up', 'left', 'down', 'right', 'down', 'right', 'down', 'down', 'left', 'left', 'left', 'left'], mechanics: { gates: [{ type: 'soft-switch', mode: 'toggle' }, { type: 'hard-switch' }] } },
  { meta: { id: 'locked-arc', title: 'Locked Arc', passcode: 'LARC' }, route: ['left', 'left', 'up', 'right', 'down', 'left', 'down', 'left', 'down', 'down', 'left', 'left'], mechanics: { gates: [{ type: 'hard-switch' }, { type: 'soft-switch' }] } },
  { meta: { id: 'hollow-route', title: 'Hollow Route', passcode: 'HLLO' }, route: ['left', 'left', 'left', 'down', 'left', 'down', 'down', 'down', 'down', 'left', 'up', 'up', 'right', 'right', 'right'], mechanics: { fragileCount: 3, gates: [{ type: 'soft-switch' }] } },
  { meta: { id: 'counterweight', title: 'Counterweight', passcode: 'CWGT' }, route: ['up', 'left', 'up', 'left', 'left', 'down', 'right', 'up', 'right', 'right', 'right', 'down', 'right'], mechanics: { fragileCount: 2, gates: [{ type: 'hard-switch' }, { type: 'soft-switch' }] } },
];

const splitSuffixes: readonly Direction[][] = [
  ['right', 'down', 'down', 'left', 'up', 'right', 'down', 'left', 'up', 'right', 'up', 'left'],
  ['right', 'right', 'up', 'right'],
  ['up', 'left', 'up', 'up', 'right'],
  ['up', 'left', 'left', 'left', 'down', 'left'],
  ['left', 'down', 'left', 'down', 'right', 'right'],
  ['up', 'left', 'up', 'right', 'right', 'right', 'up'],
  ['left', 'up', 'up', 'up', 'up', 'up', 'left', 'left'],
  ['up', 'left', 'up', 'right', 'right', 'right', 'up', 'up'],
  ['right', 'right', 'down', 'right', 'down', 'left', 'left', 'down', 'down', 'down'],
  ['up', 'right', 'up', 'left', 'left', 'left', 'left', 'left', 'up'],
  ['left', 'down', 'down', 'right', 'down', 'right', 'up', 'right', 'right', 'down', 'left'],
  ['up', 'right', 'up', 'left', 'left', 'left', 'up', 'up'],
  ['right', 'right', 'up', 'right', 'up', 'left', 'left', 'up', 'up', 'up'],
  ['down', 'right', 'down', 'left', 'left', 'left', 'left', 'left', 'down'],
];

const splitMetas: readonly LevelMeta[] = [
  { id: 'first-divide', title: 'First Divide', passcode: 'DUAL' },
  { id: 'separate-ways', title: 'Separate Ways', passcode: 'APAR' },
  { id: 'pairing-point', title: 'Pairing Point', passcode: 'PAIR' },
  { id: 'offset-twins', title: 'Offset Twins', passcode: 'OFST' },
  { id: 'relay-cubes', title: 'Relay Cubes', passcode: 'RCUB' },
  { id: 'split-current', title: 'Split Current', passcode: 'SCUR' },
  { id: 'reunion', title: 'Reunion', passcode: 'REUN' },
  { id: 'fragile-relay', title: 'Fragile Relay', passcode: 'FREL' },
  { id: 'broken-circuit', title: 'Broken Circuit', passcode: 'BCIR' },
  { id: 'crossed-signals', title: 'Crossed Signals', passcode: 'XSIG' },
  { id: 'dual-gate', title: 'Dual Gate', passcode: 'DGAT' },
  { id: 'shifting-span', title: 'Shifting Span', passcode: 'SHFT' },
  { id: 'split-furnace', title: 'Split Furnace', passcode: 'SFUR' },
  { id: 'return-vector', title: 'Return Vector', passcode: 'RVEC' },
];

const splitPlans: readonly SplitPlan[] = [
  { destinations: [{ x: 0, z: 3 }, { x: 3, z: 3 }], actions: ['right', 'right'] },
  { destinations: [{ x: 0, z: 3 }, { x: 3, z: 3 }], actions: ['switch-cube', 'left', 'left'] },
  { destinations: [{ x: 5, z: 0 }, { x: 5, z: 3 }], actions: ['down', 'down'] },
  { destinations: [{ x: 5, z: 0 }, { x: 5, z: 3 }], actions: ['switch-cube', 'up', 'up'] },
];

const advancedSplitPlans: readonly SplitPlan[] = [
  {
    destinations: [{ x: 0, z: 3 }, { x: 5, z: 3 }],
    actions: ['up', 'up', 'right', 'right', 'switch-cube', 'up', 'up', 'left', 'left'],
  },
  {
    destinations: [{ x: 5, z: 0 }, { x: 5, z: 5 }],
    actions: ['left', 'left', 'down', 'down', 'switch-cube', 'left', 'left', 'up', 'up'],
  },
  {
    destinations: [{ x: -2, z: 2 }, { x: 4, z: 2 }],
    actions: ['down', 'down', 'right', 'right', 'right', 'switch-cube', 'down', 'down', 'left', 'left'],
  },
  {
    destinations: [{ x: 4, z: -2 }, { x: 4, z: 4 }],
    actions: ['left', 'left', 'down', 'down', 'down', 'switch-cube', 'left', 'left', 'up', 'up'],
  },
];

const isolatedSplitPlan: SplitPlan = {
  destinations: [{ x: 0, z: 5 }, { x: 5, z: 5 }],
  actions: ['down', 'down', 'right', 'right', 'switch-cube', 'down', 'down', 'left', 'left'],
};

const isolatedMirrorSplitPlan: SplitPlan = {
  destinations: [{ x: 1, z: 5 }, { x: -4, z: 5 }],
  actions: ['down', 'down', 'left', 'left', 'switch-cube', 'down', 'down', 'right', 'right'],
};

const isolatedWideSplitPlan: SplitPlan = {
  destinations: [{ x: 0, z: 5 }, { x: 6, z: 5 }],
  actions: ['down', 'down', 'right', 'right', 'right', 'switch-cube', 'down', 'down', 'left', 'left'],
};

const isolatedWideMirrorSplitPlan: SplitPlan = {
  destinations: [{ x: 1, z: 5 }, { x: -5, z: 5 }],
  actions: ['down', 'down', 'left', 'left', 'left', 'switch-cube', 'down', 'down', 'right', 'right'],
};

const forcedDualRoutePlan: SplitPlan = {
  destinations: [{ x: 0, z: 5 }, { x: 5, z: 5 }],
  actions: ['switch-cube', 'down', 'down', 'left', 'left', 'switch-cube', 'down', 'down', 'right', 'right'],
};

const forcedDualRouteMirrorPlan: SplitPlan = {
  destinations: [{ x: 1, z: 5 }, { x: -4, z: 5 }],
  actions: ['switch-cube', 'down', 'down', 'right', 'right', 'switch-cube', 'down', 'down', 'left', 'left'],
};

const mirroredVerticalSplitPlan: SplitPlan = {
  destinations: [{ x: 1, z: 0 }, { x: 1, z: 5 }],
  actions: ['right', 'right', 'down', 'down', 'switch-cube', 'right', 'right', 'up', 'up'],
};

const standingRouteA: readonly Direction[] = ['up', 'right', 'down', 'left', 'down', 'left', 'left', 'down', 'down', 'right'];
const standingRouteB: readonly Direction[] = ['left', 'down', 'down', 'down', 'right', 'right', 'up', 'right', 'down', 'left', 'down'];
const standingRouteC: readonly Direction[] = ['left', 'left', 'up', 'right', 'down', 'left', 'down', 'left', 'down', 'down', 'left', 'left'];
const standingRouteD: readonly Direction[] = ['right', 'right', 'up', 'left', 'down', 'right', 'down', 'right', 'down', 'down', 'left', 'left', 'left', 'left'];
const standingRouteE: readonly Direction[] = ['down', 'down', 'right', 'up', 'left', 'down', 'left', 'down', 'left', 'left', 'up', 'up', 'up', 'up'];
const standingRouteF: readonly Direction[] = ['left', 'left', 'down', 'right', 'up', 'left', 'up', 'left', 'up', 'up', 'right', 'right', 'right', 'right'];
const standingRouteG: readonly Direction[] = ['up', 'up', 'left', 'down', 'right', 'up', 'right', 'up', 'right', 'right', 'down', 'down', 'down', 'down'];

const advancedSplitRoutes: Readonly<Record<number, { plan: SplitPlan; suffix: readonly Direction[] }>> = {
  1: { plan: forcedDualRoutePlan, suffix: ['down', 'up', 'right', 'down', 'up', 'up', 'up', 'down', 'left', 'left', 'right', 'up', 'up', 'right', 'down', 'right', 'down', 'up', 'up', 'right', 'up', 'left', 'up', 'right', 'right'] },
  2: { plan: advancedSplitPlans[1], suffix: ['down', 'left', 'left', 'up', 'right', 'down', 'left', 'down', 'left', 'down', 'down', 'right', 'right', 'right', 'right'] },
  3: { plan: isolatedMirrorSplitPlan, suffix: ['down', 'right', 'down', 'right', 'down', 'right', 'right', 'right', 'up', 'up', 'left', 'left', 'right', 'down', 'right', 'up', 'up', 'up'] },
  4: { plan: forcedDualRouteMirrorPlan, suffix: ['up', 'right', 'right', 'up', 'up', 'left', 'left', 'right', 'up', 'up', 'left', 'down', 'left', 'up', 'left', 'right', 'up', 'left', 'up', 'up', 'right'] },
  5: { plan: isolatedWideMirrorSplitPlan, suffix: ['right', 'down', 'up', 'up', 'up', 'right', 'up', 'right', 'up', 'up', 'right', 'right', 'right', 'left', 'down', 'down', 'right', 'down', 'left'] },
  6: { plan: advancedSplitPlans[1], suffix: ['down', ...standingRouteC] },
  7: { plan: mirroredVerticalSplitPlan, suffix: ['down', ...standingRouteE] },
  8: { plan: advancedSplitPlans[3], suffix: ['down', ...standingRouteD] },
  9: { plan: advancedSplitPlans[0], suffix: ['left', 'left', 'left', 'up', 'right', 'down', 'left', 'down', 'left', 'down', 'down', 'right', 'right', 'right', 'right'] },
  10: { plan: isolatedSplitPlan, suffix: ['right', ...standingRouteD] },
  11: { plan: isolatedSplitPlan, suffix: ['left', ...standingRouteE] },
  12: { plan: isolatedSplitPlan, suffix: ['right', ...standingRouteC] },
  13: { plan: advancedSplitPlans[0], suffix: ['left', ...standingRouteF] },
};

const lateWholeBlueprints: typeof wholeBlueprints = [
  { meta: { id: 'iron-labyrinth', title: 'Iron Labyrinth', passcode: 'IRON' }, route: ['right', 'right', 'left', 'left', 'up', 'up', 'down', 'down', ...standingRouteB, ...standingRouteA], mechanics: { fragileCount: 10, gates: [{ type: 'hard-switch', bridgeCellCount: 3, switchFrame: 2 }, { type: 'hard-switch', bridgeCellCount: 3, switchFrame: 6 }] } },
  { meta: { id: 'triple-relay', title: 'Triple Relay', passcode: 'TRLY' }, route: ['right', 'right', 'left', 'left', 'up', 'up', 'down', 'down', 'left', 'left', 'right', 'right', 'down', 'down', 'right', 'up', 'left', 'down', 'left', 'down', 'left', 'left', 'up', 'up', 'up', 'up'], mechanics: { fragileCount: 10, gates: [{ type: 'hard-switch', bridgeCellCount: 2, switchFrame: 2 }, { type: 'hard-switch', bridgeCellCount: 2, switchFrame: 6 }, { type: 'hard-switch', bridgeCellCount: 3, switchFrame: 10 }] } },
  { meta: { id: 'divided-works', title: 'Divided Works', passcode: 'DWRK' }, route: ['right', 'right', 'left', 'left', 'up', 'up', 'down', 'down', 'left', 'left', 'right', 'right', 'down', 'down', 'up', 'up', ...standingRouteG, ...standingRouteB], mechanics: { fragileCount: 8, gates: [{ type: 'hard-switch', bridgeCellCount: 3, switchFrame: 2 }, { type: 'hard-switch', bridgeCellCount: 3, switchFrame: 6 }, { type: 'hard-switch', bridgeCellCount: 2, switchFrame: 10 }, { type: 'hard-switch', bridgeCellCount: 2, switchFrame: 14 }] } },
];

const lockedArcToggleSolution: readonly PuzzleAction[] = [
  'left', 'left', 'up', 'right', 'down', 'up', 'down',
  'left', 'down', 'left', 'down', 'down', 'left', 'left',
];

const lastFoundryToggleSolution: readonly PuzzleAction[] = [
  'right', 'right', 'up', 'left', 'left', 'down', 'left', 'left', 'left', 'up',
  'switch-cube', 'up', 'up', 'up', 'up', 'left', 'left', 'down', 'left', 'left', 'left', 'left', 'up',
];

const openingLevels = wholeBlueprints.map((blueprint) => {
  const frames = wholeTrace(blueprint.route);
  const level = buildLevel(blueprint.meta, frames, blueprint.route, blueprint.mechanics);
  return level.id === 'locked-arc' ? withSolution(level, lockedArcToggleSolution) : level;
});

function mechanicsForSplitLevel(index: number): MechanicPlan {
  if (index === 1) return {
    fragileCount: 4,
    gates: [{
      type: 'soft-switch',
      switchFrame: 7,
      switchCellIndex: 1,
      bridgePlacements: [{ frame: 11, cellIndex: 0 }, { frame: 12, cellIndex: 0 }],
    }],
  };
  if (index === 3) return { fragileCount: 4, gates: [{ type: 'soft-switch', bridgeCellCount: 2, switchFrame: 8, switchCellIndex: 1 }] };
  if (index === 4) return { fragileCount: 5, gates: [{ type: 'soft-switch', bridgeCellCount: 2, switchFrame: 7, switchCellIndex: 1 }] };
  if (index === 5) return { fragileCount: 5, gates: [{ type: 'soft-switch', bridgeCellCount: 2, switchFrame: 9, switchCellIndex: 1 }] };
  if (index < 3) return {};
  if (index < 7) return { fragileCount: index % 2 };
  if (index === 7) return { fragileCount: 6, gates: [{ type: 'soft-switch', bridgeCellCount: 2 }] };
  if (index === 8) return { fragileCount: 8, gates: [{ type: 'soft-switch', bridgeCellCount: 2 }] };
  if (index === 9) return { fragileCount: 6, gates: [{ type: 'soft-switch', bridgeCellCount: 2 }, { type: 'hard-switch', bridgeCellCount: 2 }] };
  if (index === 10) return { fragileCount: 8, gates: [{ type: 'soft-switch', bridgeCellCount: 2, switchFrame: 8, switchCellIndex: 1 }, { type: 'hard-switch', bridgeCellCount: 2 }] };
  if (index === 11) return { fragileCount: 9, gates: [{ type: 'soft-switch', bridgeCellCount: 2, switchFrame: 8, switchCellIndex: 1 }, { type: 'hard-switch', bridgeCellCount: 2 }] };
  if (index === 12) return { fragileCount: 10, gates: [{ type: 'soft-switch', bridgeCellCount: 3, switchFrame: 8, switchCellIndex: 1 }, { type: 'hard-switch', bridgeCellCount: 2 }] };
  return { fragileCount: 10, gates: [{ type: 'soft-switch', bridgeCellCount: 3 }, { type: 'hard-switch', bridgeCellCount: 2 }] };
}

const splitLevels = splitMetas.map((meta, index) => {
  const advanced = advancedSplitRoutes[index];
  const plan = advanced?.plan ?? splitPlans[index % splitPlans.length];
  const trace = splitTrace(['right', 'right'], plan, advanced?.suffix ?? splitSuffixes[index]);
  const mechanics = mechanicsForSplitLevel(index);
  return buildLevel(meta, trace.frames, trace.solution, mechanics, trace.splitDefinition);
});

const lateLevels = lateWholeBlueprints.map((blueprint) => {
  const frames = wholeTrace(blueprint.route);
  return buildLevel(blueprint.meta, frames, blueprint.route, blueprint.mechanics);
});

function buildLateSplitLevel(
  meta: LevelMeta,
  plan: SplitPlan,
  suffix: readonly Direction[],
  mechanics: MechanicPlan,
): LevelDefinition {
  const trace = splitTrace(['right', 'right'], plan, suffix);
  return buildLevel(meta, trace.frames, trace.solution, mechanics, trace.splitDefinition);
}

const fractureGrid = buildLateSplitLevel(
  { id: 'fracture-grid', title: 'Fracture Grid', passcode: 'FGRD' },
  advancedSplitPlans[2],
  ['right', 'right', 'right', 'up', 'left', 'down', 'right', 'down', 'right', 'down', 'down', 'left', 'left', 'left', 'left'],
  { fragileCount: 8, gates: [{ type: 'hard-switch', bridgeCellCount: 3 }, { type: 'soft-switch', bridgeCellCount: 2 }, { type: 'hard-switch', bridgeCellCount: 3 }] },
);

const lastFoundry = withSolution(
  buildLateSplitLevel(
    { id: 'last-foundry', title: 'Last Foundry', passcode: 'LAST' },
    splitPlans[3],
    ['up', 'left', 'left', 'down', 'right', 'down', 'down', 'left', 'left', 'left', 'down', 'down', 'left', 'up', 'up', 'up', 'up', 'up', 'left', 'up', 'right'],
    { fragileCount: 5, gates: [{ type: 'hard-switch' }, { type: 'soft-switch' }, { type: 'hard-switch' }] },
  ),
  lastFoundryToggleSolution,
);

export const chapterOneLevels: readonly LevelDefinition[] = [
  ...openingLevels,
  ...splitLevels,
  lateLevels[0],
  lateLevels[1],
  fractureGrid,
  lateLevels[2],
  lastFoundry,
];

export const tutorialLevels = chapterOneLevels;

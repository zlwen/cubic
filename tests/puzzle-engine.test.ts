import { occupiedCells, PuzzleEngine, validateLevel } from '../src/game/index';
import type { GridCoord, LevelDefinition, TileDefinition } from '../src/game/index';
import {
  chapterOneLevels,
  getLevelIndexByPasscode,
  tutorialLevels,
  validateTutorialContent,
} from '../src/levels/index';
import { bloxorzLevelData } from '../src/levels/bloxorzLevelData';

const assert = {
  equal<T>(actual: T, expected: T, message?: string) {
    if (actual !== expected) {
      throw new Error(message ?? `Expected ${String(expected)}, got ${String(actual)}`);
    }
  },
  deepEqual(actual: unknown, expected: unknown, message?: string) {
    const actualJson = JSON.stringify(actual);
    const expectedJson = JSON.stringify(expected);
    if (actualJson !== expectedJson) {
      throw new Error(message ?? `Expected ${expectedJson}, got ${actualJson}`);
    }
  },
  match(actual: string, expected: RegExp, message?: string) {
    if (!expected.test(actual)) {
      throw new Error(message ?? `Expected ${actual} to match ${expected}`);
    }
  },
};

function goalRing(goal: GridCoord): TileDefinition[] {
  const tiles: TileDefinition[] = [];
  for (let zOffset = -1; zOffset <= 1; zOffset += 1) {
    for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
      if (xOffset === 0 && zOffset === 0) continue;
      tiles.push({ x: goal.x + xOffset, z: goal.z + zOffset, type: 'normal' });
    }
  }
  return tiles;
}

function uniqueTiles(tiles: readonly TileDefinition[]): TileDefinition[] {
  return [...new Map(tiles.map((tile) => [`${tile.x},${tile.z}`, tile])).values()];
}

function makeLineLevel(): LevelDefinition {
  return {
    id: 'test-line',
    title: 'Test Line',
    passcode: 'TEST',
    author: 'Test',
    original: true,
    start: { anchor: { x: 0, z: 0 }, orientation: 'standing' },
    goal: { x: 3, z: 0 },
    tiles: [
      { x: 0, z: 0, type: 'normal' },
      { x: 1, z: 0, type: 'normal' },
      ...goalRing({ x: 3, z: 0 }),
    ],
  };
}

function testInitialOccupiedCells() {
  const engine = new PuzzleEngine(makeLineLevel());
  assert.deepEqual(engine.getOccupiedCells(), [{ x: 0, z: 0 }]);

  const result = engine.move('right');
  assert.equal(result.status, 'moved');
  assert.deepEqual(engine.getOccupiedCells(), [
    { x: 1, z: 0 },
    { x: 2, z: 0 },
  ]);
}

function testCompletionAndStepCount() {
  const engine = new PuzzleEngine(makeLineLevel());
  engine.move('right');
  const result = engine.move('right');

  assert.equal(result.status, 'completed');
  assert.equal(engine.getState().completed, true);
  assert.equal(engine.getState().steps, 2);
  assert.deepEqual(occupiedCells(engine.getState().block), [{ x: 3, z: 0 }]);
}

function testLyingAcrossGoalIsSupported() {
  const level: LevelDefinition = {
    ...makeLineLevel(),
    goal: { x: 2, z: 0 },
    tiles: [
      { x: 0, z: 0, type: 'normal' },
      ...goalRing({ x: 2, z: 0 }),
    ],
  };
  const engine = new PuzzleEngine(level);
  const result = engine.move('right');

  assert.equal(result.status, 'moved');
  assert.equal(engine.getState().completed, false);
  assert.equal(engine.getState().failed, false);
  assert.equal(engine.getState().block.orientation, 'lying-x');
}

function testFallingIsDeterministic() {
  const engine = new PuzzleEngine(makeLineLevel());
  const result = engine.move('left');

  assert.equal(result.status, 'fallen');
  assert.equal(engine.getState().failed, true);
  assert.equal(engine.getState().steps, 1);
  assert.deepEqual(result.supportedCells, []);

  const afterFailedMove = engine.move('right');
  assert.equal(afterFailedMove.status, 'invalid');
  assert.equal(engine.getState().failed, true);
}

function testUndoAndRestart() {
  const engine = new PuzzleEngine(makeLineLevel());
  engine.move('right');
  assert.equal(engine.getState().steps, 1);

  const undone = engine.undo();
  assert.equal(undone.steps, 0);
  assert.equal(undone.block.orientation, 'standing');
  assert.deepEqual(undone.block.anchor, { x: 0, z: 0 });

  engine.move('right');
  const restarted = engine.restart();
  assert.equal(restarted.steps, 0);
  assert.equal(restarted.completed, false);
  assert.equal(restarted.failed, false);
  assert.equal(engine.canUndo(), false);
}

function testInvalidLevelData() {
  const invalid: LevelDefinition = {
    ...makeLineLevel(),
    goal: { x: 99, z: 0 },
  };

  const result = validateLevel(invalid);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /Goal hole 99,0 is not surrounded/);
}

function testTutorialLevels() {
  const errors = validateTutorialContent();
  assert.deepEqual(errors, []);
  assert.equal(chapterOneLevels.length, 33);
  assert.equal(tutorialLevels, chapterOneLevels);
  assert.equal(chapterOneLevels[0].id, 'stage-01-ez');
  assert.equal(chapterOneLevels[1].id, 'stage-02-pq');

  const ids = new Set(chapterOneLevels.map((level) => level.id));
  const titles = new Set(chapterOneLevels.map((level) => level.title));
  assert.equal(ids.size, chapterOneLevels.length);
  assert.equal(titles.size, chapterOneLevels.length);
  assert.equal(new Set(chapterOneLevels.map((level) => level.passcode)).size, chapterOneLevels.length);

  const expectedPasscodes = [
    '780464', '290299', '918660', '520967', '028431', '524383', '189493', '499707',
    '074355', '300590', '291709', '958640', '448106', '210362', '098598', '000241',
    '683596', '284933', '119785', '543019', '728724', '987319', '293486', '088198',
    '250453', '426329', '660141', '769721', '691859', '280351', '138620', '879021',
    '614955',
  ];
  assert.deepEqual(chapterOneLevels.map((level) => level.passcode), expectedPasscodes);

  const expectedTileTypes: Readonly<Record<string, string>> = {
    b: 'normal', f: 'fragile', s: 'soft-switch', h: 'hard-switch', v: 'split',
  };
  const expectedModes: Readonly<Record<string, string>> = {
    on: 'enable', off: 'disable', onoff: 'toggle',
  };
  let bridgeCount = 0;
  let staticTileCount = 0;
  let switchCount = 0;
  let switchActionCount = 0;
  let splitCount = 0;

  for (const [index, level] of chapterOneLevels.entries()) {
    const raw = bloxorzLevelData[index];
    assert.equal(level.original, false);
    assert.match(level.source ?? '', /8d552f867c06caa8bc9953eefa13ecb2bb9d8edf/);
    assert.deepEqual(level.start.anchor, { x: raw.spawn[0], z: raw.spawn[1] });

    const tiles = new Map(level.tiles.map((tile) => [`${tile.x},${tile.z}`, tile.type]));
    const bridges = new Map((level.bridges ?? []).map((bridge) => [
      `${bridge.cells[0].x},${bridge.cells[0].z}`,
      bridge,
    ]));
    raw.tiles.forEach((row, z) => [...row].forEach((symbol, x) => {
      const key = `${x},${z}`;
      if (symbol === 'e') assert.deepEqual(level.goal, { x, z });
      else if (expectedTileTypes[symbol]) assert.equal(tiles.get(key), expectedTileTypes[symbol]);
      else if ('lkrq'.includes(symbol)) {
        const bridge = bridges.get(key);
        assert.equal(Boolean(bridge), true, `${level.id} must preserve bridge ${key}`);
        assert.equal(bridge?.initiallyActive, symbol === 'k' || symbol === 'q');
      }
    }));

    for (const [key, rawActions] of Object.entries(raw.switches ?? {})) {
      const encoded = Number(key);
      const x = Math.floor(encoded / 10);
      const z = encoded % 10;
      const actual = level.switches?.find((item) => item.x === x && item.z === z);
      assert.deepEqual(actual?.actions, rawActions.map(([bridgeX, bridgeZ, mode]) => ({
        bridgeId: `bridge-${bridgeX}-${bridgeZ}`,
        mode: expectedModes[mode],
      })));
    }

    for (const [key, destinations] of Object.entries(raw.splits ?? {})) {
      const encoded = Number(key);
      const x = Math.floor(encoded / 10);
      const z = encoded % 10;
      const actual = level.splits?.find((item) => item.x === x && item.z === z);
      assert.deepEqual(actual?.destinations, [
        { x: destinations[0], z: destinations[1] },
        { x: destinations[2], z: destinations[3] },
      ]);
    }

    bridgeCount += level.bridges?.length ?? 0;
    staticTileCount += level.tiles.length;
    switchCount += level.switches?.length ?? 0;
    switchActionCount += (level.switches ?? []).reduce((sum, item) => sum + item.actions.length, 0);
    splitCount += level.splits?.length ?? 0;
    const moveCount = level.solution?.filter((action) => action !== 'switch-cube').length;
    assert.equal(level.par, moveCount, `${level.id} par should match its reviewed solution`);
    const engine = new PuzzleEngine(level);
    for (const action of level.solution ?? []) {
      if (action === 'switch-cube') engine.switchActiveCube();
      else engine.move(action);
    }
    assert.equal(engine.getState().completed, true, `${level.id} should be solvable`);
  }
  assert.equal(bridgeCount, 145);
  assert.equal(staticTileCount, 1938);
  assert.equal(switchCount, 92);
  assert.equal(switchActionCount, 213);
  assert.equal(splitCount, 14);
  const expectedOptimalMoves = [
    7, 17, 22, 28, 33, 35, 44, 10, 24, 57, 47,
    65, 46, 67, 57, 28, 106, 85, 67, 56, 71, 65,
    75, 57, 55, 104, 71, 100, 104, 114, 91, 129, 65,
  ];
  assert.deepEqual(chapterOneLevels.map((level) => level.par), expectedOptimalMoves);
  assert.equal(chapterOneLevels[7].solution?.includes('switch-cube'), true);
}

function testPasscodeLookup() {
  assert.equal(getLevelIndexByPasscode('780464'), 0);
  assert.equal(getLevelIndexByPasscode('290299'), 1);
  assert.equal(getLevelIndexByPasscode(' 028431 '), 4);
  assert.equal(getLevelIndexByPasscode('614955'), 32);
  assert.equal(getLevelIndexByPasscode('ABC'), -1);
  assert.equal(getLevelIndexByPasscode('1234'), -1);
  assert.equal(getLevelIndexByPasscode('123456'), -1);
}

function testFragileTileRules() {
  const goal = { x: 6, z: 0 };
  const level: LevelDefinition = {
    ...makeLineLevel(),
    id: 'test-fragile',
    passcode: 'FRAG',
    goal,
    tiles: uniqueTiles([
      { x: 0, z: 0, type: 'normal' },
      { x: 1, z: 0, type: 'fragile' },
      { x: 2, z: 0, type: 'normal' },
      { x: 3, z: 0, type: 'fragile' },
      { x: 4, z: 0, type: 'normal' },
      ...goalRing(goal),
    ]),
  };
  const engine = new PuzzleEngine(level);
  assert.equal(engine.move('right').status, 'moved', 'A lying block should cross fragile support.');
  const result = engine.move('right');
  assert.equal(result.status, 'fallen', 'A standing block should break fragile support.');
  assert.deepEqual(result.supportedCells, [], 'A broken fragile tile no longer supports the block.');
}

function switchBridgeLevel(type: 'soft-switch' | 'hard-switch'): LevelDefinition {
  const goal = { x: 6, z: 0 };
  return {
    ...makeLineLevel(),
    id: `test-${type}`,
    passcode: type === 'soft-switch' ? 'SOFT' : 'HARD',
    goal,
    tiles: uniqueTiles([
      { x: 0, z: 0, type: 'normal' },
      { x: 1, z: 0, type },
      { x: 2, z: 0, type: 'normal' },
      { x: 4, z: 0, type: 'normal' },
      ...goalRing(goal),
    ]),
    bridges: [{ id: 'gate', cells: [{ x: 3, z: 0 }], initiallyActive: false }],
    switches: [{
      x: 1,
      z: 0,
      actions: [{ bridgeId: 'gate', mode: type === 'soft-switch' ? 'toggle' : 'enable' }],
    }],
  };
}

function testSwitchAndBridgeRules() {
  const softEngine = new PuzzleEngine(switchBridgeLevel('soft-switch'));
  softEngine.move('right');
  assert.equal(softEngine.getState().bridgeStates.gate, true);
  softEngine.move('left');
  softEngine.move('right');
  assert.equal(softEngine.getState().bridgeStates.gate, false, 'A soft switch should toggle its bridge off when pressed again.');
  assert.equal(softEngine.undo().bridgeStates.gate, true, 'Undo should restore the bridge state before the second press.');
  const restarted = softEngine.restart();
  assert.equal(restarted.bridgeStates.gate, false);

  const hardEngine = new PuzzleEngine(switchBridgeLevel('hard-switch'));
  hardEngine.move('right');
  assert.equal(hardEngine.getState().bridgeStates.gate, false);
  assert.equal(hardEngine.move('right').status, 'fallen');

  const standingHardLevel: LevelDefinition = {
    ...makeLineLevel(),
    id: 'test-standing-hard',
    passcode: 'STND',
    goal: { x: 6, z: 0 },
    tiles: uniqueTiles([
      { x: 0, z: 0, type: 'normal' },
      { x: 1, z: 0, type: 'normal' },
      { x: 2, z: 0, type: 'normal' },
      { x: 3, z: 0, type: 'hard-switch' },
      ...goalRing({ x: 6, z: 0 }),
    ]),
    bridges: [{ id: 'gate', cells: [{ x: 4, z: 0 }], initiallyActive: false }],
    switches: [{ x: 3, z: 0, actions: [{ bridgeId: 'gate', mode: 'enable' }] }],
  };
  const standingHardEngine = new PuzzleEngine(standingHardLevel);
  standingHardEngine.move('right');
  standingHardEngine.move('right');
  assert.equal(standingHardEngine.getState().bridgeStates.gate, true);
}

function testSplitMovementAndRecombination() {
  const goal = { x: 6, z: 0 };
  const level: LevelDefinition = {
    ...makeLineLevel(),
    id: 'test-split',
    passcode: 'DUAL',
    goal,
    tiles: uniqueTiles([
      { x: 0, z: 0, type: 'normal' },
      { x: 1, z: 0, type: 'normal' },
      { x: 2, z: 0, type: 'normal' },
      { x: 3, z: 0, type: 'split' },
      { x: 0, z: 2, type: 'soft-switch' },
      { x: 1, z: 2, type: 'normal' },
      { x: 2, z: 2, type: 'normal' },
      ...goalRing(goal),
    ]),
    splits: [{
      x: 3,
      z: 0,
      destinations: [{ x: 0, z: 2 }, { x: 2, z: 2 }],
    }],
    bridges: [{ id: 'split-gate', cells: [{ x: 4, z: 2 }], initiallyActive: false }],
    switches: [{ x: 0, z: 2, actions: [{ bridgeId: 'split-gate', mode: 'enable' }] }],
  };
  const engine = new PuzzleEngine(level);
  engine.move('right');
  engine.move('right');
  assert.equal(engine.getState().split?.activeCube, 0);
  assert.equal(engine.getState().bridgeStates['split-gate'], false);
  engine.switchActiveCube();
  assert.equal(engine.getState().split?.activeCube, 1);
  const result = engine.move('left');
  assert.equal(result.status, 'moved');
  assert.equal(engine.getState().split, null);
  assert.equal(engine.getState().block.orientation, 'lying-x');
  assert.deepEqual(engine.getState().block.anchor, { x: 0, z: 2 });
}

testInitialOccupiedCells();
testCompletionAndStepCount();
testLyingAcrossGoalIsSupported();
testFallingIsDeterministic();
testUndoAndRestart();
testInvalidLevelData();
testTutorialLevels();
testPasscodeLookup();
testFragileTileRules();
testSwitchAndBridgeRules();
testSplitMovementAndRecombination();

console.log('puzzle engine tests passed');

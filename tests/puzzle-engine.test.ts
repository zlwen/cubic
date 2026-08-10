import { findSolution, occupiedCells, PuzzleEngine, validateLevel } from '../src/game/index';
import type { GridCoord, LevelDefinition, TileDefinition } from '../src/game/index';
import {
  chapterOneLevels,
  getLevelIndexByPasscode,
  tutorialLevels,
  validateTutorialContent,
} from '../src/levels/index';

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

function testLyingAcrossGoalFalls() {
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

  assert.equal(result.status, 'fallen');
  assert.equal(engine.getState().completed, false);
  assert.equal(engine.getState().failed, true);
  assert.equal(engine.getState().block.orientation, 'lying-x');
  assert.deepEqual(result.supportedCells, [{ x: 1, z: 0 }]);
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
  assert.equal(chapterOneLevels[0].id, 'south-step');
  assert.equal(chapterOneLevels[1].id, 'first-roll');

  const ids = new Set(chapterOneLevels.map((level) => level.id));
  const titles = new Set(chapterOneLevels.map((level) => level.title));
  assert.equal(ids.size, chapterOneLevels.length);
  assert.equal(titles.size, chapterOneLevels.length);
  assert.equal(new Set(chapterOneLevels.map((level) => level.passcode)).size, chapterOneLevels.length);

  for (const level of chapterOneLevels) {
    for (const switchDefinition of level.switches ?? []) {
      const tile = level.tiles.find((candidate) =>
        candidate.x === switchDefinition.x && candidate.z === switchDefinition.z);
      if (tile?.type === 'soft-switch') {
        for (const action of switchDefinition.actions) {
          assert.equal(action.mode, 'toggle', `${level.id} soft switches should toggle their bridges.`);
        }
      }
    }
    const moveCount = level.solution?.filter((action) => action !== 'switch-cube').length;
    assert.equal(level.par, moveCount, `${level.id} par should match its reviewed solution`);
    const engine = new PuzzleEngine(level);
    for (const action of level.solution ?? []) {
      if (action === 'switch-cube') engine.switchActiveCube();
      else engine.move(action);
    }
    assert.equal(engine.getState().completed, true, `${level.id} should be solvable`);
  }

  const openingLength = chapterOneLevels[0].solution?.length ?? 0;
  const closingLength = chapterOneLevels[chapterOneLevels.length - 1].solution?.length ?? 0;
  assert.equal(closingLength > openingLength, true, 'Chapter one should finish with a longer route than it starts.');
  assert.equal(
    new Set(chapterOneLevels[chapterOneLevels.length - 1].solution).size >= 3,
    true,
    'The closing level should require varied directions.',
  );

  const mechanicCounts = {
    fragile: chapterOneLevels.filter((level) => level.tiles.some((tile) => tile.type === 'fragile')).length,
    bridges: chapterOneLevels.filter((level) => (level.bridges?.length ?? 0) > 0).length,
    split: chapterOneLevels.filter((level) => (level.splits?.length ?? 0) > 0).length,
  };
  assert.equal(mechanicCounts.fragile >= 15, true, 'Fragile support should recur across the campaign.');
  assert.equal(mechanicCounts.bridges >= 15, true, 'Bridge switches should recur across the campaign.');
  assert.equal(mechanicCounts.split, 16, 'Split mechanics should return in the closing campaign.');
}

function testPasscodeLookup() {
  assert.equal(getLevelIndexByPasscode('RIFT'), 0);
  assert.equal(getLevelIndexByPasscode('CUBE'), 1);
  assert.equal(getLevelIndexByPasscode(' cube '), 1);
  assert.equal(getLevelIndexByPasscode('last'), 32);
  assert.equal(getLevelIndexByPasscode('ABC'), -1);
  assert.equal(getLevelIndexByPasscode('1234'), -1);
  assert.equal(getLevelIndexByPasscode('NONE'), -1);
}

function testBoundedCampaignSearch() {
  const shortestMoveCounts: number[] = [];
  const shortestSolutions: Array<readonly string[]> = [];
  for (const level of chapterOneLevels) {
    const result = findSolution(level, 50_000);
    assert.equal(result.solution !== null, true, `${level.id} should pass bounded state search`);
    shortestMoveCounts.push(result.solution?.filter((action) => action !== 'switch-cube').length ?? 0);
    shortestSolutions.push(result.solution ?? []);
  }

  const openingAverage = average(shortestMoveCounts.slice(0, 7));
  const closingAverage = average(shortestMoveCounts.slice(28));
  assert.equal(closingAverage > openingAverage * 2, true, 'The closing band should be materially harder.');
  assert.equal(shortestMoveCounts[32] >= 18, true, 'The final level should require a long solution.');

  const redesignedLevels = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
  for (const levelNumber of redesignedLevels) {
    assert.equal(
      shortestMoveCounts[levelNumber - 1] >= 20,
      true,
      `Level ${levelNumber} should require at least twenty moves.`,
    );
  }
  for (const levelNumber of redesignedLevels.filter((levelNumber) => ![29, 30, 32].includes(levelNumber))) {
    assert.equal(
      shortestSolutions[levelNumber - 1].includes('switch-cube'),
      true,
      `Level ${levelNumber} should require moving both split cubes.`,
    );
  }

  const revisedTailSignatures = [16, 18, 19, 20, 29, 32].map((levelNumber) =>
    shortestSolutions[levelNumber - 1]
      .filter((action) => action !== 'switch-cube')
      .slice(-6)
      .join(','));
  assert.equal(
    new Set(revisedTailSignatures).size,
    revisedTailSignatures.length,
    'Revised levels should not reuse the same finishing sequence.',
  );
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
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
testLyingAcrossGoalFalls();
testFallingIsDeterministic();
testUndoAndRestart();
testInvalidLevelData();
testTutorialLevels();
testPasscodeLookup();
testBoundedCampaignSearch();
testFragileTileRules();
testSwitchAndBridgeRules();
testSplitMovementAndRecombination();

console.log('puzzle engine tests passed');

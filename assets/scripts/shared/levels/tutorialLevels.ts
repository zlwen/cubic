import type {
  BridgeActionMode,
  BridgeDefinition,
  GridCoord,
  LevelDefinition,
  SplitDefinition,
  SwitchDefinition,
  TileDefinition,
  TileType,
} from '../game/index';
import {
  bloxorzLevelData,
  type RawBloxorzLevel,
  type RawBloxorzSwitchMode,
} from './bloxorzLevelData';
import { bloxorzSolutions } from './bloxorzSolutions';

const sourceReference =
  'jacobcoughenour/bloxorz_gba game/levels.json @ 8d552f867c06caa8bc9953eefa13ecb2bb9d8edf (MIT)';

const staticTileTypes: Readonly<Record<string, TileType>> = {
  b: 'normal',
  f: 'fragile',
  s: 'soft-switch',
  h: 'hard-switch',
  v: 'split',
};

const bridgeSymbols = new Set(['l', 'k', 'r', 'q']);

function bridgeId(x: number, z: number): string {
  return `bridge-${x}-${z}`;
}

function sourceCoord(key: string): GridCoord {
  const encoded = Number(key);
  return { x: Math.floor(encoded / 10), z: encoded % 10 };
}

function actionMode(mode: RawBloxorzSwitchMode): BridgeActionMode {
  if (mode === 'on') return 'enable';
  if (mode === 'off') return 'disable';
  return 'toggle';
}

function paddedNumber(value: number, width: number): string {
  const text = String(value);
  return '000000'.slice(0, Math.max(0, width - text.length)) + text;
}

function convertLevel(raw: RawBloxorzLevel, index: number): LevelDefinition {
  const tiles: TileDefinition[] = [];
  const bridges: BridgeDefinition[] = [];
  let goal: GridCoord | undefined;

  raw.tiles.forEach((row, z) => {
    row.split('').forEach((symbol, x) => {
      if (symbol === 'e') {
        goal = { x, z };
        return;
      }
      const type = staticTileTypes[symbol];
      if (type) tiles.push({ x, z, type });
      if (bridgeSymbols.has(symbol)) {
        bridges.push({
          id: bridgeId(x, z),
          cells: [{ x, z }],
          initiallyActive: symbol === 'k' || symbol === 'q',
        });
      }
    });
  });

  if (!goal) throw new Error(`Source level ${raw.id} has no goal hole.`);

  const rawSwitches = raw.switches ?? {};
  const switches: SwitchDefinition[] = Object.keys(rawSwitches).map(
    (key) => ({
      ...sourceCoord(key),
      actions: rawSwitches[key].map(([x, z, mode]) => ({
        bridgeId: bridgeId(x, z),
        mode: actionMode(mode),
      })),
    }),
  );

  const rawSplits = raw.splits ?? {};
  const splits: SplitDefinition[] = Object.keys(rawSplits).map((key) => {
    const [firstX, firstZ, secondX, secondZ] = rawSplits[key];
    return {
      ...sourceCoord(key),
      destinations: [
        { x: firstX, z: firstZ },
        { x: secondX, z: secondZ },
      ],
    };
  });

  const stageNumber = paddedNumber(index + 1, 2);
  const solution = bloxorzSolutions[index];
  if (!solution) throw new Error(`Stage ${stageNumber} has no verified solution.`);
  return {
    id: `stage-${stageNumber}-${raw.id}`,
    title: `Stage ${stageNumber}`,
    passcode: paddedNumber(raw.code, 6),
    author: 'Jacob Coughenour / Bloxorz.gba',
    original: false,
    source: sourceReference,
    tiles,
    bridges,
    switches,
    splits,
    start: {
      anchor: { x: raw.spawn[0], z: raw.spawn[1] },
      orientation: 'standing',
    },
    goal,
    solution,
    par: solution.filter((action) => action !== 'switch-cube').length,
  };
}

export const chapterOneLevels: readonly LevelDefinition[] = bloxorzLevelData.map(convertLevel);
export const tutorialLevels = chapterOneLevels;

import { coordKey, occupiedCells } from './coords';
import type {
  GridCoord,
  LevelDefinition,
  LevelValidationResult,
  PuzzleState,
  SplitDefinition,
  SwitchDefinition,
  TileDefinition,
} from './types';

const tileTypes = new Set(['normal', 'fragile', 'soft-switch', 'hard-switch', 'split']);

export class LevelMap {
  private readonly tilesByCoord: ReadonlyMap<string, TileDefinition>;
  private readonly bridgeIdByCoord: ReadonlyMap<string, string>;
  private readonly switchesByCoord: ReadonlyMap<string, SwitchDefinition>;
  private readonly splitsByCoord: ReadonlyMap<string, SplitDefinition>;

  constructor(readonly definition: LevelDefinition) {
    this.tilesByCoord = new Map(definition.tiles.map((tile) => [coordKey(tile), tile]));
    const bridgeEntries: Array<readonly [string, string]> = [];
    for (const bridge of definition.bridges ?? []) {
      for (const cell of bridge.cells) bridgeEntries.push([coordKey(cell), bridge.id]);
    }
    this.bridgeIdByCoord = new Map(bridgeEntries);
    this.switchesByCoord = new Map(
      (definition.switches ?? []).map((item) => [coordKey(item), item]),
    );
    this.splitsByCoord = new Map(
      (definition.splits ?? []).map((item) => [coordKey(item), item]),
    );
  }

  hasStaticTile(coord: GridCoord): boolean {
    return this.tilesByCoord.has(coordKey(coord));
  }

  tileAt(coord: GridCoord): TileDefinition | undefined {
    return this.tilesByCoord.get(coordKey(coord));
  }

  switchAt(coord: GridCoord): SwitchDefinition | undefined {
    return this.switchesByCoord.get(coordKey(coord));
  }

  splitAt(coord: GridCoord): SplitDefinition | undefined {
    return this.splitsByCoord.get(coordKey(coord));
  }

  supports(cells: readonly GridCoord[], bridgeStates: PuzzleState['bridgeStates']): boolean {
    return cells.every((cell) => this.supportsCell(cell, bridgeStates));
  }

  supportedCells(
    cells: readonly GridCoord[],
    bridgeStates: PuzzleState['bridgeStates'],
  ): GridCoord[] {
    return cells.filter((cell) => this.supportsCell(cell, bridgeStates));
  }

  private supportsCell(coord: GridCoord, bridgeStates: PuzzleState['bridgeStates']): boolean {
    if (coordKey(coord) === coordKey(this.definition.goal)) return true;
    if (this.hasStaticTile(coord)) return true;
    const bridgeId = this.bridgeIdByCoord.get(coordKey(coord));
    return bridgeId ? bridgeStates[bridgeId] === true : false;
  }
}

export function validateLevel(level: LevelDefinition): LevelValidationResult {
  const errors: string[] = [];
  const staticKeys = new Set<string>();
  const potentialSupportKeys = new Set<string>();

  if (!level.id.trim()) errors.push('Level id is required.');
  if (!level.title.trim()) errors.push('Level title is required.');
  if (!level.author.trim()) errors.push('Level author is required.');
  if (!level.original && !level.source?.trim()) {
    errors.push('Adapted level content must include its source.');
  }
  if (level.tiles.length === 0) errors.push('Level must contain at least one tile.');

  for (const tile of level.tiles) {
    const key = coordKey(tile);
    if (staticKeys.has(key)) errors.push(`Duplicate tile at ${key}.`);
    staticKeys.add(key);
    potentialSupportKeys.add(key);
    if (!tileTypes.has(tile.type)) errors.push(`Unsupported tile type at ${key}.`);
  }

  const bridgeIds = new Set<string>();
  for (const bridge of level.bridges ?? []) {
    if (!bridge.id.trim()) errors.push('Bridge id is required.');
    if (bridgeIds.has(bridge.id)) errors.push(`Duplicate bridge id: ${bridge.id}.`);
    bridgeIds.add(bridge.id);
    if (bridge.cells.length === 0) errors.push(`Bridge ${bridge.id} must contain at least one cell.`);
    for (const cell of bridge.cells) {
      const key = coordKey(cell);
      if (potentialSupportKeys.has(key)) errors.push(`Duplicate support cell at ${key}.`);
      potentialSupportKeys.add(key);
    }
  }

  for (const cell of occupiedCells(level.start)) {
    if (!staticKeys.has(coordKey(cell))) {
      errors.push(`Start cell ${coordKey(cell)} must be a static board tile.`);
    }
  }

  const goalKey = coordKey(level.goal);
  if (potentialSupportKeys.has(goalKey)) {
    errors.push(`Goal hole ${goalKey} must not contain a supporting tile.`);
  }
  for (let zOffset = -1; zOffset <= 1; zOffset += 1) {
    for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
      if (xOffset === 0 && zOffset === 0) continue;
      const neighbor = coordKey({ x: level.goal.x + xOffset, z: level.goal.z + zOffset });
      if (!potentialSupportKeys.has(neighbor)) {
        errors.push(`Goal hole ${goalKey} is not surrounded by board cells; missing ${neighbor}.`);
      }
    }
  }

  const switchKeys = new Set<string>();
  for (const item of level.switches ?? []) {
    const key = coordKey(item);
    if (switchKeys.has(key)) errors.push(`Duplicate switch definition at ${key}.`);
    switchKeys.add(key);
    const tile = level.tiles.find((candidate) => coordKey(candidate) === key);
    if (tile?.type !== 'soft-switch' && tile?.type !== 'hard-switch') {
      errors.push(`Switch definition ${key} must reference a switch tile.`);
    }
    if (item.actions.length === 0) errors.push(`Switch ${key} must contain at least one action.`);
    for (const action of item.actions) {
      if (!bridgeIds.has(action.bridgeId)) {
        errors.push(`Switch ${key} references unknown bridge ${action.bridgeId}.`);
      }
      if (action.mode !== 'enable' && action.mode !== 'disable' && action.mode !== 'toggle') {
        errors.push(`Switch ${key} has unsupported action mode.`);
      }
    }
  }
  for (const tile of level.tiles) {
    if ((tile.type === 'soft-switch' || tile.type === 'hard-switch') && !switchKeys.has(coordKey(tile))) {
      errors.push(`Switch tile ${coordKey(tile)} is missing a switch definition.`);
    }
  }

  const splitKeys = new Set<string>();
  for (const item of level.splits ?? []) {
    const key = coordKey(item);
    if (splitKeys.has(key)) errors.push(`Duplicate split definition at ${key}.`);
    splitKeys.add(key);
    const tile = level.tiles.find((candidate) => coordKey(candidate) === key);
    if (tile?.type !== 'split') errors.push(`Split definition ${key} must reference a split tile.`);
    const [first, second] = item.destinations;
    if (coordKey(first) === coordKey(second)) errors.push(`Split ${key} destinations must be distinct.`);
    for (const destination of item.destinations) {
      if (!potentialSupportKeys.has(coordKey(destination))) {
        errors.push(`Split ${key} destination ${coordKey(destination)} is unsupported.`);
      }
    }
  }
  for (const tile of level.tiles) {
    if (tile.type === 'split' && !splitKeys.has(coordKey(tile))) {
      errors.push(`Split tile ${coordKey(tile)} is missing a split definition.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidLevel(level: LevelDefinition): void {
  const result = validateLevel(level);
  if (!result.valid) throw new Error(result.errors.join('\n'));
}

import type { BlockState, GridCoord } from './types';

export function coordKey(coord: GridCoord): string {
  return `${coord.x},${coord.z}`;
}

export function sameCoord(a: GridCoord, b: GridCoord): boolean {
  return a.x === b.x && a.z === b.z;
}

export function occupiedCells(block: BlockState): GridCoord[] {
  const { x, z } = block.anchor;

  if (block.orientation === 'standing') {
    return [{ x, z }];
  }

  if (block.orientation === 'lying-x') {
    return [
      { x, z },
      { x: x + 1, z },
    ];
  }

  return [
    { x, z },
    { x, z: z + 1 },
  ];
}

export function boundsForCells(cells: readonly GridCoord[]): { minX: number; maxX: number; minZ: number; maxZ: number } {
  return cells.reduce(
    (bounds, cell) => ({
      minX: Math.min(bounds.minX, cell.x),
      maxX: Math.max(bounds.maxX, cell.x),
      minZ: Math.min(bounds.minZ, cell.z),
      maxZ: Math.max(bounds.maxZ, cell.z),
    }),
    { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity },
  );
}

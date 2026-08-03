import type { BlockState, Direction } from './types';

export function rollBlock(block: BlockState, direction: Direction): BlockState {
  const { x, z } = block.anchor;

  if (block.orientation === 'standing') {
    switch (direction) {
      case 'left':
        return { anchor: { x: x - 2, z }, orientation: 'lying-x' };
      case 'right':
        return { anchor: { x: x + 1, z }, orientation: 'lying-x' };
      case 'up':
        return { anchor: { x, z: z - 2 }, orientation: 'lying-z' };
      case 'down':
        return { anchor: { x, z: z + 1 }, orientation: 'lying-z' };
    }
  }

  if (block.orientation === 'lying-x') {
    switch (direction) {
      case 'left':
        return { anchor: { x: x - 1, z }, orientation: 'standing' };
      case 'right':
        return { anchor: { x: x + 2, z }, orientation: 'standing' };
      case 'up':
        return { anchor: { x, z: z - 1 }, orientation: 'lying-x' };
      case 'down':
        return { anchor: { x, z: z + 1 }, orientation: 'lying-x' };
    }
  }

  switch (direction) {
    case 'left':
      return { anchor: { x: x - 1, z }, orientation: 'lying-z' };
    case 'right':
      return { anchor: { x: x + 1, z }, orientation: 'lying-z' };
    case 'up':
      return { anchor: { x, z: z - 1 }, orientation: 'standing' };
    case 'down':
      return { anchor: { x, z: z + 2 }, orientation: 'standing' };
  }
}

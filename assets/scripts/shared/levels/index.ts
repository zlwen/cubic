import { PuzzleEngine, validateLevel } from '../game/index';
import { chapterOneLevels, tutorialLevels } from './tutorialLevels';

export { chapterOneLevels, tutorialLevels };

export function getLevelById(id: string) {
  return tutorialLevels.find((level) => level.id === id);
}

export function getLevelIndexByPasscode(input: string): number {
  const normalized = input.trim();
  if (!/^\d{6}$/.test(normalized)) {
    return -1;
  }
  return chapterOneLevels.findIndex((level) => level.passcode === normalized);
}

export function validateTutorialContent(): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const seenPasscodes = new Set<string>();

  if (chapterOneLevels.length !== 33) {
    errors.push(`The campaign must contain 33 levels, found ${chapterOneLevels.length}.`);
  }

  for (const level of tutorialLevels) {
    if (seenIds.has(level.id)) {
      errors.push(`Duplicate level id: ${level.id}`);
    }
    seenIds.add(level.id);

    if (seenTitles.has(level.title)) {
      errors.push(`Duplicate level title: ${level.title}`);
    }
    seenTitles.add(level.title);

    if (!/^\d{6}$/.test(level.passcode)) {
      errors.push(`${level.id}: passcode must contain exactly six digits.`);
    } else if (seenPasscodes.has(level.passcode)) {
      errors.push(`${level.id}: duplicate passcode: ${level.passcode}`);
    }
    seenPasscodes.add(level.passcode);

    const validation = validateLevel(level);
    errors.push(...validation.errors.map((error) => `${level.id}: ${error}`));

    if (!level.solution || level.solution.length === 0) {
      errors.push(`${level.id}: solution is required for first playable verification.`);
      continue;
    }
    const moveCount = level.solution.filter((action) => action !== 'switch-cube').length;
    if (level.par !== moveCount) {
      errors.push(`${level.id}: par must match the reviewed solution length.`);
    }

    const boardCells = [
      ...level.tiles,
      ...(level.bridges ?? []).reduce<Array<{ x: number; z: number }>>(
        (cells, bridge) => [...cells, ...bridge.cells],
        [],
      ),
      ...(level.splits ?? []).reduce<Array<{ x: number; z: number }>>(
        (cells, split) => [...cells, ...split.destinations],
        [],
      ),
      level.goal,
    ];
    const xs = boardCells.map((cell) => cell.x);
    const zs = boardCells.map((cell) => cell.z);
    const width = Math.max(...xs) - Math.min(...xs) + 1;
    const depth = Math.max(...zs) - Math.min(...zs) + 1;
    if (width > 15 || depth > 10) {
      errors.push(`${level.id}: board bounds exceed the mobile campaign limit.`);
    }

    const engine = new PuzzleEngine(level);
    for (const action of level.solution) {
      if (action === 'switch-cube') {
        if (!engine.getState().split) {
          errors.push(`${level.id}: solution switches cubes outside split mode.`);
          break;
        }
        engine.switchActiveCube();
      } else {
        const result = engine.move(action);
        if (result.status === 'invalid' || result.status === 'fallen') {
          errors.push(`${level.id}: solution contains a ${result.status} ${action} action.`);
          break;
        }
      }
    }
    const state = engine.getState();
    if (!state.completed) {
      errors.push(`${level.id}: documented solution does not complete the level.`);
    }
  }

  return errors;
}

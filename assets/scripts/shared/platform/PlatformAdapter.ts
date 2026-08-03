import { native, sys } from 'cc';

export interface Insets {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface PlatformAdapter {
  readonly name: string;
  getSafeAreaInsets(): Insets;
  vibrateLight(): void;
  onLevelStarted(levelId: string): void;
  onLevelCompleted(levelId: string, steps: number): void;
}

export class DefaultPlatformAdapter implements PlatformAdapter {
  readonly name: string = 'default';

  getSafeAreaInsets(): Insets {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  vibrateLight(): void {
    if (sys.isNative && sys.os === sys.OS.OPENHARMONY) {
      try {
        const started = native.reflection.callStaticMethod(
          'entry/src/main/ets/Haptics',
          'entry/vibrateLight',
          '',
          true,
        );
        console.info(`HarmonyOS vibration bridge returned: ${String(started)}`);
      } catch (error) {
        console.warn('HarmonyOS vibration bridge failed.', error);
      }
      return;
    }

    globalThis.navigator?.vibrate?.(35);
  }

  onLevelStarted(_levelId: string): void {
    // Intentionally empty. Native adapters can report lifecycle events later.
  }

  onLevelCompleted(_levelId: string, _steps: number): void {
    // Intentionally empty. Native adapters can report lifecycle events later.
  }
}

export function createPlatformAdapter(): PlatformAdapter {
  return new DefaultPlatformAdapter();
}

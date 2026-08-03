import { DefaultPlatformAdapter, type Insets } from './PlatformAdapter';

export class HarmonyOSAdapter extends DefaultPlatformAdapter {
  override readonly name = 'harmonyos-next';

  override getSafeAreaInsets(): Insets {
    return super.getSafeAreaInsets();
  }

  override vibrateLight(): void {
    super.vibrateLight();
  }
}

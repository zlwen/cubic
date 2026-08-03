# HarmonyOS Next Build Notes

First release target: HarmonyOS Next phone and tablet.

Tracked release identity:

- Product: `CUBIC`
- Bundle: `me.kk.cubic`
- Version: `1.0.0` (`1000000`)
- Minimum API: HarmonyOS API 15 / `5.0.3(15)`
- Orientation: landscape

## Cocos Creator

1. Open this repository in Cocos Creator 3.8.8.
2. Open `assets/scenes/Gameplay.scene` and refresh the asset database after external edits.
3. In Build, select HarmonyOS Next and confirm `Gameplay` is the entry scene.
4. Prefer JSVM when the Cocos Creator build panel exposes that option.
5. Build/export the native project.

The intended build profile is recorded in `build-profiles/harmonyos-next.json`.

## DevEco Studio

1. Open the generated HarmonyOS Next native project in DevEco Studio.
2. Confirm the HarmonyOS SDK path resolves to DevEco's installed SDK.
3. Configure signing with a Huawei developer account/profile.
4. Confirm `AppScope/app.json5` uses the tracked bundle and version values.
5. Remove template permissions that are not required by reviewed features. The current game requires vibration; it does not require accounts, location, contacts, camera, microphone, or storage access.
6. Confirm the release icon and start window artwork are present.
7. Connect an authorized device and verify `hdc list targets` shows it.
8. Build the `release` product and run the signed artifact on device.

## Release Device Smoke Test

- App launches without native crash.
- Title attract scene, all six menu actions, and sound state render correctly.
- Start New Game confirmation, Resume Game, unlocked stage selection, and passcode loading work.
- First-use tutorials block puzzle input and do not repeat after acknowledgement.
- Swipes move the block in four cardinal directions.
- Rolling animation completes and input unlocks.
- Failure shows Retry and Quit to Menu after the fall animation.
- Completion shows move/time results and Continue, Replay, and Quit to Menu.
- Split controls, fragile tiles, soft/hard switches, and bridge changes behave correctly.
- Backgrounding saves and pauses; foregrounding does not resume without confirmation.
- Sound preference, tutorial state, unlocked stages, and exact run resume survive relaunch.
- Vibration works on failure and completion.
- UI remains inside safe areas on a HarmonyOS phone and Pad.

## Generated Project Notes

The generated DevEco project normally lives under `native/engine/harmonyos-next`. It is local build output and contains machine-specific signing material, so it is intentionally not committed. Never copy certificate passwords, key passwords, profiles, or local signing paths into tracked files.

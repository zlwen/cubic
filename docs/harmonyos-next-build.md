# HarmonyOS Next Build Notes

First target: HarmonyOS Next phone.

## Cocos Creator

1. Open this repository in Cocos Creator 3.8.8.
2. Create or open the `Gameplay` scene described in `assets/scenes/README.md`.
3. In Build, select HarmonyOS Next.
4. Prefer JSVM when the Cocos Creator build panel exposes that option.
5. Build/export the native project.

The intended build profile is recorded in `build-profiles/harmonyos-next.json`.

## DevEco Studio

1. Open the generated HarmonyOS Next native project in DevEco Studio.
2. Confirm the HarmonyOS SDK path resolves to DevEco's installed SDK.
3. Configure signing with a Huawei developer account/profile.
4. Connect an authorized device and verify `hdc list targets` shows it.
5. Run the app on device.

## First Device Smoke Test

- App launches without native crash.
- First level appears with readable 3D framing.
- Swipes move the block in four cardinal directions.
- Rolling animation completes and input unlocks.
- Falling, completion, undo, restart, and next/replay controls behave correctly.

## Current Blocker

No authorized HarmonyOS phone is currently visible through `hdc list targets`, so device deployment and runtime verification cannot be completed from this session yet.

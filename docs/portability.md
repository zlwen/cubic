# Portability Notes

The gameplay engine, level data, and rule tests are platform-independent TypeScript under `src/game` and `src/levels`.

## Adapter Boundary

Native-only behavior belongs under `src/platform`:

- safe area insets
- vibration/haptics
- lifecycle events
- platform analytics later, if added
- native storage later, if added

The puzzle engine must not import Cocos, HarmonyOS, Android, or iOS APIs.

## Android Follow-Up

- Install Android Studio and Android SDK/NDK compatible with the selected Cocos Creator version.
- Add Android signing configuration.
- Build from Cocos Creator for Android.
- Verify safe area, back behavior, touch latency, animation smoothness, and package size on a real Android phone.

## iOS Follow-Up

- Use macOS with Xcode and an Apple developer team.
- Build from Cocos Creator for iOS.
- Open generated Xcode project, configure signing, and run on a real iPhone.
- Verify safe area, orientation, touch latency, animation smoothness, and lifecycle resume behavior.

## Why

Build an original mobile 3D rolling-block puzzle inspired by the interaction pattern of Bloxorz, with HarmonyOS Next as the first target and Android/iOS portability kept explicit from the start. The project needs a clear product and technical contract before implementation because core puzzle rules, 3D presentation, mobile input, and native build targets will shape the Cocos architecture.

## What Changes

- Introduce a Cocos Creator 3.8.x game project for a 3D rolling-block puzzle on mobile.
- Implement a deterministic grid-based puzzle engine where a rectangular block rolls across discrete tiles with standing and lying orientations.
- Provide a polished 3D presentation layer with fixed isometric camera, rolling animations, tile feedback, failure animation, victory animation, and mobile-friendly UI.
- Support touch-first controls, undo, restart, step counting, level progression, and a small original level set for the first playable version.
- Target HarmonyOS Next first through DevEco Studio and Huawei device testing, while keeping platform-specific code isolated for later Android and iOS builds.
- Avoid using Bloxorz branding, original levels, visual assets, names, or protected presentation; the game will be an original rolling-block puzzle.

## Capabilities

### New Capabilities

- `rolling-block-puzzle`: Core puzzle rules, level data, tile behavior, move validation, undo, restart, win/loss conditions, and progression.
- `mobile-3d-presentation`: Cocos 3D scene presentation, camera behavior, animations, visual feedback, touch controls, and mobile UI.
- `native-platform-builds`: HarmonyOS Next first-run/build requirements and portability boundaries for later Android and iOS targets.

### Modified Capabilities

- None.

## Impact

- Adds a new Cocos Creator game application to the repository.
- Introduces TypeScript gameplay modules, Cocos scenes/prefabs/assets, and JSON or TypeScript level definitions.
- Adds HarmonyOS Next build workflow through Cocos Creator and DevEco Studio.
- Establishes architecture boundaries so puzzle logic remains platform-independent and native integrations stay isolated.
- Requires local development tools already identified on this machine: Cocos Creator 3.8.8, DevEco Studio 5.1.0, HarmonyOS SDK/toolchains, hdc, and a connected authorized HarmonyOS device for final verification.

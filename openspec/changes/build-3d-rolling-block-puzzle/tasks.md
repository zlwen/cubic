## 1. Project Setup

- [x] 1.1 Create a Cocos Creator 3.8.x TypeScript project structure in the repository.
- [x] 1.2 Configure project folders for source code, levels, scenes, prefabs, materials, and platform adapters.
- [x] 1.3 Add a minimal test or script workflow for platform-independent puzzle engine validation.
- [x] 1.4 Document local run prerequisites for Cocos Creator, DevEco Studio, HarmonyOS SDK, hdc, and device authorization.

## 2. Puzzle Engine

- [x] 2.1 Define block orientation, grid coordinate, occupied-cell, move-direction, tile, level, and move-result data types.
- [x] 2.2 Implement level validation for board tiles, start state, goal cells, and required metadata.
- [x] 2.3 Implement deterministic block movement for standing, lying-X, and lying-Z states across four cardinal directions.
- [x] 2.4 Implement support validation for normal tiles, empty space, goal cells, and failure states.
- [x] 2.5 Implement step counting, undo history, and restart behavior.
- [x] 2.6 Add engine tests for valid moves, invalid moves, falling, goal completion, undo, restart, and invalid level data.

## 3. Level Content

- [x] 3.1 Define a data-driven level format for original rolling-block puzzle levels.
- [x] 3.2 Create a small original tutorial level set covering movement, falling, goal completion, undo, and restart.
- [x] 3.3 Add level loading integration between level data and the puzzle engine.
- [x] 3.4 Verify all initial levels are solvable and do not copy Bloxorz names, layouts, assets, or branding.

## 4. 3D Presentation

- [x] 4.1 Create the base gameplay scene with board root, block root, camera, lighting, and UI canvas.
- [x] 4.2 Implement board rendering from level data using Cocos 3D tiles.
- [x] 4.3 Implement block rendering and roll animation driven by puzzle-engine move results.
- [x] 4.4 Implement fixed or smoothly-following readable 3D camera behavior for phone screens.
- [x] 4.5 Implement visual feedback for valid moves, invalid moves, falling, level completion, and tile state.
- [x] 4.6 Implement step count, undo, restart, next-level, and replay UI controls.

## 5. Mobile Input And UX

- [x] 5.1 Implement touch swipe recognition for four cardinal move directions.
- [x] 5.2 Add input locking and optional one-move input buffering during roll animations.
- [x] 5.3 Add touch-friendly UI hit areas and safe-area-aware layout for phones.
- [x] 5.4 Tune animation timing, feedback, and camera framing on a mobile viewport.

## 6. HarmonyOS Next Build

- [x] 6.1 Configure Cocos Creator build settings for HarmonyOS Next and JSVM where available.
- [x] 6.2 Export the HarmonyOS Next native project from Cocos Creator.
- [x] 6.3 Open the generated project in DevEco Studio and resolve signing or SDK configuration issues.
- [x] 6.4 Connect and authorize a HarmonyOS phone until `hdc list targets` shows the device.
- [x] 6.5 Run the first playable build on the HarmonyOS phone.
- [x] 6.6 Verify launch, touch input, animation responsiveness, level completion, failure, undo, and restart on device.

## 7. Portability Preparation

- [x] 7.1 Keep HarmonyOS-specific configuration outside the puzzle engine and shared presentation logic.
- [x] 7.2 Add a platform adapter boundary for native-only behavior such as safe area, vibration, or lifecycle hooks.
- [x] 7.3 Record follow-up notes for Android build requirements, signing, and device testing.
- [x] 7.4 Record follow-up notes for iOS build requirements, signing, and device testing.

## 8. Verification

- [x] 8.1 Run puzzle engine tests and confirm all first-version rule scenarios pass.
- [x] 8.2 Validate OpenSpec artifacts for this change.
- [x] 8.3 Review the first playable against the three specs: rolling-block rules, mobile 3D presentation, and native platform builds.

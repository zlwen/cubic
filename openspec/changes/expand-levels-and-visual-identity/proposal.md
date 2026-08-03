## Why

The verified first playable proves the rolling-block controls and HarmonyOS build path, but five tutorial boards and primitive flat-color geometry are not enough to establish a distinctive game or a sustainable difficulty curve. The next phase should create an original first chapter with deliberate teaching, stronger spatial readability, and a visual identity that does not reproduce Bloxorz layouts, branding, UI, or art direction.

## What Changes

- Expand the initial campaign into an original first chapter with ten compact, solvable levels.
- Organize levels by a clear learning curve: orientation control, edge awareness, route planning, recovery, and multi-turn landing setup.
- Add campaign metadata and progress presentation so players can understand their current level and target move count.
- Replace primitive floating tiles with an original classic-industrial presentation using light weathered stone, rusted iron, an ember-red void, a board-surrounded goal hole, and block detailing.
- Replace the temporary HUD with compact level and move panels plus a restrained mobile command bar.
- Add original rolling, failure, completion, UI, and ambient sounds based on the reference implementation's feedback categories without copying its extracted audio.
- Preserve landscape play, full-board visibility, fixed camera framing, touch controls, and reliable unlit materials on HarmonyOS devices.
- Reserve fragile tiles, switches, moving bridges, and split-block mechanics for later reviewed increments rather than copying the source game's mechanic sequence wholesale.

## Capabilities

### New Capabilities

- `original-level-campaign`: An original, validated first chapter with progression metadata, solvable layouts, and a measured difficulty curve.
- `aerial-forge-visual-identity`: A coherent 3D board, block, goal, environment, and HUD presentation that remains readable and performant on mobile.

### Modified Capabilities

None.

## Impact

- Level data and validation in `src/levels` and `assets/scripts/shared/levels`.
- Gameplay progress and labels in the Cocos presentation scripts.
- Procedural board, goal, block, camera, HUD, and textured void rendering plus optimized original texture assets.
- Original generated WAV effects, ambient playback, and Cocos audio integration.
- Puzzle-engine tests for campaign solvability and content originality constraints.
- No new runtime dependency and no change to the existing HarmonyOS native bridge.

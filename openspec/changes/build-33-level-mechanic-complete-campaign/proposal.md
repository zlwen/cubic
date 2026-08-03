## Why

The current ten-level campaign exercises only rigid tiles and the goal hole, so it cannot reproduce the strategic depth or difficulty progression expected from classic Bloxorz gameplay. The game needs the complete mechanic vocabulary and a full-length campaign while retaining original layouts, names, solutions, and passcodes.

## What Changes

- Expand the campaign from ten to 33 original, ordered, validated levels.
- Add fragile tiles that fail under a standing full block.
- Add soft switches triggered by any supported block part and hard switches triggered only by a standing full block.
- Add dynamic bridge groups with enable, disable, and toggle switch actions.
- Add split tiles, two independently controlled cubes, active-cube switching, and automatic recombination.
- Add contextual mobile control for selecting the active split cube without restoring the removed bottom command bar.
- Render every mechanic distinctly and update bridge geometry immediately when its state changes.
- Extend passcodes, HUD numbering, camera framing, content validation, and recorded production-engine solutions to all 33 levels.
- Match the classic game's mechanic introduction cadence and late-game state-planning difficulty without copying its layouts or codes.

## Capabilities

### New Capabilities

- `dynamic-puzzle-mechanics`: Fragile support, soft and hard switches, configurable bridges, split cubes, active selection, recombination, and deterministic state transitions.
- `split-block-mobile-control`: Contextual mobile input and 3D presentation for two independently controlled cubes.
- `full-original-campaign`: A 33-level original campaign with classic-style mechanic progression, unique passcodes, recorded solutions, and automated validation.

### Modified Capabilities

None.

## Impact

- Breaking expansion of shared puzzle state, move results, level metadata, and tile types under both `src` and `assets/scripts/shared`.
- Puzzle engine, validators, tests, board renderer, block presenter, gameplay controller, HUD, input, and camera bounds.
- Existing ten levels remain the opening material but may be rebalanced to fit the 33-level progression.
- No imported reference layouts, passcodes, art, audio, or new runtime dependencies.

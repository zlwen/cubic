## Context

The production puzzle engine currently stores one rigid block over static normal tiles. Level definitions contain explicit tile coordinates, one unsupported goal, one recorded directional solution, and a four-letter passcode. Cocos mirrors the TypeScript engine and level data under `assets/scripts/shared`. The classic ruleset also requires orientation-sensitive fragile support, dynamic bridges, two switch classes, and a split state with independently moved cubes.

### Reference implementation findings

The reviewed GBA port uses a fixed 15 by 10 level grid and nine effective tile roles: empty, stone, goal, two bridge orientations, soft switch, hard switch, fragile red tile, and split tile. Soft switches react to any landed active block part, hard switches require an unsplit standing block, and fragile tiles reject only an unsplit standing block. Switch actions can enable, disable, or toggle individual bridge cells. Split destinations do not trigger switches during teleport; only a later landed move does.

The reference campaign derives difficulty from topology rather than move count alone. Later boards combine broad fragile regions, separated islands, multiple switches controlling several bridge cells, return trips after state changes, and split routes that require moving both cubes. The redesigned original campaign uses these principles without importing source coordinates, passcodes, identifiers, or switch configurations.

## Goals / Non-Goals

**Goals:**

- Implement deterministic classic-compatible mechanics in the shared engine.
- Keep engine behavior independent of Cocos so every recorded solution is testable in Node.
- Present dynamic tiles and split cubes clearly with the existing fixed orthographic camera.
- Ship 33 original levels whose mechanic cadence and state-planning difficulty resemble the classic campaign.
- Preserve screen-aligned swipe controls, menu flow, passcodes, automatic restart, and automatic level advance.

**Non-Goals:**

- Importing original layouts, numeric codes, level identifiers, assets, or switch configurations.
- Pixel-identical animations or timing.
- Procedural levels, random switches, online content, or persistence changes.

## Decisions

### Represent dynamic gameplay state explicitly

`PuzzleState` will retain the whole-block state and add optional split cubes, an active-cube index, and bridge states. Whole and split occupation are derived through one helper. Recorded solutions use `PuzzleAction`, which is either a direction or `switch-cube`. Keeping all bridge and split data in cloned state makes undo, restart, solving, and tests deterministic.

### Keep support geometry separate from trigger metadata

Static tiles carry `normal`, `fragile`, `soft-switch`, `hard-switch`, or `split` types. Bridge groups carry their own cells and initial active state. Switch definitions map a tile coordinate to one or more `enable`, `disable`, or `toggle` bridge actions. Split definitions map a split tile to two valid destination coordinates. This avoids encoding behavior into display characters.

### Resolve a move in a fixed order

The engine computes the candidate position, checks goal completion for a standing whole block, checks active support, rejects a standing whole block on fragile material, applies switches, enters split mode when standing on a split tile, and recombines adjacent cubes. Bridge changes affect subsequent support checks, matching a stable landed-state model.

### Use contextual split control on mobile

Swipes move only the active cube while split. A compact contextual upper control switches the active cube and disappears after recombination. The two cubes use distinct highlights so selection is visible without instructional text in the playfield.

### Author content from mechanic briefs and verify with the production engine

The campaign will contain 33 deterministic original blueprints grouped into five difficulty bands. Each blueprint declares reviewed route, mechanic, metadata, and split-destination choices; a shared compiler derives explicit tile and dynamic definitions from those choices. Every level includes a recorded `PuzzleAction` solution executed by the real engine. A bounded breadth-first solver validates all dynamic states and guards against unintended shortcuts.

Levels 16-32 have a minimum verified shortest path of 20 moves. Every redesigned split level also requires an active-cube switch in its shortest solution, while later switch groups control two or three bridge cells instead of a single incidental support cell. Revised goal approaches use distinct mixed-direction tails so mechanic bands do not collapse into the same repeated finishing sequence.

### Preserve duplicated runtime data until the build pipeline changes

Shared engine and content files remain byte-identical between `src` and `assets/scripts/shared`. This duplication is undesirable but already required by the current Cocos/test setup; changing it is outside this feature.

## Risks / Trade-offs

- [Dynamic state substantially enlarges the engine surface] -> Add focused tests for every mechanic and mixed transitions before authoring late levels.
- [Bridge actions can create unsolvable states] -> Validate recorded solutions and run bounded state-space searches for every level.
- [Split presentation can desynchronize from engine state] -> Drive renderer and presenter exclusively from immutable move-result states.
- [Thirty-three boards can exceed mobile framing] -> Enforce reviewed board bounds and use projected orthographic framing.
- [Goal boundaries can create unintended shortcuts] -> Derive the required eight-cell boundary from each reviewed goal coordinate and reject campaigns whose bounded shortest paths undercut the difficulty bands.
- [Difficulty can be subjective] -> Require increasing solution length, state changes, and mechanic combinations across bands, then tune from Pad playtests.

## Migration Plan

1. Expand shared types and implement mechanics with unit tests.
2. Update Cocos renderer, presenter, controller, and contextual input.
3. Convert the current opening levels to the expanded schema.
4. Add and validate the remaining original levels in mechanic bands.
5. Review browser behavior and rebuild for HarmonyOS Pad.

Rollback requires restoring the static engine, ten-level data, and single-mesh presenter together because the state contract changes across those modules.

## Open Questions

- Final par values may change after physical-device playtesting even when recorded solutions remain valid.

## Context

The repository currently contains only OpenSpec planning configuration and no game implementation. The requested product is an original mobile rolling-block puzzle built with Cocos Creator, using a 3D view, launching first on HarmonyOS Next phones, and later portable to Android and iOS.

The development machine already has Cocos Creator 3.8.8, DevEco Studio 5.1.0, HarmonyOS SDK/toolchains, hdc, Node, npm, Git, and DevEco's bundled JBR. The current missing runtime prerequisite is an authorized HarmonyOS device visible to `hdc list targets`.

The main architectural constraint is that the game must feel like a polished 3D mobile game while retaining deterministic puzzle behavior. The puzzle must not rely on physics simulation for rule correctness.

## Goals / Non-Goals

**Goals:**

- Build a Cocos Creator 3.8.x TypeScript project for a 3D rolling-block puzzle.
- Make HarmonyOS Next the first native target.
- Keep core puzzle logic independent from Cocos scene nodes and native platform APIs.
- Provide mobile-first touch controls, undo, restart, step counting, level completion, and clear visual feedback.
- Support later Android and iOS publishing without rewriting gameplay rules.
- Use original naming, levels, visuals, and presentation.

**Non-Goals:**

- Reuse Bloxorz branding, original levels, assets, UI, or exact presentation.
- Implement monetization, cloud save, leaderboards, achievements, ads, account login, or analytics in the first playable version.
- Build a level editor in the first version.
- Use rigid-body physics as the source of truth for movement and collision.
- Guarantee Android/iOS store-ready release in the first milestone.

## Decisions

### Use deterministic grid logic as the source of truth

The puzzle engine will model the block as a discrete state: standing on one tile, lying along X across two tiles, or lying along Z across two tiles. A move request calculates the next occupied cells, validates tile support, applies tile effects, and returns a result for the presentation layer to animate.

Alternative considered: use Cocos 3D physics and collision callbacks for block movement. This was rejected because puzzle correctness, undo, replay, level testing, and cross-platform determinism are simpler with discrete logic.

### Separate engine, presentation, and platform layers

The codebase will use clear boundaries:

- Puzzle engine: state transitions, level data, tile rules, undo stack, and result objects.
- Presentation layer: Cocos nodes, animations, camera, UI, and effects.
- Platform layer: HarmonyOS Next build/run configuration and future Android/iOS adapters.

Alternative considered: implement rules directly inside Cocos scene components. This was rejected because it would couple testable rules to scene lifetime and make later platform work harder.

### Use fixed 3D camera rather than free camera controls

The first version will use a fixed isometric or near-isometric 3D camera with optional smooth follow. This keeps the board readable on phones and reduces input ambiguity.

Alternative considered: user-controlled orbit camera. This was rejected for the first version because it adds gesture conflicts, readability problems, and extra state without improving core puzzle quality.

### Use data-driven original levels

Levels will be represented as structured data containing tile coordinates, tile types, start state, goal cells, and optional mechanisms. This enables test coverage for rule behavior and makes later content expansion easier.

Alternative considered: hand-place every level directly in Cocos scenes. This was rejected because it makes iteration, validation, undo/replay verification, and platform-independent testing harder.

### Target HarmonyOS Next first through Cocos export and DevEco Studio

The initial native workflow will build a HarmonyOS Next project from Cocos Creator and run it from DevEco Studio on a real HarmonyOS device. The game code must avoid direct dependencies on HarmonyOS APIs unless wrapped behind a platform adapter.

Alternative considered: start with Web or Android first. This was rejected because the explicit first target is HarmonyOS phone and the local machine already has the core HarmonyOS toolchain.

## Risks / Trade-offs

- HarmonyOS device is not currently visible to `hdc` -> Verify developer mode, USB debugging, cable trust prompt, and `hdc list targets` before native run tasks.
- Cocos HarmonyOS Next export may have platform-specific rendering or JS engine issues -> Keep an early smoke scene and test on device before building extensive content.
- 3D visuals could obscure tile readability on small screens -> Use fixed camera, readable tile silhouettes, restrained effects, and mobile viewport checks.
- Puzzle rules may become hard to maintain as mechanisms grow -> Keep tile effects declarative and add tests for each rule before adding complex mechanisms.
- Later Android/iOS ports may expose input, safe area, packaging, or performance differences -> Keep platform-specific behavior behind adapters and avoid HarmonyOS-only assumptions in gameplay.
- Bloxorz inspiration creates IP risk if copied too closely -> Use original title, art direction, level layouts, UI, audio, and written copy.

## Migration Plan

1. Scaffold the Cocos Creator project and establish the TypeScript module structure.
2. Implement and test the platform-independent puzzle engine with a minimal level set.
3. Build the Cocos 3D presentation around the engine result events.
4. Export HarmonyOS Next and verify the app launches on an authorized device.
5. Iterate on mobile input, animation timing, camera framing, and performance.
6. Add Android and iOS build tasks only after HarmonyOS first playable is stable.

Rollback strategy is simple during first implementation: keep core rules isolated so platform-specific build failures can be reverted or repaired without changing puzzle data and engine tests.

## Open Questions

- What is the target minimum HarmonyOS version and actual test phone model?
- Should the first playable use Cocos built-in materials only, or include a custom visual theme from the beginning?
- How many tutorial levels should ship in the first milestone: 5, 10, or more?
- Should advanced mechanisms such as switches, bridges, weak tiles, and teleporters be included in MVP or deferred to the second milestone?

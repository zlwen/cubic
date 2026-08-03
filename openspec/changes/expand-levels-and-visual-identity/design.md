## Context

The current Cocos Creator project renders five original tutorial boards from shared TypeScript data using procedural box meshes and unlit materials. This is reliable on the target HarmonyOS Pad, but the content curve is short and the large slab beneath the board weakens the impression of navigating a suspended structure. The project intentionally keeps engine and level data duplicated under `src` for tests and `assets/scripts/shared` for Cocos.

## Goals / Non-Goals

**Goals:**

- Ship a ten-level original first chapter using the current rolling-block rules.
- Make every level statically valid, solvable by its recorded solution, compact enough for the fixed landscape camera, and distinct from protected source layouts and names.
- Establish a classic industrial identity with light stone tiles, restrained surface markings, a board-surrounded goal hole, a rusted rolling block, and a dark ember void.
- Use optimized original albedo textures to add tactile weathering while retaining deterministic geometry and reliable unlit materials.
- Provide original movement, failure, completion, UI, and ambient audio through a dedicated Cocos component.
- Show level position, title, steps, and par without adding a separate menu in this increment.

**Non-Goals:**

- Fragile tiles, pressure switches, moving bridges, split blocks, collectibles, or copied level sequences.
- A campaign map, save migration, monetization, audio production, or online services.
- Photorealistic materials, dynamic shadows, post-processing, large texture downloads, or copied audio samples.

## Decisions

### Build chapter one on the existing rule set

The first expansion will deepen orientation and route-planning challenges before introducing new tile rules. This gives the campaign a measurable baseline and avoids coupling new engine states to an unfinished visual system. New mechanics can follow as separate capabilities with focused tests.

### Keep explicit authored level data with recorded solutions

Each board remains an explicit list of tiles plus a recorded solution and par. Tests execute every solution through the real puzzle engine. Procedurally deriving boards from solutions was rejected because it would hide poor layouts and make content tests circular.

### Use original optimized textures on modular geometry

Normal tiles use a dark structural base, a light weathered-stone top, and a low-contrast marking. The rolling core uses a dark rusted-iron texture with separate metal bands. The goal is an unsupported coordinate surrounded by eight normal tiles, with only a dark shaft rendered below board height. A low-contrast ember texture sits far beneath the board without reading as playable ground. Empty cells remain visually open with no surrounding pylons competing with the grid. Textures are generated specifically for this project, reduced to 512 by 512, loaded through Cocos resources, and applied through the proven unlit effect.

### Reference behavior, not extracted assets

The `bloxorz_gba` repository is useful for understanding feedback timing and information hierarchy, but its README states that original sprites were extracted from the Bloxorz SWF and its release page describes original sounds and animations. None of those files are imported. The project instead generates three short rolling variations, failure and completion cues, a UI click, and an eight-second seamless ambient loop, then maps them to equivalent gameplay events through an `AudioController`.

### Frame the whole board with a fixed asymmetric orthographic camera

Each level uses a fixed offset equivalent to approximately 34 degrees pitch and 18 degrees yaw, producing deliberately asymmetric projected grid axes near -10 and +60 degrees. The camera remains orthographic and computes only its orthographic height from projected board bounds. It must not move during play. Swipe-to-board direction mapping follows the projected axes so screen-direction controls remain intuitive.

### Treat visual theme values as renderer constants

The initial theme is one authored identity, not a general skin system. Constants remain close to the procedural renderer until a second complete theme proves that an abstraction is useful.

## Risks / Trade-offs

- [Procedural geometry increases draw calls] -> Keep details sparse, reuse simple unlit materials where practical, and cap chapter-one board size.
- [Texture assets can increase memory or fail import] -> Use three 512 by 512 RGB textures under `assets/resources`, retain flat-color fallback materials, and verify browser and HarmonyOS builds.
- [Mobile audio autoplay can be blocked] -> Start ambient playback only after the first touch-driven move or UI command.
- [Reference assets have unclear third-party rights] -> Keep an audit record and use only newly generated project assets.
- [Recorded solutions can be valid but not shortest] -> Use `par` as the reviewed target and add shortest-path analysis later if level balancing requires it.
- [Fixed camera may make dense boards small] -> Constrain chapter-one bounds and validate all ten levels on the target Pad.
- [Visual similarity to genre references] -> Avoid source colors, textures, names, layouts, UI treatment, and exact mechanic progression; retain only generic spatial-puzzle principles.

## Migration Plan

1. Extend the existing level collection in both shared source locations.
2. Add solvability and chapter metadata assertions to the test suite.
3. Replace the board slab and flat goal cap with modular geometry and an unsupported goal hole, then load the original stone, rust, and void textures.
4. Replace the HUD and integrate original generated audio.
5. Rebuild through Cocos Creator and DevEco Studio, then verify all ten levels on the HarmonyOS Pad.

Rollback is limited to reverting the level collection and procedural renderer changes; the puzzle engine and native platform bridge remain unchanged.

## Open Questions

- Which new mechanic should lead chapter two: fragile plates, orientation-sensitive switches, or timed energy bridges?
- Whether later chapters should have distinct palettes or remain within one continuous forge environment.

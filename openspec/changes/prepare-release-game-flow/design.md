## Context

The current Cocos scene builds its board and UI procedurally and keeps title, playing, and paused modes inside `GameplayController`. Failure automatically reloads the level, completion automatically advances, passcodes are entered directly on the title screen, and no state survives process termination. The pure puzzle engine is deterministic and already models every switch, bridge, fragile, split, and recombination rule for 33 levels.

This change crosses pure game state, Cocos presentation, platform lifecycle, audio, and native release documentation. It must remain compatible with Cocos Creator 3.8.8, HarmonyOS Next JSVM, fixed landscape layouts, and the duplicated pure TypeScript/Cocos shared source pattern already used by the project.

## Goals / Non-Goals

**Goals:**

- Make every first-use mechanic understandable without requiring external instructions.
- Provide deliberate title, pause, failure, completion, stage-load, and reference flows.
- Resume an interrupted run deterministically across application restarts.
- Preserve progress and preferences safely when save data is absent, old, or malformed.
- Use an original animated presentation that visibly represents the actual game.
- Define and execute a concrete HarmonyOS release acceptance checklist.

**Non-Goals:**

- Cloud saves, accounts, leaderboards, achievements, monetization, analytics, or remote configuration.
- Importing Bloxorz artwork, menu composition, animation, passcodes, branding, or level layouts.
- Languages other than Simplified Chinese, Traditional Chinese, and English.
- Android or iOS store submission in this change.

## Decisions

### Persist a versioned action log instead of internal engine objects

Save data will contain a schema version, current level id, accepted `PuzzleAction` history, elapsed active seconds, highest unlocked level, sound preference, and completed onboarding topic ids. Resume rebuilds a fresh `PuzzleEngine` and deterministically replays the accepted actions. This avoids serializing private engine history or coupling persistence to Cocos nodes.

Alternative considered: serialize the complete `PuzzleState`. Rejected because future engine fields and bridge/split representation changes would require more fragile migrations and could restore impossible states.

### Separate durable progression from the current run

Progression and preferences survive Start New Game. Starting a new game resets the campaign position and action log after confirmation but does not turn sound back on or repeat tutorials already acknowledged. A completed level unlocks the next level before its result screen appears. Failed moves are never added to the durable action log, so process termination on the failure screen resumes from the last valid position.

### Expand the controller into an explicit finite state machine

The controller will use named modes for title, stage selection, how-to-play, playing, paused, tutorial, failed, and completed. Only `playing` accepts puzzle swipes or advances time. Overlay transitions activate exactly one blocking surface and clear buffered input.

Alternative considered: infer mode from active UI nodes. Rejected because lifecycle pause, result screens, and resume behavior need one authoritative state.

### Teach mechanics at first encounter

Tutorial topics are keyed by semantic ids rather than hard-coded stage numbers. Loading a level inspects its tile and mechanism definitions, queues unseen relevant topics in a stable order, and presents one blocking topic at a time. A How to Play view exposes all mechanic topics for replay without modifying completion state.

### Use the real 3D presentation for title animation

The title screen will retain the current scene and camera, render a small original attract board, and loop a restrained block animation behind a translucent UI band. This makes the product and interaction visible immediately without maintaining a separate illustration style or copying reference artwork. The animation stops before gameplay begins.

### Treat failure and completion as stable states

Failure animation ends on a failed overlay rather than reloading automatically. Retry creates a clean engine and resets level time. Completion animation ends on a result overlay after progress is saved; Continue loads the next level, Replay reloads the current level, and the final Continue returns to title.

### Pause and save on lifecycle interruption

Cocos hide events save the current valid run and move active gameplay to paused. Show events do not resume automatically. Mobile back closes the topmost secondary overlay, pauses active gameplay, or delegates exit only from the title screen.

### Keep localization platform-independent and data-driven

Player-facing text uses typed message keys backed by complete `zh-CN`, `zh-TW`, and `en` catalogs. The release save stores the selected language as a preference. A save without a language uses the Cocos system locale on first load, distinguishing Simplified and Traditional Chinese locale/script codes and falling back to English. Language buttons on the title and pause menus cycle through all three choices and immediately refresh every visible static and dynamic label without restarting the level.

Alternative considered: maintain separate localized Cocos scenes. Rejected because this project creates UI procedurally and duplicated scenes would drift as release flows change.

## Risks / Trade-offs

- [Action replay fails after future rule changes] -> Include a save schema version, validate every replay result, and fall back to the saved level start while preserving unlocked progress.
- [Procedural UI becomes too large] -> Keep save, flow policy, onboarding metadata, and title animation in focused components rather than adding all logic to `GameplayBootstrap`.
- [Title animation competes with menu readability or mobile performance] -> Use a small board, one block, existing materials, fixed camera, and stop all attract tweens outside title mode.
- [Tutorials interrupt returning players] -> Persist acknowledgements and expose manual replay through How to Play.
- [Chinese text overflows compact controls] -> Keep concise translations, preserve stable control dimensions, and verify all three catalogs at phone and tablet landscape sizes.
- [Stage loading bypasses progression] -> The stage list enables only unlocked levels; a valid authored passcode remains an explicit direct-access path.
- [Old automatic-restart specification conflicts] -> Treat this change as the release contract and reconcile the earlier active menu change before archiving.

## Migration Plan

1. Add and test pure save-data validation, action replay, progression, and onboarding topic selection.
2. Introduce the expanded controller modes while retaining the existing title UI until flow tests pass.
3. Replace automatic failure/completion transitions with stable result overlays.
4. Build the release title, stage-load, How to Play, and Credits surfaces and add the attract loop.
5. Add lifecycle persistence and mobile back behavior.
6. Run browser and HarmonyOS device acceptance checks, then reconcile and archive superseded OpenSpec changes.

Rollback can remove the local save key and return the controller to title without affecting level definitions or puzzle rules. Unknown or malformed save payloads are ignored rather than blocking startup.

## Open Questions

- Store-facing localized product descriptions and screenshots still need final review before submission.
- HarmonyOS phone model and minimum target API still need to be recorded during final device acceptance.

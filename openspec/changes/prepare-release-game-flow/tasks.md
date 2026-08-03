## 1. Release State And Persistence

- [x] 1.1 Define versioned release-save, current-run, progression, preference, and tutorial-topic data types in both shared source trees.
- [x] 1.2 Implement save validation, safe defaults, partial progression recovery, and deterministic action-log replay.
- [x] 1.3 Add a Cocos local-storage repository with load, save, reset-run, and preference update operations.
- [x] 1.4 Add pure tests for valid resume, bridge and split replay, malformed saves, unsupported versions, and progression preservation.

## 2. Controller Flow

- [x] 2.1 Replace the three-value game mode with explicit title, stage-select, how-to-play, credits, playing, paused, tutorial, failed, and completed modes.
- [x] 2.2 Track accepted puzzle actions and save after moves, active-cube switches, stage loads, and progression changes.
- [x] 2.3 Implement Start New Game confirmation, exact Resume Game, unlocked-stage loading, and passcode direct access.
- [x] 2.4 Replace automatic failure restart with Retry and Quit to Menu result actions.
- [x] 2.5 Replace automatic completion advance with Continue, Replay, and Quit to Menu result actions and next-stage unlocking.
- [x] 2.6 Ensure every blocking mode clears buffered input and stops active elapsed-time accumulation.

## 3. Release Menu And Results UI

- [x] 3.1 Redesign the title UI with Start New Game, Resume Game, Load Stage, How to Play, Toggle Sound, and Credits actions.
- [x] 3.2 Add a lightweight original 3D attract board and looping block animation behind the title UI.
- [x] 3.3 Add the unlocked-stage selector with locked states and integrated passcode entry feedback.
- [x] 3.4 Add failure and stage-complete overlays with stable mobile hit areas and result statistics.
- [x] 3.5 Add Credits and new-game confirmation surfaces and consistent back navigation.
- [ ] 3.6 Verify title and overlay layouts on landscape phone, tablet, and wide browser viewports without overlap.

## 4. Contextual Onboarding

- [x] 4.1 Define ordered onboarding topics and derive level-relevant topics from production level mechanics.
- [x] 4.2 Implement the blocking tutorial presenter with concise rule copy, visual symbols, Next, Got It, and Skip actions.
- [x] 4.3 Add first-level swipe and goal teaching before unassisted input.
- [x] 4.4 Add first-use fragile, soft-switch, hard-switch, bridge, split, active-cube, and recombination teaching.
- [x] 4.5 Add the replayable How to Play topic browser without changing automatic tutorial acknowledgements.
- [x] 4.6 Add tests for topic ordering, first-use suppression, persistence, and new-game behavior.

## 5. Lifecycle And Preferences

- [x] 5.1 Persist and restore sound preference and keep menu labels synchronized.
- [x] 5.2 Save and pause active play on Cocos hide events without auto-resuming on show.
- [x] 5.3 Implement platform back behavior for gameplay, pause, secondary menus, and result surfaces.
- [ ] 5.4 Validate save behavior during failure, completion, split mode, bridge changes, and application interruption.
- [x] 5.5 Add typed Simplified Chinese, Traditional Chinese, and English message catalogs with locale detection and English fallback.
- [x] 5.6 Persist the selected language and preserve compatibility with saves created before localization.
- [x] 5.7 Add title and pause language controls and refresh every static and dynamic player-facing label immediately after switching.
- [x] 5.8 Localize onboarding, How to Play, HUD, passcode feedback, Credits, failure, and completion content.
- [x] 5.9 Add pure tests for locale detection, language cycling, catalog completeness, fallback, and language preference persistence.

## 6. Release Package And Documentation

- [x] 6.1 Define the release product name, semantic version, build number, package identifier, and minimum HarmonyOS target.
- [ ] 6.2 Add original application icon and launch artwork for HarmonyOS phone and tablet builds.
- [x] 6.3 Update HarmonyOS build documentation to match the current menu, controls, vibration bridge, signing, and generated project path.
- [x] 6.4 Add privacy, asset provenance, store metadata, screenshot, and release-candidate checklists.
- [ ] 6.5 Reconcile superseded automatic-restart and first-playable OpenSpec changes before release archival.

## 7. Verification

- [x] 7.1 Run TypeScript checks, pure engine/save/onboarding tests, campaign validation, and OpenSpec validation.
- [ ] 7.2 Review title animation, every overlay, lifecycle behavior, and representative mechanics in browser preview.
- [ ] 7.3 Complete and record all 33-level regression and worst-case performance checks on the HarmonyOS Pad.
- [ ] 7.4 Complete and record safe-area, lifecycle, input, audio, vibration, and campaign smoke checks on a supported HarmonyOS phone.
- [ ] 7.5 Produce a signed release candidate and verify clean install, upgrade, relaunch, resume, and save-corruption recovery.
- [ ] 7.6 Verify all three languages on landscape phone and tablet viewports without missing glyphs, truncation, or overlap.

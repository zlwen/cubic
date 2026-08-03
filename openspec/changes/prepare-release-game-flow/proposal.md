## Why

The game now has a complete 33-level ruleset and a verified HarmonyOS gameplay loop, but it still behaves like a playable build rather than a releasable product: first-time players are not taught the mechanics, failure restarts without a decision point, the title screen has no durable progress or resume flow, and release lifecycle and device checks remain incomplete. These gaps must be closed before store packaging and wider device testing.

## What Changes

- Add contextual, one-time onboarding for swipe movement, the goal hole, fragile tiles, soft and hard switches, bridges, splitting, active-cube switching, and recombination.
- Add a replayable How to Play reference from the title and pause flows.
- **BREAKING** Replace automatic restart after failure with a blocking failure result screen offering Retry and Quit to Menu.
- Add a stage-complete result screen with move/time results and Continue, Replay, and Quit to Menu actions.
- Redesign the title screen around an original animated 3D attract scene and a release menu containing Start New Game, Resume Game, Load Stage, How to Play, Toggle Sound, and Credits.
- Add versioned local save data for exact run resume, unlocked progression, elapsed time, sound preference, and completed onboarding topics.
- Add complete Simplified Chinese, Traditional Chinese, and English UI localization with a persisted language option on title and pause menus.
- Add an unlocked-stage selector while retaining original four-letter passcode access.
- Pause and save safely across application background/foreground transitions and define mobile back-navigation behavior.
- Add release checks for all 33 levels, phone/tablet safe areas, package identity, icons, splash assets, versioning, signing, performance, and store documentation.

## Capabilities

### New Capabilities

- `release-game-flow`: Release title menu, durable progression, exact resume, stage loading, failure and completion result states, and navigation behavior.
- `contextual-onboarding`: First-use contextual teaching and a replayable mechanic reference.
- `mobile-release-readiness`: Lifecycle handling, device acceptance criteria, package identity, assets, performance checks, and release documentation.
- `game-localization`: System-language selection, persisted language switching, and complete localized player-facing copy.

### Modified Capabilities

- None. The new release game-flow contract supersedes the earlier unarchived automatic-restart behavior during reconciliation.

## Impact

- Extends `GameplayController` from three modes to an explicit release-flow state machine.
- Adds a platform-independent versioned save model plus Cocos local-storage integration.
- Expands procedural Cocos UI creation with title attract presentation, stage selection, tutorials, and result overlays.
- Changes failure and completion timing and therefore the input-lock, timer, audio, vibration, and persistence integration points.
- Adds tests for save validation/migration, progression, tutorial eligibility, and game-flow decisions.
- Adds localization tests for locale detection, language cycling, fallback behavior, and save compatibility.
- Updates HarmonyOS build notes and requires final browser, HarmonyOS Pad, and HarmonyOS phone verification.

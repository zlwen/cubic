## Context

Gameplay currently starts immediately, uses four bottom controls, and has no paused or title-menu state. The controller owns puzzle state but the bootstrap builds all UI procedurally, so navigation state must remain explicit without introducing a scene transition or external UI framework. The project targets fixed landscape mobile layouts and duplicates level data under `src` and `assets/scripts/shared`.

## Goals / Non-Goals

**Goals:**

- Replace the bottom command bar with a compact upper-left menu command and upper-right statistics.
- Provide title and pause menus that block puzzle gestures.
- Track per-level elapsed time only while active gameplay is running.
- Add validated original passcodes and direct level loading.
- Preserve a complete gameplay loop through automatic failure restart and completion advance.

**Non-Goals:**

- Copying Bloxorz passcodes, branding, menu artwork, or exact UI composition.
- Persistent save data, best-time records, settings storage, keyboard navigation, or online accounts.
- Adding more levels or changing rolling-block rules.

## Decisions

### Keep navigation in the gameplay scene

The title and pause menus will be full-screen UI roots in the existing scene. This avoids Cocos scene-loading complexity and keeps the generated runtime hierarchy self-contained. `GameplayController` will own a small `title`, `playing`, or `paused` mode and activate the appropriate roots.

### Use an EditBox for passcode entry

The title menu will use Cocos `EditBox` with uppercase normalization. A dedicated lookup helper will trim input and compare case-insensitively. Invalid input remains on the title menu and shows a concise error.

### Store passcodes as authored level metadata

Each level receives a unique four-letter original passcode. Content validation checks format and uniqueness, and tests verify every passcode resolves to exactly one level. Deriving codes from indexes was rejected because visible authored codes are easier to review and preserve.

### Make the timer controller-owned

The controller increments elapsed seconds only in `playing` mode while the puzzle is unresolved and the block is not transitioning after completion or failure. The displayed timer uses `MM:SS` and resets whenever a level is loaded or automatically restarted.

### Replace removed recovery buttons with automatic flow

A failed fall restarts the current level after its animation. A completed goal drop advances to the next level; completing the final level returns to the title menu. This prevents dead ends after removing Restart and Next.

### Make sound state runtime-local

`AudioController` will expose one toggle that mutes both effect and ambient sources and returns the current enabled state. The pause-menu label reflects that state. Persistence is deferred until save/settings storage exists.

## Risks / Trade-offs

- [Native text input behavior varies] -> Use the built-in Cocos `EditBox`, short ASCII codes, and verify on HarmonyOS.
- [Menus could leak swipe gestures] -> Reject moves outside `playing` mode and treat EditBox and Button targets as UI interactions.
- [Automatic transitions can overlap input] -> Keep the block busy during animation and schedule only one restart or advance callback.
- [Timer drifts while backgrounded] -> Count active Cocos update time; native lifecycle-accurate timing remains out of scope.
- [Added goal rings can make HUD framing tight] -> Retain fixed camera bounds and verify all levels in landscape preview.

## Migration Plan

1. Add passcodes to both shared level copies and extend validation tests.
2. Add sound toggle and controller navigation/timing state.
3. Replace the procedural HUD and create title and pause overlays.
4. Verify browser behavior, then rebuild and review on HarmonyOS Pad.

Rollback restores the previous bootstrap/controller UI and removes passcode metadata; puzzle movement and native bridges remain unchanged.

## Open Questions

- Whether passcodes and sound preference should persist once save storage is introduced.

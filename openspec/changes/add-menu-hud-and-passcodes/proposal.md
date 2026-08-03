## Why

The current bottom command bar occupies valuable landscape space and exposes development controls that do not match the intended game flow. The game also lacks a title menu, pause navigation, elapsed-time HUD, and a lightweight way to return directly to a known level.

## What Changes

- Remove the bottom Undo, Reset, Replay, and Next controls.
- Add a safe-area-aware `MENU` command at the upper left.
- Add a pause menu with Return to Game, Toggle Sound, and Quit to Menu actions.
- Add a title menu with Start Game and passcode entry.
- Show level number, move count, and elapsed level time in a compact upper-right HUD.
- Assign every original chapter-one level a unique original passcode and allow case-insensitive direct access.
- Automatically restart after a failed fall and automatically advance after a successful goal drop.
- Pause gameplay input and the level timer while a menu is open.

## Capabilities

### New Capabilities

- `menu-and-gameplay-hud`: Title, pause, sound, timer, automatic progression, and landscape HUD behavior.
- `level-passcodes`: Unique original per-level passcodes, validation, and direct level selection.

### Modified Capabilities

None.

## Impact

- Procedural Cocos UI in `GameplayBootstrap` and gameplay state coordination in `GameplayController`.
- Audio mute state in `AudioController`.
- Chapter-one level metadata, validation, and puzzle content tests in both shared source trees.
- No new runtime dependency and no native HarmonyOS permission change.

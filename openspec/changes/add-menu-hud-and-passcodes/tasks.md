## 1. Level Passcodes

- [x] 1.1 Add unique four-letter original passcodes to chapter-one level metadata in both shared source trees.
- [x] 1.2 Add case-insensitive passcode lookup and validate format and uniqueness.
- [x] 1.3 Add tests for valid, lowercase, whitespace-padded, malformed, and unknown passcodes.

## 2. Navigation And Flow

- [x] 2.1 Add explicit title, playing, and paused controller modes that block gestures outside active gameplay.
- [x] 2.2 Add automatic current-level restart after failure and next-level or title-menu transition after completion.
- [x] 2.3 Add active level timing that pauses in menus and resets when a level starts.
- [x] 2.4 Add runtime sound toggling for ambient and effect sources.

## 3. Procedural UI

- [x] 3.1 Remove the four-button bottom command bar.
- [x] 3.2 Add a safe-area upper-left Menu command and upper-right level, moves, and time HUD.
- [x] 3.3 Add the blocking pause menu with Return to Game, Toggle Sound, and Quit to Menu.
- [x] 3.4 Add the title menu with Start Game, passcode input, submission, and validation feedback.

## 4. Verification

- [x] 4.1 Run TypeScript checks, puzzle-engine tests, and strict OpenSpec validation.
- [ ] 4.2 Review menu input, timer, sound toggle, automatic transitions, and passcode entry in browser preview.
- [ ] 4.3 Build and verify the updated interface and text input on the HarmonyOS Pad.

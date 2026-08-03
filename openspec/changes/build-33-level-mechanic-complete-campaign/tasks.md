## 1. Dynamic Engine Contract

- [x] 1.1 Expand shared level and puzzle-state types for fragile tiles, switches, bridges, split cubes, bridge states, and recorded puzzle actions.
- [x] 1.2 Extend level validation for dynamic coordinate references, unique bridge ids, supported split destinations, and valid switch actions.
- [x] 1.3 Keep `src` and Cocos shared type and validation copies synchronized.

## 2. Classic Mechanics

- [x] 2.1 Implement orientation-sensitive fragile support.
- [x] 2.2 Implement soft and hard switch activation with enable, disable, and toggle bridge actions.
- [x] 2.3 Implement active and inactive bridge support in move, undo, and restart state.
- [x] 2.4 Implement split activation, active-cube movement, cube selection, and orthogonal recombination.
- [x] 2.5 Add focused engine tests for every mechanic and mixed dynamic transitions.

## 3. Cocos Presentation And Input

- [x] 3.1 Render distinct fragile, soft-switch, hard-switch, split, and bridge geometry with mobile-readable materials.
- [x] 3.2 Refresh bridge visibility from every dynamic puzzle state.
- [x] 3.3 Present two split cubes, active selection, movement, failure, and recombination from engine results.
- [x] 3.4 Add and wire a contextual upper split-cube selector that remains hidden in whole-block mode.
- [x] 3.5 Include bridge cells and split destinations in fixed orthographic camera framing.

## 4. Thirty-Three-Level Campaign

- [x] 4.1 Define five mechanic and difficulty bands covering all 33 original levels.
- [x] 4.2 Author levels 1-7 for rolling fundamentals and introductory bridge switching.
- [x] 4.3 Author levels 8-14 for fragile support and multi-bridge state planning.
- [x] 4.4 Author levels 15-21 for split fundamentals and recombination routes.
- [x] 4.5 Author levels 22-28 for mixed switches, fragile tiles, bridges, and splitting.
- [x] 4.6 Author levels 29-33 as long-form combined-mechanic challenges.
- [x] 4.7 Assign 33 unique original titles and passcodes and update HUD/menu campaign counts.

## 5. Campaign Validation

- [x] 5.1 Execute every recorded `PuzzleAction` solution through the production engine.
- [x] 5.2 Add bounded dynamic-state search checks and difficulty progression assertions.
- [x] 5.3 Verify all static tiles, possible bridge cells, goals, and split destinations stay within mobile board limits.

## 6. Verification

- [x] 6.1 Run TypeScript checks, engine tests, shared-copy comparisons, and strict OpenSpec validation.
- [ ] 6.2 Review all mechanics and 33 levels in browser preview.
- [ ] 6.3 Build and verify the complete campaign on the HarmonyOS Pad.

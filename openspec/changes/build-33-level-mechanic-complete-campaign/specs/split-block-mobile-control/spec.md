## ADDED Requirements

### Requirement: Split-cube presentation
The Cocos presentation SHALL display two cube bodies at their engine coordinates and visibly distinguish the active cube.

#### Scenario: Split begins
- **WHEN** the engine enters split mode
- **THEN** the whole block is hidden and both cubes become visible at their configured destinations

#### Scenario: Cubes recombine
- **WHEN** the engine returns to whole-block mode
- **THEN** both cubes hide and the correctly oriented whole block appears

### Requirement: Contextual active-cube control
The landscape HUD SHALL expose an active-cube switch control only while split, without restoring the removed bottom command bar.

#### Scenario: Player switches cube
- **WHEN** the player selects the contextual control in split mode
- **THEN** the other cube becomes active without incrementing the move count

### Requirement: Dynamic board presentation
Fragile tiles, soft switches, hard switches, split tiles, and bridge state SHALL remain distinguishable under the fixed mobile camera.

#### Scenario: Bridge state changes
- **WHEN** a switch enables or disables a bridge group
- **THEN** the corresponding bridge geometry updates before the next player move

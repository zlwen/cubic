## ADDED Requirements

### Requirement: Fragile tile support
The engine SHALL allow a lying whole block or split cube on a fragile tile but SHALL fail a standing whole block on that tile.

#### Scenario: Whole block stands on fragile tile
- **WHEN** a move leaves the unsplit block standing on a fragile tile
- **THEN** the level enters the failed state

#### Scenario: Block lies across fragile tile
- **WHEN** a lying block occupies a fragile tile and every occupied cell is otherwise supported
- **THEN** the move remains valid

### Requirement: Orientation-sensitive switches
The engine SHALL trigger soft switches from any landed block part and hard switches only from a standing unsplit block.

#### Scenario: Lying block reaches soft switch
- **WHEN** either occupied cell lands on a soft switch
- **THEN** every configured bridge action is applied once

#### Scenario: Lying block reaches hard switch
- **WHEN** a non-standing or split block occupies a hard switch
- **THEN** the switch does not change bridge state

### Requirement: Configurable bridges
The engine SHALL support initially active or inactive bridge groups and enable, disable, and toggle switch actions.

#### Scenario: Bridge is inactive
- **WHEN** an occupied cell requires an inactive bridge cell for support
- **THEN** the block falls and the level fails

#### Scenario: Switch changes a bridge
- **WHEN** a qualifying block lands on a configured switch
- **THEN** the targeted bridge state changes deterministically for subsequent moves

### Requirement: Split and recombination
The engine SHALL split a standing whole block at a configured split tile into two cubes, move only the selected cube, permit active-cube switching, and recombine orthogonally adjacent cubes.

#### Scenario: Whole block activates split tile
- **WHEN** it stands on a configured split tile
- **THEN** two cubes appear at the configured supported destinations and one becomes active

#### Scenario: Active cube moves
- **WHEN** a direction is applied in split mode
- **THEN** only the active cube advances by one grid cell

#### Scenario: Cubes become adjacent
- **WHEN** a valid move leaves the cubes orthogonally adjacent
- **THEN** they recombine into the corresponding lying whole block

### Requirement: Deterministic dynamic state
Undo, restart, move results, and solution validation SHALL include split state and all bridge states.

#### Scenario: Dynamic level restarts
- **WHEN** restart is requested after switches or splitting
- **THEN** the initial whole block, initial bridge states, and empty history are restored

## ADDED Requirements

### Requirement: Deterministic block state model
The system SHALL model the player block as a deterministic grid state with position, orientation, occupied cells, step count, and level identifier.

#### Scenario: Standing block occupies one cell
- **WHEN** a level starts with the block in standing orientation
- **THEN** the puzzle engine reports exactly one occupied grid cell

#### Scenario: Lying block occupies two cells
- **WHEN** the block is lying along the X or Z axis
- **THEN** the puzzle engine reports exactly two adjacent occupied grid cells on that axis

### Requirement: Grid-based rolling movement
The system SHALL process each player move as a discrete roll in one cardinal grid direction.

#### Scenario: Valid roll updates state
- **WHEN** the player requests a roll that lands on supported tiles
- **THEN** the puzzle engine updates the block position and orientation to the next discrete state

#### Scenario: Invalid roll is rejected or fails deterministically
- **WHEN** the player requests a roll that would leave the board or land on unsupported cells
- **THEN** the puzzle engine returns a deterministic invalid or failure result without applying an ambiguous partial state

### Requirement: Level data loading
The system SHALL load levels from structured data that defines tiles, start state, goal cells, and optional mechanisms.

#### Scenario: Valid level loads
- **WHEN** level data includes required tiles, a valid start state, and a valid goal
- **THEN** the puzzle engine initializes a playable level state

#### Scenario: Invalid level is rejected
- **WHEN** level data references a start or goal cell not present in the board
- **THEN** the system rejects the level data with a clear validation error

### Requirement: Win and failure conditions
The system SHALL determine win and failure conditions from puzzle state and tile rules.

#### Scenario: Goal reached while standing
- **WHEN** the block is standing on the goal cell after a valid move
- **THEN** the puzzle engine marks the level as completed

#### Scenario: Block falls
- **WHEN** the block has no valid support after a move result
- **THEN** the puzzle engine marks the level as failed and exposes the fall result to the presentation layer

### Requirement: Undo and restart
The system SHALL support undoing previous valid moves and restarting the current level.

#### Scenario: Undo restores previous state
- **WHEN** the player requests undo after at least one valid move
- **THEN** the puzzle engine restores the previous block state and step count

#### Scenario: Restart restores initial state
- **WHEN** the player requests restart
- **THEN** the puzzle engine restores the initial level state and clears transient move history

### Requirement: Original content
The system MUST use original level layouts, names, visual identity, and copy for the rolling-block puzzle.

#### Scenario: First level set is original
- **WHEN** the first playable level list is reviewed
- **THEN** it contains original layouts and names rather than copied Bloxorz levels or branding

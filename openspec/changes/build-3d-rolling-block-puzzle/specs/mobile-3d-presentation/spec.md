## ADDED Requirements

### Requirement: Fixed readable 3D camera
The system SHALL present gameplay through a fixed or smoothly-following 3D camera that keeps the active board readable on mobile screens.

#### Scenario: Level starts with readable board
- **WHEN** a level begins
- **THEN** the camera frames the start area and relevant board tiles without requiring player camera manipulation

#### Scenario: Block moves across board
- **WHEN** the block rolls to a new area
- **THEN** the camera preserves board readability through fixed framing or smooth follow behavior

### Requirement: Touch-first controls
The system SHALL support mobile touch input for cardinal rolling moves and primary puzzle actions.

#### Scenario: Swipe moves block
- **WHEN** the player swipes in a recognized cardinal direction
- **THEN** the game requests the corresponding puzzle-engine move

#### Scenario: UI actions are available
- **WHEN** a level is active
- **THEN** the player can access undo and restart actions through touch-friendly controls

### Requirement: Roll animation reflects engine result
The system SHALL animate the block roll according to the accepted puzzle-engine move result.

#### Scenario: Valid move animates to final state
- **WHEN** the puzzle engine accepts a move
- **THEN** the presentation layer animates the block to the resulting grid position and orientation

#### Scenario: Failed move communicates loss
- **WHEN** the puzzle engine returns a fall result
- **THEN** the presentation layer plays a visible failure animation and exposes a restart or recovery action

### Requirement: Visual feedback for puzzle state
The system SHALL provide clear visual feedback for tile types, move outcomes, level completion, failure, and step count.

#### Scenario: Step count changes
- **WHEN** a valid move completes
- **THEN** the UI displays the updated step count

#### Scenario: Level completes
- **WHEN** the puzzle engine marks a level completed
- **THEN** the presentation layer shows a victory state and a way to continue or replay

### Requirement: Mobile performance budget
The system SHALL maintain a smooth mobile gameplay experience on the target HarmonyOS device for the first playable levels.

#### Scenario: First playable runs on device
- **WHEN** a first playable level is run on the target HarmonyOS phone
- **THEN** gameplay remains responsive during input, rolling animation, camera movement, and UI updates

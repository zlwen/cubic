## ADDED Requirements

### Requirement: Release title menu
The game SHALL present an original title screen with Start New Game, Resume Game, Load Stage, How to Play, Toggle Sound, and Credits actions over a restrained animated representation of actual gameplay.

#### Scenario: No resumable run exists
- **WHEN** the title screen opens without a valid current run
- **THEN** Resume Game is visibly unavailable while all other applicable actions remain usable

#### Scenario: Resumable run exists
- **WHEN** the title screen opens with a valid saved run
- **THEN** Resume Game identifies the saved stage and restores it when selected

### Requirement: Versioned local progress
The game SHALL persist a versioned local record containing unlocked progression, the current deterministic action log, active elapsed time, sound preference, and acknowledged tutorial topics.

#### Scenario: Accepted action completes
- **WHEN** a valid move or split-cube switch changes the current run
- **THEN** the updated action log and elapsed time are saved

#### Scenario: Save payload is invalid
- **WHEN** stored data is malformed, unsupported, or cannot be replayed legally
- **THEN** startup remains usable and falls back to safe defaults while preserving any independently valid progression fields

### Requirement: New and resumed campaigns
The game SHALL distinguish starting a new campaign from resuming the current saved run.

#### Scenario: Existing progress is replaced
- **WHEN** the player confirms Start New Game while campaign progress exists
- **THEN** the current stage and action log reset to level one without resetting sound or tutorial preferences

#### Scenario: Saved run resumes
- **WHEN** the player selects Resume Game
- **THEN** the saved level, accepted actions, bridge and split state, move count, and elapsed time are restored deterministically

### Requirement: Stage loading
The game SHALL expose unlocked stages and retain case-insensitive authored passcode access.

#### Scenario: Unlocked stage is selected
- **WHEN** the player chooses an unlocked stage
- **THEN** that stage starts from its initial state and becomes the current saved run

#### Scenario: Locked stage is selected without a passcode
- **WHEN** the player attempts to choose a locked stage from the stage list
- **THEN** the stage remains unavailable

#### Scenario: Valid passcode is submitted
- **WHEN** the player submits a valid authored passcode
- **THEN** its associated stage starts even when it was not previously unlocked

### Requirement: Deliberate failure recovery
The game SHALL finish the physical failure animation before showing a blocking failure result with Retry and Quit to Menu actions.

#### Scenario: Player retries
- **WHEN** the player selects Retry on the failure result
- **THEN** the current level restarts with its initial mechanisms, zero moves, and zero elapsed time

#### Scenario: Player quits after failure
- **WHEN** the player selects Quit to Menu
- **THEN** the title screen opens and Resume Game points to the last valid saved run

### Requirement: Deliberate completion flow
The game SHALL show a blocking stage-complete result containing moves and elapsed time after the goal animation.

#### Scenario: Player continues
- **WHEN** the player selects Continue before the final stage
- **THEN** the next stage starts and is available in the stage selector

#### Scenario: Player replays
- **WHEN** the player selects Replay
- **THEN** the completed stage starts again from its initial state

#### Scenario: Final stage is complete
- **WHEN** the player selects Continue after the final stage
- **THEN** the title screen opens with the completed campaign progress retained

### Requirement: Exclusive flow input
The game SHALL accept puzzle gestures and advance the level timer only while the explicit flow mode is playing.

#### Scenario: Blocking surface is visible
- **WHEN** title, stage selection, tutorial, pause, failure, completion, How to Play, or Credits is active
- **THEN** puzzle gestures, buffered moves, and active timer accumulation are blocked

## ADDED Requirements

### Requirement: Landscape gameplay HUD
The game SHALL remove the bottom command bar, show a Menu command at the upper left, and show level number, move count, and elapsed level time at the upper right.

#### Scenario: Active level is displayed
- **WHEN** gameplay is active in landscape mode
- **THEN** the upper controls remain inside the safe area and no bottom gameplay controls are visible

#### Scenario: Player makes a move
- **WHEN** a roll completes
- **THEN** the move count updates without moving or overlapping the HUD

### Requirement: Pause menu
The game SHALL provide Return to Game, Toggle Sound, and Quit to Menu actions in a blocking pause menu.

#### Scenario: Player opens Menu
- **WHEN** the player selects the upper-left Menu command
- **THEN** puzzle gestures and elapsed-time accumulation stop and the three pause actions become visible

#### Scenario: Player returns
- **WHEN** the player selects Return to Game
- **THEN** the pause menu closes and the same level state resumes

#### Scenario: Player toggles sound
- **WHEN** the player selects Toggle Sound
- **THEN** ambient and effect audio change between enabled and muted and the menu shows the current state

#### Scenario: Player quits
- **WHEN** the player selects Quit to Menu
- **THEN** the current run stops and the title menu becomes visible

### Requirement: Complete button-free game loop
The system SHALL recover from failure and advance after completion without bottom controls.

#### Scenario: Block falls outside the board
- **WHEN** the failure animation finishes
- **THEN** the current level restarts with zero moves and a reset timer

#### Scenario: Block enters the goal hole
- **WHEN** the goal-drop animation finishes
- **THEN** the next level loads automatically, or the title menu appears after the final level

### Requirement: Active gameplay timer
The system SHALL show elapsed active level time in `MM:SS` format.

#### Scenario: Gameplay is running
- **WHEN** one active second elapses
- **THEN** the displayed time advances by one second

#### Scenario: A menu is visible
- **WHEN** the title or pause menu is open
- **THEN** the displayed level time does not advance

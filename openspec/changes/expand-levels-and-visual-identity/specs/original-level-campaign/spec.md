## ADDED Requirements

### Requirement: Original first chapter
The system SHALL provide ten ordered, original rolling-block levels that do not reproduce protected source names, layouts, artwork, UI copy, or branding.

#### Scenario: Player advances through chapter one
- **WHEN** the player completes a level and selects Next
- **THEN** the system loads the next level in the ten-level chapter and shows its position and original title

### Requirement: Solvable campaign content
Every chapter-one level MUST pass static validation and include a recorded solution that reaches its goal through the production puzzle engine.

#### Scenario: Campaign validation runs
- **WHEN** automated content tests execute every recorded solution
- **THEN** every level finishes in the completed state without unsupported intermediate positions

### Requirement: Progressive spatial challenge
The chapter SHALL introduce orientation control before requiring longer route planning, edge recovery, and multi-turn standing landings.

#### Scenario: Player progresses beyond introductory levels
- **WHEN** the player reaches later chapter-one levels
- **THEN** the required solution uses more varied direction changes and landing setup than the opening levels

### Requirement: Mobile board bounds
Every chapter-one board SHALL remain fully readable within the fixed landscape camera on the target mobile viewport.

#### Scenario: A chapter level is loaded
- **WHEN** the renderer frames the level from its tile bounds
- **THEN** all playable tiles, the block, and the goal remain visible without camera tracking

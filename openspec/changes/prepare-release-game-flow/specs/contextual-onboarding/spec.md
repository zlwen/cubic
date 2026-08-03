## ADDED Requirements

### Requirement: First-use movement teaching
The game SHALL teach screen-aligned swipe movement and the upright goal-hole condition before an unassisted first campaign attempt.

#### Scenario: New player starts level one
- **WHEN** movement and goal topics have not been acknowledged
- **THEN** a blocking visual sequence demonstrates cardinal swiping and explains that the whole block must stand over the hole to complete a stage

### Requirement: Mechanic-first contextual teaching
The game SHALL present concise one-time visual guidance when fragile tiles, soft switches, hard switches, bridges, splitting, active-cube control, or recombination first become relevant.

#### Scenario: Unseen mechanic is present
- **WHEN** a level loads containing an onboarding topic not yet acknowledged
- **THEN** the game highlights or illustrates that mechanic, states its operative rule, and blocks movement until dismissed

#### Scenario: Mechanic was acknowledged
- **WHEN** a later level contains an already acknowledged topic
- **THEN** gameplay starts without repeating that automatic topic

### Requirement: Accurate mechanic rules
The onboarding content SHALL match production engine behavior for every special tile.

#### Scenario: Player reviews special tiles
- **WHEN** fragile, switch, bridge, or split guidance is displayed
- **THEN** it states that standing breaks fragile tiles, any landed part triggers soft switches, only a standing unsplit block triggers hard switches, switches control bridges, standing on a split tile creates two cubes, and orthogonally adjacent cubes recombine

### Requirement: Replayable How to Play
The game SHALL provide a How to Play view that can replay every mechanic topic without altering campaign progression or tutorial acknowledgements.

#### Scenario: Returning player opens How to Play
- **WHEN** a topic is selected from the reference view
- **THEN** its visual and rule are shown and closing the view returns to the previous menu state

### Requirement: Tutorial preference persistence
The game SHALL persist acknowledged automatic tutorial topic ids separately from campaign run data.

#### Scenario: New game starts after tutorials were completed
- **WHEN** Start New Game resets campaign progression
- **THEN** acknowledged tutorials remain suppressed unless the player opens How to Play manually

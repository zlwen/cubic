## ADDED Requirements

### Requirement: Unique original level passcodes
Every chapter-one level SHALL have a unique original four-letter ASCII passcode that is not copied from the reference game.

#### Scenario: Campaign content is validated
- **WHEN** automated level validation runs
- **THEN** every passcode matches four uppercase letters and no two levels share a passcode

### Requirement: Passcode level access
The title menu SHALL accept a passcode case-insensitively and load its associated level.

#### Scenario: Valid passcode is entered
- **WHEN** the player submits a known passcode with optional surrounding whitespace or lowercase letters
- **THEN** the corresponding level starts with zero moves and a reset timer

#### Scenario: Invalid passcode is entered
- **WHEN** the player submits an unknown or malformed passcode
- **THEN** the title menu remains visible and shows an invalid-code message

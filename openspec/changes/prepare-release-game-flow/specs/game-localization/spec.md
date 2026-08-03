## ADDED Requirements

### Requirement: Supported languages
The game SHALL provide complete player-facing UI in Simplified Chinese, Traditional Chinese, and English.

#### Scenario: Player selects a supported language
- **WHEN** the selected language is `zh-CN`, `zh-TW`, or `en`
- **THEN** menus, HUD, stage loading, passcode feedback, onboarding, How to Play, Credits, failure, and completion surfaces use that language

### Requirement: Initial language selection
The game SHALL choose an initial language from the system locale when no valid language preference has been saved.

#### Scenario: Chinese system locale is detected
- **WHEN** the system locale identifies Simplified or Traditional Chinese
- **THEN** the corresponding Chinese catalog is selected

#### Scenario: Unsupported system locale is detected
- **WHEN** the system locale is neither Simplified Chinese, Traditional Chinese, nor English
- **THEN** English is selected as the safe fallback

### Requirement: Immediate language switching
The game SHALL expose a language option from both title and pause menus and apply it without restarting the application or current stage.

#### Scenario: Player changes language
- **WHEN** the language option is activated
- **THEN** the next supported language is saved and every visible static and dynamic label refreshes immediately while puzzle state remains unchanged

### Requirement: Durable compatible language preference
The game SHALL persist the language independently from campaign progress and remain compatible with saves created before localization.

#### Scenario: Existing save has no language field
- **WHEN** a valid older release save is loaded
- **THEN** its run, progression, sound, and tutorial data remain valid while language is initialized from the system locale

#### Scenario: New campaign is started
- **WHEN** campaign progress is reset
- **THEN** the selected language remains unchanged

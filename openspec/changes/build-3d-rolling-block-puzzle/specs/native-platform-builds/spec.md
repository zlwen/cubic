## ADDED Requirements

### Requirement: HarmonyOS Next first target
The system SHALL support building and running the first playable version on HarmonyOS Next before Android and iOS release work begins.

#### Scenario: HarmonyOS project exported
- **WHEN** the Cocos project is built for HarmonyOS Next
- **THEN** the generated native project can be opened in DevEco Studio

#### Scenario: HarmonyOS device run
- **WHEN** an authorized HarmonyOS phone is connected and visible through hdc
- **THEN** the generated project can be deployed or run from DevEco Studio for device testing

### Requirement: Platform-independent gameplay core
The system SHALL keep puzzle rules, level data parsing, and move validation independent from HarmonyOS, Android, and iOS native APIs.

#### Scenario: Puzzle engine used outside native runtime
- **WHEN** puzzle engine tests run in a non-native TypeScript environment
- **THEN** movement, undo, restart, win, and failure behavior can be verified without Cocos native platform APIs

### Requirement: Isolated native platform adapters
The system SHALL isolate platform-specific integrations behind small adapter boundaries.

#### Scenario: HarmonyOS-only behavior is added
- **WHEN** a HarmonyOS-specific feature or configuration is required
- **THEN** it is implemented outside the core puzzle engine and presentation-independent logic

### Requirement: Future Android and iOS portability
The system SHALL avoid first-version implementation choices that prevent later Android and iOS builds from sharing the same gameplay code.

#### Scenario: Adding Android build target
- **WHEN** Android publishing is introduced after the HarmonyOS first playable
- **THEN** the same puzzle engine, level data, and Cocos scene logic remain reusable

#### Scenario: Adding iOS build target
- **WHEN** iOS publishing is introduced after the HarmonyOS first playable
- **THEN** platform-specific changes are limited to build configuration, signing, native adapters, and device-specific polish

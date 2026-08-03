## ADDED Requirements

### Requirement: Lifecycle-safe play
The game SHALL save valid progress and pause active gameplay when the application is backgrounded or interrupted.

#### Scenario: Application hides during gameplay
- **WHEN** the native application enters the background while a level is active
- **THEN** the last valid run is saved, puzzle input stops, and returning to the app requires an explicit resume from pause

### Requirement: Mobile back navigation
The game SHALL handle mobile back navigation according to the topmost flow state.

#### Scenario: Back is used during gameplay
- **WHEN** the platform back action occurs while playing
- **THEN** the pause menu opens instead of exiting immediately

#### Scenario: Back is used on a secondary surface
- **WHEN** stage selection, How to Play, Credits, or a result surface is active
- **THEN** navigation returns to its defined parent surface without moving the block

### Requirement: Release package identity
The HarmonyOS build SHALL define a release product name, semantic version, build number, package identifier, landscape orientation, application icon, and launch artwork suitable for phone and tablet installation.

#### Scenario: Release project is exported
- **WHEN** the Cocos HarmonyOS Next build is opened in DevEco Studio
- **THEN** identity assets and version fields are present and signing can produce an installable release artifact

### Requirement: Device acceptance matrix
The release SHALL be checked on browser landscape preview, the existing HarmonyOS Pad, and at least one supported HarmonyOS phone.

#### Scenario: Acceptance run is performed
- **WHEN** a target is tested
- **THEN** launch, safe area, title navigation, tutorial input blocking, resume, all result actions, sound, vibration, lifecycle pause, all mechanics, and campaign completion are recorded as pass or fail

### Requirement: Release performance and reliability
The game SHALL remain responsive and visually complete across all 33 levels and the animated title presentation on target devices.

#### Scenario: Worst-case content is profiled
- **WHEN** large late-game boards and the title attract scene are exercised
- **THEN** no missing materials, blank frames, incoherent overlap, uncontrolled input, or release-blocking frame stalls occur

### Requirement: Store documentation
The release SHALL include current build instructions, an originality and asset provenance record, a privacy statement, and a store checklist for screenshots and descriptive metadata.

#### Scenario: Release candidate is reviewed
- **WHEN** the candidate is prepared for submission
- **THEN** required documents reflect the actual menu, controls, permissions, device support, and local-only data behavior

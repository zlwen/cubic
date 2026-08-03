## ADDED Requirements

### Requirement: Thirty-three original levels
The campaign SHALL contain exactly 33 ordered levels with original layouts, titles, passcodes, switch configurations, split destinations, and solutions.

#### Scenario: Campaign metadata is validated
- **WHEN** content tests run
- **THEN** all identifiers, titles, and four-letter passcodes are unique and no reference layout or numeric code is imported

### Requirement: Classic mechanic cadence
The campaign SHALL teach basic rolling before introducing switches and bridges, then fragile tiles, then splitting, and finally combined state-planning challenges.

#### Scenario: Player progresses through the campaign
- **WHEN** later level bands are reached
- **THEN** solutions require more dynamic state changes and mechanic combinations than the opening band

### Requirement: Production-engine solvability
Every level MUST include a recorded solution that completes through the production engine from its declared initial state.

#### Scenario: Recorded campaign solutions execute
- **WHEN** every recorded action is applied in order
- **THEN** all 33 levels finish completed without invalid actions or unsupported intermediate states

### Requirement: Mobile campaign bounds
Every level SHALL remain readable in the asymmetric orthographic landscape camera and preserve screen-aligned mobile controls.

#### Scenario: Any campaign level loads
- **WHEN** its complete static and dynamic bounds are framed
- **THEN** its tiles, possible bridge cells, split destinations, block bodies, and goal remain visible

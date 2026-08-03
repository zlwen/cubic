## ADDED Requirements

### Requirement: Distinctive forge presentation
The game SHALL present the board as an original suspended industrial puzzle using light weathered-stone surfaces, a rusted-iron block, a board-surrounded dark goal hole, and a low-contrast ember void.

#### Scenario: A level is rendered
- **WHEN** the gameplay scene becomes visible
- **THEN** the board, block, goal, environment, and HUD share the aerial-forge visual language without using source-game assets

### Requirement: Goal is spatially identifiable
The goal SHALL be a non-supporting empty board coordinate surrounded by normal board tiles, with a dark shaft rendered below the opening.

#### Scenario: Player scans a new board
- **WHEN** the level first appears
- **THEN** the goal is distinguishable as a missing tile with visible depth and a dark interior, while neighboring tiles form its boundary

#### Scenario: Player completes a level
- **WHEN** the block reaches the goal in the standing orientation
- **THEN** the block drops into the shaft and disappears below the board before the next level is selected

#### Scenario: Block lies partly across the goal
- **WHEN** a lying block occupies the goal coordinate
- **THEN** the unsupported block falls and the level fails rather than completing

### Requirement: Suspended-board depth
The environment SHALL communicate unsupported gaps without placing an apparently walkable slab, pillar, or decorative structure beneath or around empty cells.

#### Scenario: Board contains a gap
- **WHEN** an empty grid position lies between playable tiles
- **THEN** the player sees the dark void through that gap without non-playable structures competing with the board

### Requirement: Mobile visual reliability
The visual presentation MUST use optimized original textures, fallback colors, and geometry that render correctly in browser preview and HarmonyOS native builds while keeping every level readable.

#### Scenario: Native build renders chapter one
- **WHEN** the game runs on the target HarmonyOS Pad
- **THEN** no object displays a missing-material color and visual details do not obscure tile boundaries or controls

### Requirement: Asymmetric orthographic camera
The game SHALL use a fixed orthographic camera near 34 degrees pitch and 18 to 20 degrees yaw rather than a symmetric 45-degree isometric view.

#### Scenario: A chapter level is framed
- **WHEN** a level loads
- **THEN** the two board axes project asymmetrically near -10 and +60 degrees and all playable geometry remains visible

#### Scenario: Player swipes in screen directions
- **WHEN** the player swipes horizontally or vertically under the fixed camera
- **THEN** the block moves primarily in the corresponding visible screen direction

### Requirement: Compact progress HUD
The HUD SHALL show level position, original title, move count, and par while preserving safe-area-aware controls in landscape mode.

#### Scenario: Player makes a move
- **WHEN** the move completes
- **THEN** the HUD updates the move count without shifting or overlapping the board or bottom controls

### Requirement: Original gameplay audio
The game SHALL provide original ambient, rolling, failure, completion, and UI sounds without redistributing audio extracted from the reference game.

#### Scenario: Player interacts with the puzzle
- **WHEN** the player rolls the block, falls, completes a level, or presses a control
- **THEN** the corresponding sound category plays and ambient audio begins only after user interaction

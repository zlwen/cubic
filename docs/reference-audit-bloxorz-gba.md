# Reference Audit: bloxorz_gba

Reference repository: `https://github.com/jacobcoughenour/bloxorz_gba`

Reviewed on 2026-07-30.

## License Finding

The repository contains an MIT license for Jacob Coughenour's software. Its README separately states that sprites under `game/original_assets` were extracted from the original Bloxorz SWF. The published game page also describes the port as containing the original images, sounds, animations, levels, and level codes.

The repository's MIT license cannot be assumed to grant rights to third-party Bloxorz assets that the repository author did not create. This project therefore does not copy or redistribute files from:

- `game/original_assets`
- `game/audio`
- generated graphics derived from those original assets
- `game/levels.json`

## Safe Reference Use

The project uses only high-level observations from the reference implementation:

- A compact HUD emphasizes level position and move count.
- Rolling impacts use a small rotating set of short effects.
- Failure, completion, UI interaction, and ambient sound have separate channels.
- Light stone, rusted iron, and a dark red void provide strong board contrast.

All textures and WAV files used by this project are newly generated for this repository. Level layouts, titles, UI composition, code, and native integration remain original.

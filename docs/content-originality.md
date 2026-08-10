# Content Provenance

The project-authored visuals, audio, UI, localization, and application code are kept separate from imported campaign data.

Campaign provenance:

- The 33 level layouts and six-digit passcodes come from `jacobcoughenour/bloxorz_gba/game/levels.json` at commit `8d552f867c06caa8bc9953eefa13ecb2bb9d8edf`.
- The imported data is licensed under MIT; see `third_party/bloxorz_gba/LICENSE` and `THIRD_PARTY_NOTICES.md`.
- No upstream sprites, textures, audio, or source code are included in the runtime assets.
- CUBIC keeps its own name, 3D presentation, controls, menus, copy, and generated audiovisual assets.

`src/levels/index.ts` validates the converted campaign, and the engine tests compare every imported grid cell, switch action, split destination, passcode, and verified solution.

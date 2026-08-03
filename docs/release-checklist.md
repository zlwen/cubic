# Release Candidate Checklist

## Build Identity

- [ ] Product name is `CUBIC` in Cocos and DevEco Studio.
- [ ] Bundle name is `me.kk.cubic`.
- [ ] Version name/code match `1.0.0` / `1000000`.
- [ ] HarmonyOS API 15 phone and tablet targets are configured.
- [ ] Landscape orientation is locked and safe areas are respected.
- [ ] Release icon and launch artwork are original and correctly scaled.
- [ ] Release signing succeeds without committing signing material.
- [ ] Generated permissions are reduced to reviewed shipping needs.

## Product Flow

- [ ] Clean install opens the animated title screen without errors.
- [ ] Start New Game and overwrite confirmation work.
- [ ] Resume Game restores position, mechanisms, moves, and elapsed time.
- [ ] Load Stage shows unlocked/locked states and accepts valid passcodes.
- [ ] Sound preference persists across relaunch.
- [ ] A clean install selects Simplified Chinese, Traditional Chinese, or English from the system locale as expected.
- [ ] Language can be changed from title and pause menus, refreshes all visible text immediately, and persists across relaunch.
- [ ] Existing saves without a language preference retain progression and initialize a valid language.
- [ ] Every automatic tutorial appears once and How to Play remains replayable.
- [ ] Failure, Retry, completion, Continue, Replay, and Quit to Menu work.
- [ ] Background/foreground and mobile back navigation preserve valid state.
- [ ] Corrupt or unsupported save data falls back without blocking startup.

## Campaign And Devices

- [ ] All 33 recorded solutions pass automated validation.
- [ ] All 33 levels are reviewed in browser preview.
- [ ] All 33 levels and all mechanics are reviewed on the HarmonyOS Pad.
- [ ] Title, tutorial, safe area, lifecycle, audio, vibration, and representative levels are reviewed on a HarmonyOS phone.
- [ ] Large late-game boards and title animation remain responsive.
- [ ] No missing-material magenta, blank gray frame, overlap, clipped text, or unreachable button appears.
- [ ] Simplified Chinese, Traditional Chinese, and English show no missing glyphs, clipping, overlap, or undersized controls on phone and tablet.

## Store Package

- [ ] Privacy summary matches the final manifest and runtime behavior.
- [ ] Asset provenance and third-party license review are current.
- [ ] Store title, short description, long description, category, and support contact are approved.
- [ ] Phone and tablet screenshots use the release build and contain no debug overlays.
- [ ] Clean install, upgrade install, relaunch, and uninstall/reinstall are tested with the signed candidate.

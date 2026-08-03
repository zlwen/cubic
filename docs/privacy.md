# Privacy Summary

CUBIC is designed as an offline, single-player puzzle game.

## Local Data

The game stores the following data only on the device:

- current stage and accepted move history
- elapsed stage time and unlocked progression
- sound preference
- acknowledged tutorial topics

This data is used for Resume Game, Load Stage, and preference restoration. It is not transmitted by the game code and can be removed by clearing the application's local data or uninstalling the application.

## Device Capabilities

The game uses vibration for lightweight failure and completion feedback. It does not require accounts, location, contacts, camera, microphone, photo library, or user file access.

Before release, review the generated HarmonyOS manifest and remove template network, motion-sensor, or device-information permissions unless a documented shipping feature requires them.

## Online Services

The first release does not include analytics, advertising, cloud saves, social features, remote configuration, or third-party login.

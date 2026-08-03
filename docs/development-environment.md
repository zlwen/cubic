# Development Environment

## Installed Locally

- macOS 15.6 on x86_64
- Cocos Creator 3.8.8 at `/Applications/Cocos/Creator/3.8.8/CocosCreator.app`
- DevEco Studio 5.1.0 at `/Applications/DevEco-Studio.app`
- HarmonyOS/OpenHarmony SDK under `/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony`
- `hdc` at `/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hdc`
- DevEco bundled JBR 17.0.12
- Node 24.14.0, npm 11.9.0, Git 2.39.5

## Required Before Device Testing

1. Connect a HarmonyOS Next phone by USB.
2. Enable developer options and USB debugging on the phone.
3. Accept the device authorization prompt.
4. Confirm the device is visible:

```sh
/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hdc list targets
```

The command must print a device identifier. `[Empty]` means the phone is not authorized or not connected.

## Command Line Notes

DevEco Studio bundles its own Java runtime, but system `java` is not currently installed. Use DevEco Studio for native builds unless command-line automation is configured with:

```sh
export JAVA_HOME=/Applications/DevEco-Studio.app/Contents/jbr/Contents/Home
export PATH="/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains:$PATH"
```

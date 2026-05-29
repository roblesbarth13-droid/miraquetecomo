---
name: Android AAB build from Replit
description: How to build a signed Android App Bundle (AAB) from within the Replit environment without Android Studio.
---

# Android AAB Build from Replit

## The Rule
The Android SDK is installed at `/home/runner/workspace/android-sdk`. Building does not require Android Studio — Gradle handles everything.

**Why:** Gradle is the actual build system; Android Studio is just a visual wrapper. Since the SDK and Java are installed in this Replit environment, we can build directly.

**How to apply:**
```bash
export ANDROID_HOME=/home/runner/workspace/android-sdk
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
export KEYSTORE_FILE="/home/runner/workspace/android/app/miraquetecomo-release.keystore"
# Stop Node server first to free memory, then:
cd android && ./gradlew bundleRelease --no-daemon -Dorg.gradle.jvmargs="-Xmx512m"
# Output: android/app/build/outputs/bundle/release/app-release.aab
cp android/app/build/outputs/bundle/release/app-release.aab /home/runner/workspace/app-release.aab
```

## Keystore
- File: `android/app/miraquetecomo-release.keystore` (gitignored)
- Credentials in Replit Secrets: KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD
- build.gradle reads KEYSTORE_FILE env var as fallback when keystore.properties absent

## Download
- Served via `GET /download/aab` in `server/index.ts`
- Dev URL: `https://0f4a4a6a-a214-41ba-b09d-9b13a7dfc9da-00-3uu68a16qti0o-s01721tt.kirk.replit.dev/download/aab`
- For large files, user can also right-click file in Replit file panel → Download

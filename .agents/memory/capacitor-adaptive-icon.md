---
name: Capacitor adaptive icon fix
description: Three files left by Capacitor's default template cause the blue X icon on Android 8+ devices instead of the correct app icon.
---

# Capacitor Adaptive Icon — Three Conflicting Files

## The Rule
Before generating correct adaptive icon PNGs, always delete these three files if they exist:
1. `android/app/src/main/res/drawable/ic_launcher_background.xml`
2. `android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml`
3. `android/app/src/main/res/values/ic_launcher_background.xml`

Also ensure `android/app/src/main/res/values/colors.xml` exists with a single `ic_launcher_background` color definition (no duplicates across files).

**Why:** Capacitor scaffolds these XML vector drawables as placeholders. On Android 8+, adaptive icons use `mipmap-anydpi-v26/ic_launcher.xml` which references `@color/ic_launcher_background` + `@mipmap/ic_launcher_foreground`. If the XML drawables exist alongside the PNGs, Android may render the Capacitor default (blue X on teal) instead of the correct PNG. The `values/ic_launcher_background.xml` color conflicts with `values/colors.xml` — Android picks unpredictably.

**How to apply:** Any time Capacitor icons need to be regenerated or updated, run a find for these three filenames first and delete them before generating PNGs.

## Correct Setup After Fix
- `mipmap-anydpi-v26/ic_launcher.xml` → `@color/ic_launcher_background` + `@mipmap/ic_launcher_foreground`
- `values/colors.xml` → single `ic_launcher_background` color (e.g. `#FFFFFF`)
- 15 PNG files: 5 densities (mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi) × 3 types (foreground/launcher/launcher_round)
- Foreground sizes: mdpi=108, hdpi=162, xhdpi=216, xxhdpi=324, xxxhdpi=432
- Legacy launcher sizes: mdpi=48, hdpi=72, xhdpi=96, xxhdpi=144, xxxhdpi=192
- Foreground PNGs must be RGBA (transparency); launcher PNGs can be RGB

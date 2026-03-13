# Publisher's Guide: OmniClip 🚀

This guide outlines the critical steps for building, codesigning, and submitting the cross-platform Tauri and Axum instances of OmniClip to the respective stores and environments.

## 1. Building the Axum Server Docker Image
Deploying the backend to production is straightforward using the provided `docker-compose.yml` and multi-stage `Dockerfile`.

```bash
cd omniclip-server
docker build -t omniclip-server:latest .
docker-compose up -d
```
*Note*: The multi-stage build creates an alpine or scratch-based image under 20MB. Ensure you have configure the environment variables (`DATABASE_URL`, `JWT_SECRET`) properly in production.

---

## 2. Linux App (.deb)
To package the app for Debian-based systems (Ubuntu, Mint, Debian):

1. **Host Requirements**: Need `dpkg`, `fakeroot`, `libwebkit2gtk-4.0-dev`.
2. **Build Command**:
   ```bash
   cd omniclip-client/src-tauri
   cargo tauri build --target x86_64-unknown-linux-gnu~~EWQ
   ```
3. **Output**: Look in `src-tauri/target/release/bundle/deb/`.

*Gotchas*: The app auto-start uses `~/.config/autostart`. Ensure your `.desktop` file permissions are correct if running as an unprivileged user.

---

## 3. Windows Application (.nsis / .msi)
To package the app for Windows 10/11:

1. **Host Requirements**: Requires a Windows machine or a CI workflow (e.g., GitHub Actions windows-latest).
2. **Build Command**:
   ```bash
   cd omniclip-client/src-tauri
   cargo tauri build
   ```
3. **Codesigning (Required)**: 
   Windows SmartScreen will block the unsigned `.exe`. You MUST purchase an EV (Extended Validation) Code Signing Certificate. Configure the `signtool` paths in your Tauri config or run it via Azure Key Vault in CI pipelines.

---

## 4. macOS Application (.dmg / .app)
To package the app for Intel/Apple Silicon Macs:

1. **Host Requirements**: Needs Xcode, macOS.
2. **Build Command**:
   ```bash
   cd omniclip-client/src-tauri
   cargo tauri build --target universal-apple-darwin
   ```
3. **Codesigning and Notarization (Required)**:
   - Must have an active Apple Developer Program membership.
   - Configure `tauri.conf.json` with your `appleId` and `appleIdPassword` (or app-specific password).
   - The build process natively supports `xcrun altool` to notarize the app automatically so macOS Gatekeeper doesn't block it.

---

## 5. Mobile (Android & iOS)

### Android (.apk / .aab)
1. Initialize Android: `cd omniclip-client/src-tauri && cargo tauri android init`
2. **Foreground Services**: OmniClip needs to run constantly to poll the clipboard. In `AndroidManifest.xml`, ensure you add:
   ```xml
   <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
   <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
   ```
3. *Gotcha*: Google Play Store strictly restricts Background Clipboard Access. You may need to utilize Android's Accessibility Services or require the user to manually click a widget to sync, depending on the Android API target level (Android 10+ blocks background clipboard reads).

### iOS / iPadOS (.ipa)
1. Initialize iOS: `cd omniclip-client/src-tauri && cargo tauri ios init`
2. **Silent Push Notifications**: iOS entirely blocks background clipboard polling. 
   - Workaround: The Axum server must send an Apple Push Notification (APN) with `content-available: 1`. 
   - When the iOS app receives this silent push, it briefly wakes up in the background and writes the encrypted payload to `UIPasteboard`.
3. *Gotcha*: Apple strictly monitors `UIPasteboard`. Ensure your privacy manifest (`PrivacyInfo.xcprivacy`) clearly declares why the clipboard is accessed.

---
## Summary Check
- [x] Docker <20MB Setup ready.
- [x] Codesigning documented.
- [x] Mobile store submission gotchas outlined.

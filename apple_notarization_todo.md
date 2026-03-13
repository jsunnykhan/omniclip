# Apple Notarization — TODO

> **Context:** macOS shows "damaged and cannot be opened" for the OmniClip `.dmg` because the app is not Apple-notarized. Windows works fine. The quick workaround for users is `xattr -cr /Applications/omniclip-client.app` in Terminal.

## What's Needed

1. **Apple Developer Account** — $99/year at [developer.apple.com](https://developer.apple.com)
2. A **"Developer ID Application"** code signing certificate (from Xcode or Apple Developer portal)
3. An **App-Specific Password** from [appleid.apple.com](https://appleid.apple.com) → Security → App-Specific Passwords

---

## GitHub Secrets to Add

| Secret Name | Where to Get It |
|---|---|
| `APPLE_CERTIFICATE` | Export `.p12` from Keychain Access → base64 encode it: `base64 -i cert.p12` |
| `APPLE_CERTIFICATE_PASSWORD` | Password you set when exporting the `.p12` |
| `APPLE_SIGNING_IDENTITY` | e.g. `Developer ID Application: Your Name (TEAM_ID)` |
| `APPLE_ID` | Your Apple ID email |
| `APPLE_PASSWORD` | App-specific password from appleid.apple.com |
| `APPLE_TEAM_ID` | Found in [developer.apple.com/account](https://developer.apple.com/account) → Membership |

---

## Changes to [.github/workflows/build.yml](file:///i:/rust/omniclip/.github/workflows/build.yml)

Add these env vars to the `tauri-action` step:

```yaml
- name: Build and publish release
  uses: tauri-apps/tauri-action@v0
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
    TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
    APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
    APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
    APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
    APPLE_ID: ${{ secrets.APPLE_ID }}
    APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
    APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

---

## Workaround for Users (Until Notarized)

Share this command with Mac users:
```bash
xattr -cr /Applications/omniclip-client.app
```
Run once in Terminal after installing, then the app opens normally.

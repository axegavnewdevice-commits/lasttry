# Axegavonly — Arabic Scrabble PWA + Android APK build

This repository packages the supplied Arabic Scrabble HTML as a responsive PWA and provides a GitHub Actions workflow to build an Android APK.

## Host the PWA on Vercel
1. Create a GitHub repository named `axegavonly`.
2. Upload the contents of this ZIP to the repository root (not the ZIP itself).
3. In Vercel, **Add New → Project**, import `axegavonly`.
4. Framework preset: **Other**. Build command: leave empty. Output directory: leave empty. Deploy.
5. Open the resulting HTTPS URL. On Android Chrome, use the app's install button or menu → **Install app**. On iPhone/iPad Safari, Share → **Add to Home Screen**.

## Build an Android APK
1. Push the repository to GitHub with Actions enabled.
2. Open the repository's **Actions** tab and run **Build Android APK** (or push a change to `main`).
3. Open the successful workflow run and download the artifact named `axegavonly-android-debug-apk`.
4. Extract the artifact ZIP and tap `app-debug.apk` on your Android device. If Android asks, allow installation from that source. Only install APKs you built or trust.

The workflow builds a debug APK (suitable for personal testing), not a signed Play Store release. For a production/release APK, configure Android signing secrets and a release workflow.

## Important: PWA versus APK
A PWA cannot silently install an APK from inside the browser. Android requires the user to confirm APK installation. The included workflow builds the APK for you; the PWA remains separately installable from the Vercel HTTPS website.

## Included
- `index.html`: original game at repository root for Vercel static hosting
- `web/`: web assets copied for the Android wrapper
- `manifest.webmanifest`, `sw.js`, `icons/`: PWA metadata, offline shell, app icons
- `capacitor.config.json`, `package.json`: Capacitor Android wrapper setup
- `.github/workflows/build-android-apk.yml`: automatic APK build and downloadable artifact

## Notes
Offline caching works for the app shell and same-origin resources after first load. Network-backed services/features may still require internet. GitHub Actions must be enabled in repository settings.

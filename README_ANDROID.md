# Sippro: Android Studio & Play Store Guide

This project is now fully compatible with **Android Studio** using **Kotlin** (the modern standard for Android development). Follow these steps to build your APK and prepare for the Play Store.

## 1. Fix the 403 Forbidden Error (Firebase Auth)
The 403 error happens because your app's domain is not authorized in the Firebase Console.

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **sippro-a0656**.
3. Go to **Authentication** > **Settings** > **Authorized domains**.
4. Add the following domains:
   - `ais-dev-doxpoxzbmkgpcfod5xsy4q-720693261715.asia-southeast1.run.app`
   - `ais-pre-doxpoxzbmkgpcfod5xsy4q-720693261715.asia-southeast1.run.app`
   - `localhost` (Required for Android WebView)

## 2. Open in Android Studio
1. **Build the web project first:**
   ```bash
   npm run build
   ```
2. **Sync with Android:**
   ```bash
   npm run android:build
   ```
3. **Open the `android` folder in Android Studio.**
   - Do NOT open the root folder. Open ONLY the `android` sub-folder.
   - Android Studio will automatically detect the Kotlin configuration.

## 3. Play Store Preparation Checklist
To upload to the Play Store, you must complete these steps in Android Studio:

### A. Set a Unique Package Name
Currently set to `com.sippro.app`. If you want to change it:
1. Update `appId` in `capacitor.config.ts`.
2. Update `namespace` and `applicationId` in `android/app/build.gradle`.

### B. App Icons & Splash Screen
1. In Android Studio, right-click the `app` folder.
2. Select **New > Image Asset**.
3. Follow the wizard to generate icons for all sizes.

### C. Generate Signed Bundle (AAB)
Google Play requires `.aab` files, not just `.apk`.
1. In Android Studio, go to **Build > Generate Signed Bundle / APK**.
2. Select **Android App Bundle**.
3. Create a new **Key Store** (Keep this file safe! You need it for all future updates).
4. Follow the steps to generate the signed `.aab` file.

## 4. Google Sign-In for Play Store
For Google Sign-In to work in the production app:
1. Get the **SHA-1** from your App Signing key in the Google Play Console.
2. Add this SHA-1 to your **Firebase Project Settings**.
3. Download the new `google-services.json` and put it in `android/app/`.

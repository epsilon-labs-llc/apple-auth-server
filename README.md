# Sign in with Apple Server for Flutter

[![en](https://img.shields.io/badge/lang-en-orange.svg)](README.md)
[![ja](https://img.shields.io/badge/lang-ja-blue.svg)](README.ja.md)
[![Node.js >=18](https://img.shields.io/badge/node-%3E=18-green)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A minimal Node.js backend to enable **Sign in with Apple** for Flutter apps.   
While iOS and macOS work with the Flutter package alone without a server, while Android requires this backend for proper authentication flow. For web implementation, please refer to the [Official Documentation](https://pub.dev/packages/sign_in_with_apple).

Glitch announced they're ending web hosting on _July 8, 2025_. This project provides a modern, self-hosted alternative to ensure your **Sign in with Apple** continues working seamlessly.

## Features

- Sign in with Apple support for **Android** with deep linking
- Clean and minimal codebase
- Environment variable configuration using `.env`
- Based on official example but modernized
- Easy deployment on your own server

## Requirements

- Node.js v18 or higher
- A valid Apple Developer account

## Getting Started

### 1. Clone this repo

```bash
git clone https://github.com/epsilon-labs-llc/apple-auth-server.git
cd apple-auth-server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file
Create a `.env` file in the root directory based on [`.env.example`](.env.example).

```bash
# Sign in with Apple Info
BUNDLE_ID=com.example.app
SERVICE_ID=your.service.id.example
TEAM_ID=XXXXXXXXXX
KEY_ID=YYYYYYYYYY
KEY_CONTENTS=-----BEGIN PRIVATE KEY-----|XXXXX|-----END PRIVATE KEY-----

# Android Deep Link
ANDROID_PACKAGE_IDENTIFIER=com.example.app

# Apple Redirect URI
REDIRECT_URI=https://yourdomain.com/callbacks/sign_in_with_apple

# Server port
PORT=3000
```

Replace `KEY_CONTENTS` with the contents of your `.p8` private key file, using `|` instead of newlines.

### 4. Start the server

```bash
npm start
```

## How to Use with Flutter
Install [sign_in_with_apple](https://pub.dev/packages/sign_in_with_apple) package to authenticate with Apple.

### Android Setup
Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<activity
    android:name="com.aboutyou.dart_packages.sign_in_with_apple.SignInWithAppleCallback"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="signinwithapple" android:host="callback" />
    </intent-filter>
</activity>
```

### Flutter Code

```dart
import 'dart:io';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:firebase_auth/firebase_auth.dart';

Future<void> signInWithApple() async {
  try {
    final appleCredential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
      webAuthenticationOptions: Platform.isAndroid
        ? WebAuthenticationOptions(
            clientId: 'your.service.id',
            redirectUri: Uri.parse('https://yourdomain.com/callbacks/sign_in_with_apple'),
          )
        : null,
    );
    
    // Handle the appleCredential
    print('User ID: ${appleCredential.userIdentifier}');
    print('Email: ${appleCredential.email}');

    // For Firebase login (optional - if using Firebase Auth)
    final oauthCredential = OAuthProvider("apple.com").credential(
      idToken: appleCredential.identityToken,
      accessToken: appleCredential.authorizationCode,
    );

    // Log into Firebase
    final userCredential = await FirebaseAuth.instance.signInWithCredential(oauthCredential);
  } catch (error) {
    print('Sign in failed: $error');
  }
}
```

## API Endpoints

### POST `/callbacks/sign_in_with_apple`
Handles Apple callback and redirects to Android app.

### POST `/sign_in_with_apple`
Main authentication endpoint.

**Query Parameters:**
- `code` (required): Authorization code from Apple
- `useBundleId` (optional): Use Bundle ID instead of Service ID
- `firstName` (optional): User's first name
- `lastName` (optional): User's last name

**Response:**
```json
{
  "success": true,
  "sessionId": "session_12345_abcd1234",
  "user": {
    "id": "user_apple_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### GET `/health`
Health check endpoint.

## Common Issues

**Play Store opens instead of app**
- Verify `ANDROID_PACKAGE_IDENTIFIER` matches your app exactly
- Check AndroidManifest.xml callback activity configuration

**Invalid Grant Error**
- Authorization codes expire in 5 minutes
- Check Apple Developer Console configuration

**Environment variable errors**
- If you see "Missing required environment variables" on startup
- Verify that your `.env` file is in the root directory
- Ensure TEAM_ID, KEY_ID, KEY_CONTENTS, and ANDROID_PACKAGE_IDENTIFIER are set
- Make sure either SERVICE_ID or BUNDLE_ID is configured

## License

This project is licensed under the [MIT License](LICENSE).

### Acknowledgements

Based on the official [flutter-sign-in-with-apple-example](https://glitch.com/~flutter-sign-in-with-apple-example) by [Timm Preetz](https://glitch.com/@tp) and [Henri Beck](https://glitch.com/@HenriBeck) with modern improvements. 
That project is also licensed under the MIT License.
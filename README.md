# Apple Sign In to Firebase Server

[![en](https://img.shields.io/badge/lang-en-orange.svg)](README.md)
[![ja](https://img.shields.io/badge/lang-ja-blue.svg)](README.ja.md)
[![Node.js >=18](https://img.shields.io/badge/node-%3E=18-green)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A minimal Node.js backend to enable **Sign in with Apple** and generate **Firebase custom tokens** for use in mobile apps (Android/Web) built with Flutter.

## Features

- Sign in with Apple support for **Android** and **Web**
- Firebase Authentication via **custom token**
- Express.js API endpoints
- Easy deployment on your own server

## Getting Started

### 1. Clone this repo

```bash
git clone https://github.com/epsilon-labs-llc/apple-signin-firebase-server.git
cd apple-signin-firebase-server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file
Create a `.env` file in the root directory based on [`.env.example`](.env.example).

```bash
# Apple Sign In Info
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

### 4. Add Firebase Admin SDK
Download your Firebase service account file from

**Firebase Console → Project Settings → Service Accounts → Generate new private key**

Place the file in the root as `serviceAccountKey.json`.

### 5. Start the server
```bash
npm start
```

## How to Use with Flutter
Use packages like [sign_in_with_apple](https://pub.dev/packages/sign_in_with_apple) to authenticate with Apple, then send the authorization code to

```http
POST /sign_in_with_apple
```

This will return a Firebase Custom Token you can use to sign in

```dart
FirebaseAuth.instance.signInWithCustomToken(token);
```

## 動作条件

- Node.js v18 or higher
- A valid Apple Developer account
- Firebase project with Authentication enabled

## License

This project is licensed under the [MIT License](LICENSE).

### Acknowledgements

This implementation is partially inspired by  
[flutter-sign-in-with-apple-example](https://glitch.com/~flutter-sign-in-with-apple-example) by [Timm Preetz](https://glitch.com/@tp) and [Henri Beck](https://glitch.com/@HenriBeck).  
That project is also licensed under the MIT License.
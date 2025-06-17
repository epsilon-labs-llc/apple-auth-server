# Flutter用 Sign in with Apple サーバー

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![ja](https://img.shields.io/badge/lang-ja-blue.svg)](README.ja.md)
[![Node.js >=18](https://img.shields.io/badge/node-%3E=18-green)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Flutterアプリで **Sign in with Apple** を使用するための軽量なNode.jsバックエンドです。   
iOS・macOSではサーバー不要でFlutterパッケージのみで動作しますが、Androidでは適切な認証フローを実現するためにこのバックエンドサーバーが必要になります。Web向けの実装については、[公式ドキュメント](https://pub.dev/packages/sign_in_with_apple)をご参照ください。

Glitchが _2025年7月8日_ でWebホスティングサービスを終了することを発表したため、同じような状況で困らないよう、最新版のセルフホスト可能な代替手段として開発しました。

## 特徴

- ディープリンクを持つ **Android** で Sign in with Apple のサポート
- クリーンで最小限のコードベース
- `.env`を使った環境変数での設定
- 公式サンプルをベースに最新版に改良
- 自分のサーバー上で簡単に運用可能

## 必要条件

- Node.js v18以上
- 有効なApple Developer アカウント

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/epsilon-labs-llc/apple-auth-server.git
cd apple-auth-server
```

### 2. 依存パッケージのインストール
```bash
npm install
```

### 3. .env ファイルの作成
ルートディレクトリに[`.env.example`](.env.example) を参考に、`.env` ファイルを作成してください。

```bash
# Sign in with Apple 情報
BUNDLE_ID=com.example.app
SERVICE_ID=your.service.id.example
TEAM_ID=XXXXXXXXXX
KEY_ID=YYYYYYYYYY
KEY_CONTENTS=-----BEGIN PRIVATE KEY-----|XXXXX|-----END PRIVATE KEY-----

# Androidディープリンク
ANDROID_PACKAGE_IDENTIFIER=com.example.app

# Apple リダイレクトURI
REDIRECT_URI=https://yourdomain.com/callbacks/sign_in_with_apple

# サーバーポート
PORT=3000
```

`KEY_CONTENTS` には `.p8` 秘密鍵ファイルの内容を、改行を`|`に置き換えて設定してください。

### 4. サーバーを起動
```bash
npm start
```

## Flutter での使い方
Appleで認証するために[sign_in_with_apple](https://pub.dev/packages/sign_in_with_apple)パッケージをインストールしてください。

### Android設定
`android/app/src/main/AndroidManifest.xml`に以下を追加してください。

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

### Flutterコード

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
    
    // appleCredentialを処理
    print('User ID: ${appleCredential.userIdentifier}');
    print('Email: ${appleCredential.email}');

    // Firebaseログイン（オプション - Firebase Authを使用する場合）
    final oauthCredential = OAuthProvider("apple.com").credential(
      idToken: appleCredential.identityToken,
      accessToken: appleCredential.authorizationCode,
    );

    // Firebaseにログイン
    final userCredential = await FirebaseAuth.instance.signInWithCredential(oauthCredential);
  } catch (error) {
    print('サインインに失敗しました: $error');
  }
}
```

## APIエンドポイント

### POST `/callbacks/sign_in_with_apple`
Appleコールバックを処理し、Androidアプリにリダイレクトします。

### POST `/sign_in_with_apple`
メイン認証エンドポイント。

**クエリパラメータ:**
- `code` (必須): Appleからの認証コード
- `useBundleId` (オプション): Service IDの代わりにBundle IDを使用
- `firstName` (オプション): ユーザーの名前
- `lastName` (オプション): ユーザーの苗字

**レスポンス:**
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
ヘルスチェックエンドポイント。

## よくある問題

**アプリが開かずPlay Storeが開く場合**
- `ANDROID_PACKAGE_IDENTIFIER`がアプリと完全に一致しているか確認
- AndroidManifest.xmlのコールバックアクティビティ設定を確認

**Invalid Grant エラー**
- 認証コードは5分で期限切れになります
- Apple Developer Consoleの設定を確認

**環境変数エラー**
- 起動時に「Missing required environment variables」が表示される場合
- `.env`ファイルがルートディレクトリにあるか確認
- TEAM_ID、KEY_ID、KEY_CONTENTS、ANDROID_PACKAGE_IDENTIFIERが設定されているか確認
- SERVICE_ID または BUNDLE_ID のどちらか一方が設定されているか確認
  
## ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) のもとで公開されています。

### 謝辞

公式の [flutter-sign-in-with-apple-example](https://glitch.com/~flutter-sign-in-with-apple-example)（作者：[Timm Preetz](https://glitch.com/@tp)、[Henri Beck](https://glitch.com/@HenriBeck)）をベースに、最新版に改良を行いました。
このプロジェクトも MIT ライセンスのもとで公開されています。
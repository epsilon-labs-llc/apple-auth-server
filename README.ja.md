# Apple Sign In to Firebase Server

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![ja](https://img.shields.io/badge/lang-ja-blue.svg)](README.ja.md)
[![Node.js >=18](https://img.shields.io/badge/node-%3E=18-green)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Flutter で構築されたモバイルアプリ（Android／Web）向けに、**Sign in with Apple** を使った認証と、**Firebase カスタムトークン**を発行するための最小構成の Node.js バックエンドです。

## 特徴

- **Android** および **Web** 対応の Sign in with Apple 認証
- カスタムトークンを使って Firebase Authentication 認証
- Express.js による簡易 API サーバー
- 自分のサーバー上で簡単に運用可能

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/epsilon-labs-llc/apple-signin-firebase-server.git
cd apple-signin-firebase-server
```

### 2. 依存パッケージのインストール
```bash
npm install
```

### 3. .env ファイルの作成
[`.env.example`](.env.example) を参考に、`.env` ファイルを作成します。

```bash
# Apple Sign In 情報
BUNDLE_ID=com.example.app
SERVICE_ID=your.service.id.example
TEAM_ID=XXXXXXXXXX
KEY_ID=YYYYYYYYYY
KEY_CONTENTS=-----BEGIN PRIVATE KEY-----|XXXXX|-----END PRIVATE KEY-----

# Android 用ディープリンク情報
ANDROID_PACKAGE_IDENTIFIER=com.example.app

# Apple リダイレクト URI
REDIRECT_URI=https://yourdomain.com/callbacks/sign_in_with_apple

# サーバーポート
PORT=3000
```

`KEY_CONTENTS` には `.p8` 秘密鍵ファイルの中身をコピーし、改行を `|` に置き換えて記述してください。

### 4. Firebase Admin SDK を追加
Firebase コンソールからサービスアカウントの秘密鍵をダウンロードします。

**Firebase コンソール → プロジェクトの設定 → サービスアカウント → 新しい秘密鍵を生成**

ダウンロードしたファイルをルートディレクトリに `serviceAccountKey.json` として保存してください。

### 5. サーバーを起動
```bash
npm start
```

## Flutter での使い方
Flutter クライアント側では [sign_in_with_apple](https://pub.dev/packages/sign_in_with_apple) パッケージなどを使って Apple 認証を行い、取得した認証コードをサーバーの以下のエンドポイントへ送信します。

```http
POST /sign_in_with_apple
```

レスポンスで返される Firebase カスタムトークンを用いてログインします。

```dart
FirebaseAuth.instance.signInWithCustomToken(token);
```

## 動作条件

- Node.js v18 以上
- 有効な Apple Developer アカウント
- 認証機能が有効になっている Firebase プロジェクト
  
## ライセンス
このプロジェクトは [MIT ライセンス](LICENSE) のもとで公開されています。

MIT ライセンスの [flutter-sign-in-with-apple-example](https://glitch.com/~flutter-sign-in-with-apple-example) 
（作者：[Timm Preetz](https://glitch.com/@tp)、[Henri Beck](https://glitch.com/@HenriBeck)）の実装に一部インスパイアされています。
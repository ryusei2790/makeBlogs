# WordPress API テストスクリプト

このドキュメントでは、WordPressへのPOSTリクエストをテストするスクリプトの使用方法について説明します。

## 概要

`scripts/test-wordpress-api.js` は、WordPress REST APIとの接続と投稿機能をテストするためのスクリプトです。以下の機能を提供します：

- WordPress環境変数の確認
- WordPressサイトへの接続テスト
- WordPress API認証テスト
- 下書き投稿テスト
- 実際のブログ記事での投稿テスト
- テスト結果の保存

## 前提条件

1. `.env`ファイルが設定されていること
2. 以下の環境変数が設定されていること：
   - `WP_URL`: WordPress REST APIのエンドポイントURL
   - `WP_USER`: WordPressのユーザー名
   - `WP_APP_PASSWORD`: WordPressのアプリケーションパスワード

## WordPress設定

### アプリケーションパスワードの作成

1. WordPress管理画面にログイン
2. ユーザー → プロフィール に移動
3. 「アプリケーションパスワード」セクションで新しいパスワードを作成
4. 生成されたパスワードをコピー（一度しか表示されません）

### 環境変数の設定例

```bash
# .envファイル
WP_URL=https://yourdomain.com/wp-json/wp/v2/posts
WP_USER=your-username
WP_APP_PASSWORD=9lTxkiA1OtMs$B7*ddub4G^w
```

## 使用方法

### 基本的な使用方法

```bash
# npmスクリプトを使用
npm run test:wp

# または直接実行
node scripts/test-wordpress-api.js
```

### オプション付きの使用方法

```bash
# ヘルプを表示
npm run test:wp:help
# または
node scripts/test-wordpress-api.js --help

# 指定した日付のブログ記事でテスト
node scripts/test-wordpress-api.js --date 2024-01-15
# または
node scripts/test-wordpress-api.js -d 2024-01-15
```

## テスト内容

### 1. WordPress環境変数の確認

スクリプトは最初に以下の環境変数を確認します：

**必須環境変数:**
- `WP_URL`: WordPress REST APIのエンドポイントURL
- `WP_USER`: WordPressのユーザー名
- `WP_APP_PASSWORD`: WordPressのアプリケーションパスワード

### 2. WordPressサイト接続テスト

WordPressサイトへの基本的な接続をテストします：
- サイト情報の取得（認証不要）
- WordPressバージョンの確認
- サイト名とURLの確認

### 3. WordPress API認証テスト

WordPress REST APIの認証をテストします：
- Basic認証によるユーザー情報取得
- 投稿権限の確認
- ユーザー詳細情報の表示

### 4. 下書き投稿テスト

サンプル記事を下書きとして投稿します：
- テスト用の記事内容を作成
- 下書き状態で投稿
- 投稿IDとURLの取得

### 5. 実際のブログ記事での投稿テスト

`blogs/created_blogs_md/`ディレクトリ内の実際のブログ記事を使用してテストします：
- 指定した日付のブログ記事を読み込み
- Front Matterを解析してメタデータを取得
- 下書きとして投稿

## 出力ファイル

テスト結果は `logs/test/` ディレクトリに保存されます：

- `wordpress-test-YYYY-MM-DD.json`: WordPress APIテストの結果

### 出力ファイルの構造

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "testType": "draft-post",
  "result": {
    "id": 123,
    "date": "2024-01-15T10:30:00",
    "date_gmt": "2024-01-15T01:30:00",
    "guid": {
      "rendered": "https://yourdomain.com/?p=123"
    },
    "modified": "2024-01-15T10:30:00",
    "modified_gmt": "2024-01-15T01:30:00",
    "slug": "test-wordpress-api-test-article-2024-01-15",
    "status": "draft",
    "type": "post",
    "link": "https://yourdomain.com/?p=123",
    "title": {
      "rendered": "[テスト] WordPress API テスト記事 - 2024-01-15"
    },
    "content": {
      "rendered": "<p>テスト記事の内容...</p>",
      "protected": false
    },
    "excerpt": {
      "rendered": "<p>WordPress APIのテスト用記事です。</p>",
      "protected": false
    },
    "author": 1,
    "featured_media": 0,
    "comment_status": "open",
    "ping_status": "open",
    "sticky": false,
    "template": "",
    "format": "standard",
    "meta": [],
    "categories": [],
    "tags": [1, 2, 3]
  }
}
```

## エラーハンドリング

スクリプトは以下のエラーを適切に処理します：

- 環境変数の未設定
- WordPressサイト接続エラー
- 認証エラー（401 Unauthorized）
- HTTPエラー（4xx, 5xx）
- ファイル読み込みエラー
- JSONパースエラー

## トラブルシューティング

### よくある問題と解決方法

1. **環境変数が設定されていない**
   ```
   ❌ WordPress必須環境変数が設定されていません。
   ```
   → `.env`ファイルを作成し、`WP_URL`、`WP_USER`、`WP_APP_PASSWORD`を設定してください。

2. **WordPressサイト接続エラー**
   ```
   ❌ WordPressサイトへの接続に失敗しました。
   ```
   → `WP_URL`が正しいか確認してください。通常は `https://yourdomain.com/wp-json/wp/v2/posts` の形式です。

3. **認証エラー**
   ```
   ❌ WordPress認証に失敗しました。
   ```
   → `WP_USER`と`WP_APP_PASSWORD`が正しいか確認してください。アプリケーションパスワードが正しく生成されているか確認してください。

4. **投稿権限エラー**
   ```
   📝 投稿権限: なし
   ```
   → WordPressユーザーに投稿権限があるか確認してください。

5. **ブログ記事ファイルが見つからない**
   ```
   ⚠️ ブログ記事ファイルが見つかりません
   ```
   → 指定した日付のブログ記事が`blogs/created_blogs_md/`ディレクトリに存在するか確認してください。

## セキュリティ注意事項

- アプリケーションパスワードは機密情報です。`.env`ファイルに保存し、Gitにコミットしないでください。
- テスト用の投稿は下書き状態で作成されますが、本番環境では注意して実行してください。
- アプリケーションパスワードは必要に応じて削除・再生成してください。

## 例

### 基本的なテスト実行

```bash
$ npm run test:wp

🧪 WordPress API テストスクリプト開始

==================================================
🔍 WordPress環境変数の確認中...

📋 WordPress必須環境変数:
   ✅ WP_URL: https://yourdomain.com/wp-json/wp/v2/posts
   ✅ WP_USER: your-username
   ✅ WP_APP_PASSWORD: ***4G^w

🔗 WordPress API接続テスト中...

📡 WordPressサイト情報取得: https://yourdomain.com/wp-json
✅ WordPressサイト接続成功！
📝 サイト名: Your Site Name
🌐 サイトURL: https://yourdomain.com
📅 WordPress バージョン: 6.4.2

🔐 WordPress API認証テスト中...

📡 ユーザー認証テスト: https://yourdomain.com/wp-json/wp/v2/users/me
✅ WordPress認証成功！
👤 ユーザー名: Your Name
📧 メール: your-email@example.com
🆔 ユーザーID: 1
📝 投稿権限: あり

📝 WordPress投稿テスト（下書き）実行中...

📤 投稿データ:
   タイトル: [テスト] WordPress API テスト記事 - 2024-01-15
   ステータス: draft
   内容長: 450 文字
   タグ: テスト, API, 自動投稿

✅ WordPress投稿テスト成功！
📝 投稿ID: 123
🔗 投稿URL: https://yourdomain.com/?p=123
📅 作成日時: 2024-01-15T10:30:00
📊 ステータス: draft
💾 テスト結果を保存: logs/test/wordpress-test-2024-01-15.json

📄 実際のブログ記事での投稿テスト実行中... (2024-01-15)

📖 ブログ記事ファイル読み込み成功: blogs/created_blogs_md/2024-01-15-script.md
📝 内容長: 1200 文字

📤 投稿データ:
   タイトル: [自動生成] 2024-01-15の学習記録
   ステータス: draft
   内容長: 1200 文字
   タグ: 学習記録, 自動生成, 2024-01-15

✅ 実際のブログ記事投稿テスト成功！
📝 投稿ID: 124
🔗 投稿URL: https://yourdomain.com/?p=124
📅 作成日時: 2024-01-15T10:31:00
📊 ステータス: draft
💾 テスト結果を保存: logs/test/wordpress-test-2024-01-15.json

==================================================
📊 WordPress APIテスト結果サマリー:
   ✅ 環境変数: OK
   ✅ サイト接続: OK
   ✅ 認証: OK
   ✅ 下書き投稿テスト: OK
   ✅ 実際のブログ記事投稿テスト: OK

🎉 WordPress APIテストが成功しました！
📁 テスト結果は logs/test/ ディレクトリに保存されています。
📝 投稿された記事はWordPressの管理画面で確認できます（下書き状態）。
```

### 指定日付でのテスト実行

```bash
$ node scripts/test-wordpress-api.js --date 2024-01-10

🧪 WordPress API テストスクリプト開始
...
📄 実際のブログ記事での投稿テスト実行中... (2024-01-10)
...
```

## 関連ファイル

- `scripts/test-wordpress-api.js`: WordPressテストスクリプト本体
- `package.json`: npmスクリプト定義
- `.env`: 環境変数設定ファイル
- `env.example`: 環境変数の例
- `logs/test/`: テスト結果保存ディレクトリ
- `blogs/created_blogs_md/`: 作成済みブログ記事ディレクトリ 
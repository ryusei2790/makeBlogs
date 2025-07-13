# .envファイル設定ガイド

このガイドでは、`.env`ファイルの設定方法について説明します。

## 概要

`.env`ファイルは、アプリケーションの設定情報を安全に管理するためのファイルです。機密情報（APIキーなど）を含むため、Gitにコミットされません。

## 設定手順

### 1. .envファイルの作成

```bash
# env.exampleをコピーして.envファイルを作成
cp env.example .env
```

### 2. 必要な設定項目

以下の項目を実際の値に置き換えてください：

#### Dify API設定（必須）

```bash
# Dify API設定
DIFY_API_URL=https://your-dify-app.dify.ai/v1/chat-messages
DIFY_API_KEY=your-dify-api-key
```

**設定方法：**
1. Difyの管理画面にログイン
2. アプリケーション設定からAPIエンドポイントとAPIキーを取得
3. 上記の値を実際の値に置き換え

#### WordPress設定（オプション）

```bash
# WordPress設定
WP_URL=https://yourdomain.com/wp-json/wp/v2/posts
WP_USER=your-username
WP_APP_PASSWORD=
```

**設定方法：**
1. `WP_URL`: WordPressサイトのREST APIエンドポイント
   - 例: `https://yourdomain.com/wp-json/wp/v2/posts`
2. `WP_USER`: WordPressのユーザー名
3. `WP_APP_PASSWORD`: WordPressのアプリケーションパスワード
   - WordPress管理画面 → ユーザー → プロフィール → アプリケーションパスワードで生成

#### MicroCMS設定（オプション）

```bash
# MicroCMS設定
ENDPOINT_URL=https://your-service.microcms.io/api/v1/blogs
API_KEY=your-microcms-api-key
```

**設定方法：**
1. MicroCMSの管理画面にログイン
2. API設定からエンドポイントURLとAPIキーを取得

#### ブログ記事生成設定（オプション）

```bash
# ブログ記事生成設定
BLOG_STYLE=学習記録
TARGET_AUDIENCE=初心者
TECHNICAL_FOCUS=React,Next.js
BLOG_LENGTH=標準
INCLUDE_CODE_EXAMPLES=true
SEO_KEYWORDS=React,useState,フロントエンド,学習記録
```

**設定項目の説明：**
- `BLOG_STYLE`: ブログのスタイル（学習記録、技術記事、チュートリアルなど）
- `TARGET_AUDIENCE`: ターゲット読者（初心者、中級者、上級者など）
- `TECHNICAL_FOCUS`: 技術的な焦点（React, Next.js, TypeScriptなど）
- `BLOG_LENGTH`: ブログの長さ（短い、標準、長い）
- `INCLUDE_CODE_EXAMPLES`: コード例を含むか（true/false）
- `SEO_KEYWORDS`: SEOキーワード（カンマ区切り）

#### 自動投稿設定（オプション）

```bash
# 自動投稿設定
AUTO_POST=false
AUTO_POST_WORDPRESS=true
AUTO_POST_MICROCMS=true
```

**設定項目の説明：**
- `AUTO_POST`: 全体的な自動投稿の有効/無効
- `AUTO_POST_WORDPRESS`: WordPressへの自動投稿の有効/無効
- `AUTO_POST_MICROCMS`: MicroCMSへの自動投稿の有効/無効

#### その他の設定（オプション）

```bash
# 次の日memo作成設定
CREATE_NEXT_DAY_MEMO=true

# 保存場所設定
LOG_DIR=./logs
BLOG_STRUCTURE_DIR=./blogs/memoToBlogs
CREATED_BLOGS_MD_DIR=./blogs/created_blogs_md
CREATED_BLOGS_JSON_DIR=./blogs/created_blogs_json
```

## 設定例

### 基本的な設定例

```bash
# Dify API設定（必須）
DIFY_API_URL=https://app.dify.ai/v1/chat-messages
DIFY_API_KEY=app-abc123def456

# ブログ記事生成設定
BLOG_STYLE=学習記録
TARGET_AUDIENCE=初心者
TECHNICAL_FOCUS=React,Next.js
BLOG_LENGTH=標準
INCLUDE_CODE_EXAMPLES=true
SEO_KEYWORDS=React,useState,フロントエンド,学習記録

# WordPress設定
WP_URL=https://myblog.com/wp-json/wp/v2/posts
WP_USER=admin
WP_APP_PASSWORD=9lTxkiA1OtMs$B7*ddub4G^w

# 自動投稿設定
AUTO_POST=true
AUTO_POST_WORDPRESS=true
AUTO_POST_MICROCMS=false

# その他の設定
CREATE_NEXT_DAY_MEMO=true
```

### テスト用設定例

```bash
# Dify API設定（必須）
DIFY_API_URL=https://app.dify.ai/v1/chat-messages
DIFY_API_KEY=app-abc123def456

# ブログ記事生成設定
BLOG_STYLE=学習記録
TARGET_AUDIENCE=初心者
TECHNICAL_FOCUS=React,Next.js
BLOG_LENGTH=標準
INCLUDE_CODE_EXAMPLES=true
SEO_KEYWORDS=React,useState,フロントエンド,学習記録

# WordPress設定（テスト用）
WP_URL=https://testblog.com/wp-json/wp/v2/posts
WP_USER=testuser
WP_APP_PASSWORD=test123456

# 自動投稿設定（テスト用）
AUTO_POST=false
AUTO_POST_WORDPRESS=false
AUTO_POST_MICROCMS=false

# その他の設定
CREATE_NEXT_DAY_MEMO=true
```

## セキュリティ注意事項

### 1. .envファイルの保護

- `.env`ファイルは絶対にGitにコミットしないでください
- `.gitignore`に`.env`が含まれていることを確認してください
- 機密情報を含むため、適切に管理してください

### 2. APIキーの管理

- APIキーは定期的に更新してください
- 不要になったAPIキーは削除してください
- 本番環境とテスト環境で異なるAPIキーを使用してください

### 3. WordPressアプリケーションパスワード

- アプリケーションパスワードは一度しか表示されません
- 安全な場所に保存してください
- 必要に応じて削除・再生成してください

## 設定確認

### 1. 環境変数の確認

```bash
# Dify APIテスト
npm run test:dify

# WordPress APIテスト
npm run test:wp
```

### 2. 設定値の確認

```bash
# 環境変数が正しく読み込まれているか確認
node -e "require('dotenv').config(); console.log('DIFY_API_URL:', process.env.DIFY_API_URL);"
```

## トラブルシューティング

### よくある問題

1. **環境変数が読み込まれない**
   - `.env`ファイルが正しい場所にあるか確認
   - ファイル名が`.env`（ドットで始まる）になっているか確認

2. **APIキーが無効**
   - APIキーが正しくコピーされているか確認
   - APIキーが有効期限切れでないか確認

3. **WordPress接続エラー**
   - `WP_URL`が正しい形式か確認
   - アプリケーションパスワードが正しく生成されているか確認

4. **権限エラー**
   - WordPressユーザーに投稿権限があるか確認
   - MicroCMSのAPIキーに適切な権限があるか確認

## 関連ファイル

- `.env`: 環境変数設定ファイル（このファイル）
- `env.example`: 環境変数の例
- `scripts/test-dify-api.js`: Dify APIテストスクリプト
- `scripts/test-wordpress-api.js`: WordPress APIテストスクリプト 
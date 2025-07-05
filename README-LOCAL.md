# ローカル環境での実行方法

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
# 環境変数ファイルの例をコピー
cp env.example .env

# .envファイルを編集して実際の値を設定
nano .env
```

### 3. 必要な環境変数

#### 必須
- `DIFY_API_URL`: Dify APIのエンドポイントURL
- `DIFY_API_KEY`: Dify APIのAPIキー

#### オプション
- `ENDPOINT_URL`: MicroCMSのエンドポイントURL
- `API_KEY`: MicroCMSのAPIキー
- `AUTO_POST`: 自動投稿の有効/無効（true/false）
- `LOG_DIR`: ログファイルの保存場所
- `BLOG_STRUCTURE_DIR`: ブログ構成案の保存場所
- `CREATED_BLOGS_MD_DIR`: 完成ブログMDの保存場所
- `CREATED_BLOGS_JSON_DIR`: 完成ブログJSONの保存場所

## 実行方法

### 1. 常時起動デーモン（推奨）
```bash
# デーモンを開始（毎日深夜1時に自動実行）
npm run daemon

# デーモンのステータス確認
npm run daemon:status

# 即座に実行（テスト用）
npm run daemon:run-now
```

### 2. 簡単実行（1回だけ）
```bash
npm run local
```

### 3. 直接実行
```bash
node scripts/index.js
```

### 4. 開発モード
```bash
npm run dev
```

### 5. ファイル監視モード
```bash
npm run watch
```

## 定期実行の設定

### 1. デーモン方式（推奨）
```bash
# デーモンを開始（毎日深夜1時に自動実行）
npm run daemon

# バックグラウンドで実行
nohup npm run daemon > logs/daemon.log 2>&1 &

# デーモンのステータス確認
npm run daemon:status
```

### 2. systemdサービス（Linux）
```bash
# サービスファイルを編集
sudo nano scripts/blog-daemon.service

# サービスを有効化
sudo cp scripts/blog-daemon.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable blog-daemon
sudo systemctl start blog-daemon

# ステータス確認
sudo systemctl status blog-daemon
```

### 3. launchd（macOS）
```bash
# plistファイルを編集
nano scripts/com.blog.daemon.plist

# サービスを登録
cp scripts/com.blog.daemon.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.blog.daemon.plist

# ステータス確認
launchctl list | grep blog
```

### 4. cron方式（従来）
```bash
# cronジョブを設定（毎日深夜1時に実行）
npm run cron-setup

# 現在のcronジョブを確認
crontab -l

# cronジョブを削除
crontab -e
```

## 生成されるファイル

実行後、以下のファイルが生成されます：

### 1. ログファイル
- `logs/yyyy-mm-dd-dify-response.json`: Dify APIの応答ログ

### 2. ブログ構成案
- `blogs/memoToBlogs/yyyy-mm-dd.md`: ブログ記事の構成案

### 3. 完成ブログ記事
- `blogs/created_blogs_md/yyyy-mm-dd-script.md`: SEO対策済みMarkdown記事
- `blogs/created_blogs_json/yyyy-mm-dd-script.json`: 構造化JSONデータ

## トラブルシューティング

### よくある問題

1. **環境変数が設定されていない**
   ```
   ❌ 必要な環境変数が設定されていません:
      - DIFY_API_URL
      - DIFY_API_KEY
   ```
   → `.env`ファイルを確認してください

2. **memoファイルが見つからない**
   ```
   Memo file not found: memo/2025-07-04-topic.md
   ```
   → `memo/`ディレクトリに該当日付のファイルがあるか確認してください

3. **Dify APIエラー**
   ```
   Error posting to Dify API: HTTP error! status: 401
   ```
   → APIキーとエンドポイントURLを確認してください

### デバッグ方法

```bash
# 詳細なログを出力
DEBUG=* npm run local

# 特定の日付でテスト
node scripts/index.js --date=2025-07-04
```

## 設定例

### .envファイルの例
```bash
# Dify API設定
DIFY_API_URL=https://your-dify-app.dify.ai/v1/chat-messages
DIFY_API_KEY=your-dify-api-key

# MicroCMS設定（オプション）
ENDPOINT_URL=https://your-service.microcms.io/api/v1/blogs
API_KEY=your-microcms-api-key

# 自動投稿設定
AUTO_POST=false

# 保存場所設定
LOG_DIR=./logs
BLOG_STRUCTURE_DIR=./blogs/memoToBlogs
CREATED_BLOGS_MD_DIR=./blogs/created_blogs_md
CREATED_BLOGS_JSON_DIR=./blogs/created_blogs_json
```

## 注意事項

- `.env`ファイルはGitにコミットしないでください
- APIキーは安全に管理してください
- 初回実行時はmemoファイルが存在することを確認してください 
# blogArticles 自動ブログ記事生成システム

## 概要
このリポジトリは、日々の学習メモ（`memo/yyyy-mm-dd-topic.md`）を基に、Dify APIを使用して自動的にブログ記事を生成し、microCMSに投稿するシステムです。

## ディレクトリ構成
- `memo/` : 日々の学習メモファイル
- `blogs/memoToBlogs/` : ブログ記事構成案
- `blogs/created_blogs_md/` : 完成ブログ記事（Markdown）
- `blogs/created_blogs_json/` : 完成ブログ記事（JSON）
- `logs/` : 実行ログ
- `scripts/` : 各種スクリプト
- `package.json` : 依存パッケージ・npmスクリプト定義

## 必要な環境
- Node.js（v16以上推奨）
- Dify APIのエンドポイントとAPIキー
- microCMSのAPIエンドポイントとAPIキー（オプション）

## セットアップ手順

### 1. **依存パッケージのインストール**
```bash
npm install
```

### 2. **環境変数の設定**
```bash
# 環境変数ファイルの例をコピー
cp env.example .env

# .envファイルを編集して実際の値を設定
nano .env
```

### 3. **システム起動**
```bash
# デーモンモードで実行（毎日1AMに自動実行）
npm run daemon
```

**必須の環境変数:**
- `DIFY_API_URL`: Dify APIのエンドポイントURL
- `DIFY_API_KEY`: Dify APIのAPIキー

**オプションの環境変数:**
- `BLOG_STYLE`: ブログ記事のスタイル（学習記録、技術解説、トラブルシュート、実践メモ）
- `TARGET_AUDIENCE`: ターゲット読者（初心者、中級者、上級者）
- `TECHNICAL_FOCUS`: 技術フォーカス（React, Next.js等）
- `BLOG_LENGTH`: 記事の長さ（短い、標準、長い）
- `INCLUDE_CODE_EXAMPLES`: コード例の有無（true/false）
- `SEO_KEYWORDS`: SEOキーワード
- `AUTO_POST`: 自動投稿の有効/無効（true/false）
- `ENDPOINT_URL`: MicroCMSのエンドポイントURL
- `API_KEY`: MicroCMSのAPIキー

### 3. **Difyアプリの設定**
- Difyアプリで変数を定義（`Dify変数定義書.md`を参照）
- ワークフローを公開状態にする

### 4. **memoファイルの準備**
- `memo/yyyy-mm-dd-topic.md`形式でメモファイルを作成

## クイックスタート
```bash
# 1. 依存パッケージのインストール
npm install

# 2. 環境変数の設定
cp env.example .env
nano .env

# 3. システム起動
npm run daemon
```

## 実行方法

### 1. **手動実行（1回のみ）**
```bash
# 最新のmemoファイルを処理
npm start

# または
node scripts/index.js
```

### 2. **ローカル実行（開発・テスト用）**
```bash
# ローカル環境で実行
npm run local

# または
node scripts/run-local.js
```

### 3. **デーモン実行（継続実行）**
```bash
# デーモンモードで実行（毎日1AMに自動実行）
npm run daemon

# または
node scripts/daemon.js
```

### 4. **ファイル監視モード**
```bash
# 新しいMarkdownファイルを監視して自動投稿
npm run watch

# または
node scripts/autoPostToMicroCMS.js
```

## ワークフロー
1. `memo/yyyy-mm-dd-topic.md`ファイルを読み込み
2. Dify APIにメモ内容を送信してブログ記事構成を取得
3. ブログ記事構成を`blogs/memoToBlogs/`に保存
4. 完成ブログ記事を`blogs/created_blogs_md/`と`blogs/created_blogs_json/`に保存
5. オプションでmicroCMSに自動投稿
6. 投稿成功時、翌日のmemoファイルを自動作成

## システム停止方法

### デーモン停止
```bash
# Ctrl+Cで停止
# または
pkill -f "node scripts/daemon.js"

# systemdの場合
sudo systemctl stop blog-daemon

# launchdの場合（macOS）
launchctl unload ~/Library/LaunchAgents/com.blog.daemon.plist
```

## memoファイルの書式
`memo/yyyy-mm-dd-topic.md`形式で作成してください。

例：
```markdown
# 今日の学習内容

## 学んだこと
- ReactのuseStateについて
- ページネーションの実装方法

## 気づいたこと
- 状態管理の重要性
- パフォーマンスの考慮点

## 次に学びたいこと
- useEffectの使い方
- カスタムフックの作成
```

## 注意点
- Dify APIの応答には`answer`フィールドが含まれている必要があります
- 投稿失敗時はエラーメッセージがコンソールに表示されます
- ログは`logs/`ディレクトリに保存されます
- 環境変数`AUTO_POST=true`の場合のみmicroCMSに投稿されます

## トラブルシューティング

### よくある問題
1. **Dify APIエラー**: APIキーとエンドポイントURLを確認
2. **ファイルが見つからない**: memoファイルの命名規則を確認
3. **投稿エラー**: microCMSのAPIキーとエンドポイントを確認

### ログの確認
```bash
# 最新のログを確認
tail -f logs/latest.log
```

## 依存パッケージ
- dotenv: 環境変数管理
- node-fetch: HTTPリクエスト
- fs-extra: ファイル操作
- moment: 日付処理

## ライセンス
本リポジトリはMITライセンスです。 
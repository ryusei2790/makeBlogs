# Dify API テストスクリプト

このドキュメントでは、DifyへのPOSTリクエストをテストするスクリプトの使用方法について説明します。

## 概要

`scripts/test-dify-api.js` は、Dify APIとの接続と通信をテストするためのスクリプトです。以下の機能を提供します：

- 環境変数の確認
- Dify APIへの接続テスト
- サンプルメモでのテスト
- 実際のmemoファイルでのテスト
- テスト結果の保存

## 前提条件

1. `.env`ファイルが設定されていること
2. 以下の環境変数が設定されていること：
   - `DIFY_API_URL`: Dify APIのエンドポイントURL
   - `DIFY_API_KEY`: Dify APIの認証キー

## 使用方法

### 基本的な使用方法

```bash
# npmスクリプトを使用
npm run test:dify

# または直接実行
node scripts/test-dify-api.js
```

### オプション付きの使用方法

```bash
# ヘルプを表示
npm run test:dify:help
# または
node scripts/test-dify-api.js --help

# 指定した日付のmemoファイルでテスト
node scripts/test-dify-api.js --date 2024-01-15
# または
node scripts/test-dify-api.js -d 2024-01-15
```

## テスト内容

### 1. 環境変数の確認

スクリプトは最初に以下の環境変数を確認します：

**必須環境変数:**
- `DIFY_API_URL`: Dify APIのエンドポイントURL
- `DIFY_API_KEY`: Dify APIの認証キー

**オプション環境変数:**
- `BLOG_STYLE`: ブログスタイル（デフォルト: "学習記録"）
- `TARGET_AUDIENCE`: ターゲット読者（デフォルト: "初心者"）
- `TECHNICAL_FOCUS`: 技術的焦点
- `BLOG_LENGTH`: ブログ長（デフォルト: "標準"）
- `INCLUDE_CODE_EXAMPLES`: コード例を含むか（デフォルト: true）
- `SEO_KEYWORDS`: SEOキーワード

### 2. API接続テスト

Dify APIへの基本的な接続をテストします：
- HTTPリクエストの送信
- レスポンスの確認
- エラーハンドリング

### 3. サンプルメモでのテスト

事前に定義されたサンプルメモ内容を使用してAPIをテストします：
- ReactのuseStateに関する学習メモ
- 実際のAPI呼び出し
- レスポンスの検証

### 4. 実際のmemoファイルでのテスト

`memo/`ディレクトリ内の実際のmemoファイルを使用してテストします：
- 指定した日付のmemoファイルを読み込み
- 実際のメモ内容でAPIをテスト
- ファイルが存在しない場合はスキップ

## 出力ファイル

テスト結果は `logs/test/` ディレクトリに保存されます：

- `test-YYYY-MM-DD.json`: サンプルメモテストの結果
- `test-real-YYYY-MM-DD.json`: 実際のmemoファイルテストの結果

### 出力ファイルの構造

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "testType": "sample-memo",
  "request": {
    "memoContent": "...",
    "inputs": {
      "blog_style": "学習記録",
      "target_audience": "初心者",
      "technical_focus": "",
      "blog_length": "標準",
      "include_code_examples": true,
      "seo_keywords": ""
    }
  },
  "response": {
    "answer": "...",
    "message_id": "...",
    "conversation_id": "...",
    "metadata": {
      "usage": {
        "total_tokens": 1000,
        "prompt_tokens": 500,
        "completion_tokens": 500
      }
    }
  }
}
```

## エラーハンドリング

スクリプトは以下のエラーを適切に処理します：

- 環境変数の未設定
- API接続エラー
- HTTPエラー（4xx, 5xx）
- ファイル読み込みエラー
- JSONパースエラー

## トラブルシューティング

### よくある問題と解決方法

1. **環境変数が設定されていない**
   ```
   ❌ 必須環境変数が設定されていません。
   ```
   → `.env`ファイルを作成し、`DIFY_API_URL`と`DIFY_API_KEY`を設定してください。

2. **API接続エラー**
   ```
   ❌ Dify APIへの接続に失敗しました。
   ```
   → API URLとAPI Keyが正しいか確認してください。

3. **memoファイルが見つからない**
   ```
   ⚠️ memoファイルが見つかりません
   ```
   → 指定した日付のmemoファイルが`memo/`ディレクトリに存在するか確認してください。

## 例

### 基本的なテスト実行

```bash
$ npm run test:dify

🧪 Dify API テストスクリプト開始

==================================================
🔍 環境変数の確認中...

📋 必須環境変数:
   ✅ DIFY_API_URL: https://your-app.dify.ai/v1/chat-messages
   ✅ DIFY_API_KEY: ***abcd

📋 オプション環境変数:
   ✅ BLOG_STYLE: 学習記録
   ✅ TARGET_AUDIENCE: 初心者
   ⚠️ TECHNICAL_FOCUS: 未設定
   ✅ BLOG_LENGTH: 標準
   ✅ INCLUDE_CODE_EXAMPLES: true
   ⚠️ SEO_KEYWORDS: 未設定

🔗 Dify API接続テスト中...

📡 HTTP Status: 200 OK
✅ API接続成功！
📝 レスポンスID: msg_123456
💬 応答: これは接続テストです。簡単な応答を返してください。...

📝 サンプルメモでのテスト実行中...

✅ サンプルメモテスト成功！
📝 レスポンスID: msg_123457
💬 応答長: 1250 文字
📊 使用量: { total_tokens: 1500, prompt_tokens: 800, completion_tokens: 700 }
💾 テスト結果を保存: logs/test/test-2024-01-15.json

📄 実際のmemoファイルでのテスト実行中... (2024-01-15)

📖 memoファイル読み込み成功: memo/2024-01-15-topic.md
📝 内容長: 450 文字

✅ 実際のmemoテスト成功！
📝 レスポンスID: msg_123458
💬 応答長: 980 文字
💾 テスト結果を保存: logs/test/test-real-2024-01-15.json

==================================================
📊 テスト結果サマリー:
   ✅ 環境変数: OK
   ✅ API接続: OK
   ✅ サンプルメモテスト: OK
   ✅ 実際のmemoテスト: OK

🎉 すべてのテストが成功しました！
📁 テスト結果は logs/test/ ディレクトリに保存されています。
```

### 指定日付でのテスト実行

```bash
$ node scripts/test-dify-api.js --date 2024-01-10

🧪 Dify API テストスクリプト開始
...
📄 実際のmemoファイルでのテスト実行中... (2024-01-10)
...
```

## 関連ファイル

- `scripts/test-dify-api.js`: テストスクリプト本体
- `package.json`: npmスクリプト定義
- `.env`: 環境変数設定ファイル
- `env.example`: 環境変数の例
- `logs/test/`: テスト結果保存ディレクトリ 
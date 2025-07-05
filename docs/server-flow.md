# サーバー側処理フロー説明書

## 概要
このドキュメントでは、GitHub Actionsで実行される`scripts/index.js`の処理フローと、サーバー側（Dify API）での処理について説明します。

## 全体の処理フロー

### 1. GitHub Actions実行フロー
```
GitHub Actions (毎日深夜1時)
    ↓
Node.js環境セットアップ    ココって毎回セットアップする必要あるのかな？だったらvercelにデプロイする方がいいのかな
    ↓
依存関係インストール (npm install)
    ↓
scripts/index.js実行
    ↓
memoファイル読み込み
    ↓
Dify APIにPOSTリクエスト
    ↓
レスポンス保存
```

### 2. scripts/index.jsの処理詳細

#### 2.1 日付取得処理
```javascript
function getTodayDate() {
  const now = new Date();
  const jstOffset = 9 * 60; // JST = UTC+9
  const jstTime = new Date(now.getTime() + jstOffset * 60000);
  
  const year = jstTime.getFullYear();
  const month = String(jstTime.getMonth() + 1).padStart(2, '0');
  const day = String(jstTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
```

**カスタマイズ方法:**
- タイムゾーン変更: `jstOffset`の値を変更
- 日付フォーマット変更: 返り値の文字列形式を変更

#### 2.2 memoファイル読み込み処理
```javascript
function readMemoFile(date) {
  const memoPath = path.join(__dirname, '..', 'memo', `${date}-topic.md`);
  // ...
}
```

**カスタマイズ方法:**
- ファイルパス変更: `memoPath`の構築方法を変更
- ファイル名パターン変更: `${date}-topic.md`の部分を変更
- 複数ファイル読み込み: 配列で複数のファイルを処理

#### 2.3 Dify API送信処理
```javascript
async function postToDify(memoContent) {
  const response = await fetch(DIFY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: {},
      query: `以下のメモ内容を分析して、ブログ記事のアイデアや技術的な考察を提案してください：\n\n${memoContent}`,
      response_mode: "blocking",
      user: "github-actions"
    })
  });
}
```

**カスタマイズ方法:**
- プロンプト変更: `query`の内容を変更
- 追加パラメータ: `inputs`オブジェクトに追加データを設定
- レスポンスモード変更: `response_mode`を"streaming"に変更
- ユーザー識別子変更: `user`フィールドを変更

#### 2.4 結果保存処理
```javascript
function saveResult(date, memoContent, difyResponse) {
  const logDir = path.join(__dirname, '..', 'logs');
  const logPath = path.join(logDir, `${date}-dify-response.json`);
  // ...
}
```

**カスタマイズ方法:**
- 保存先変更: `logDir`のパスを変更
- ファイル名変更: `logPath`の命名規則を変更
- 保存形式変更: JSON以外の形式（CSV、TXT等）に変更

## サーバー側（Dify API）の処理フロー

### 1. Dify API受信処理
```
Dify API受信
    ↓
リクエスト認証 (Bearer Token)
    ↓
JSONペイロード解析
    ↓
プロンプト処理
    ↓
AIモデル実行
    ↓
レスポンス生成
    ↓
JSONレスポンス返却
```

### 2. Dify API設定項目

#### 2.1 認証設定
- **API Key**: Bearer Token認証
- **Rate Limiting**: リクエスト制限
- **IP制限**: 許可IPアドレス設定

#### 2.2 プロンプト設定
- **システムプロンプト**: AIの役割定義
- **ユーザープロンプト**: 具体的な指示
- **コンテキスト**: 過去の会話履歴

#### 2.3 モデル設定
- **AIモデル**: GPT-4、Claude等
- **温度設定**: 創造性の調整
- **最大トークン**: レスポンス長制限

## カスタマイズ例

### 例1: プロンプトの変更
```javascript
// 現在のプロンプト
query: `以下のメモ内容を分析して、ブログ記事のアイデアや技術的な考察を提案してください：\n\n${memoContent}`

// カスタマイズ例：より具体的な指示
query: `以下のメモ内容を分析し、以下の形式でブログ記事の提案をしてください：
1. タイトル案（3つ）
2. 見出し構成
3. 技術的なポイント
4. 読者への価値

メモ内容：
${memoContent}`
```

### 例2: 複数ファイル処理
```javascript
// 複数のmemoファイルを処理
async function processMultipleMemos() {
  const dates = ['2025-07-04', '2025-07-05', '2025-07-06'];
  
  for (const date of dates) {
    const memoContent = readMemoFile(date);
    if (memoContent) {
      const response = await postToDify(memoContent);
      saveResult(date, memoContent, response);
    }
  }
}
```

### 例3: エラーハンドリング強化
```javascript
async function postToDify(memoContent) {
  try {
    const response = await fetch(DIFY_API_URL, {
      // ... 既存の設定
    });
    
    if (!response.ok) {
      // リトライロジック
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return await postToDify(memoContent); // 再帰呼び出し
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error posting to Dify API: ${error.message}`);
    // エラーログ保存
    saveErrorLog(error);
    return null;
  }
}
```

### 例4: 結果の後処理
```javascript
function processDifyResponse(difyResponse) {
  // AIの回答を解析して構造化
  const analysis = {
    blogIdeas: extractBlogIdeas(difyResponse.answer),
    technicalPoints: extractTechnicalPoints(difyResponse.answer),
    nextSteps: extractNextSteps(difyResponse.answer)
  };
  
  return analysis;
}
```

## トラブルシューティング

### よくある問題と解決方法

1. **API認証エラー**
   - DIFY_API_KEYが正しく設定されているか確認
   - API Keyの有効期限を確認

2. **ファイル読み込みエラー**
   - memoファイルが存在するか確認
   - ファイルパスが正しいか確認

3. **ネットワークエラー**
   - Dify APIのエンドポイントURLが正しいか確認
   - ネットワーク接続を確認

4. **レスポンス形式エラー**
   - Dify APIのレスポンス形式を確認
   - JSONパース処理を確認

## 監視とログ

### ログファイルの確認
- `logs/yyyy-mm-dd-dify-response.json`: 実行結果
- GitHub Actionsのログ: 実行状況

### 監視項目
- 実行頻度
- エラー率
- レスポンス時間
- API使用量

## セキュリティ考慮事項

1. **API Key管理**
   - GitHub Secretsで安全に管理
   - 定期的なキーローテーション

2. **データ保護**
   - 機密情報のログ出力を避ける
   - ログファイルのアクセス制限

3. **レート制限**
   - API使用量の監視
   - 適切な間隔での実行 
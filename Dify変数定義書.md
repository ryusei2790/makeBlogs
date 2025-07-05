# Dify変数定義書・設定ガイド

## 📋 Dify側で定義する変数一覧

### **1. 必須変数（現在使用中）**

#### **memo_content**
- **タイプ**: `Text`
- **必須**: `true`
- **説明**: メモファイルの全内容
- **用途**: ブログ記事生成の元データ
- **例**: `memo/yyyy-mm-dd-topic.md`の全内容

### **2. 推奨追加変数**

#### **blog_style**
- **タイプ**: `Select`
- **必須**: `false`
- **デフォルト**: `学習記録`
- **オプション**:
  - `学習記録`
  - `技術解説`
  - `トラブルシュート`
  - `実践メモ`
- **説明**: ブログ記事のスタイルを指定
- **用途**: 記事のトーンや構成を調整

#### **target_audience**
- **タイプ**: `Select`
- **必須**: `false`
- **デフォルト**: `初心者`
- **オプション**:
  - `初心者`
  - `中級者`
  - `上級者`
- **説明**: ターゲット読者のレベル
- **用途**: 説明の詳細度を調整

#### **technical_focus**
- **タイプ**: `Text`
- **必須**: `false`
- **説明**: 特に注目すべき技術分野
- **用途**: 技術的なポイントの抽出を強化
- **例**: `React`, `Next.js`, `Firebase`, `TypeScript`

#### **blog_length**
- **タイプ**: `Select`
- **必須**: `false`
- **デフォルト**: `標準`
- **オプション**:
  - `短い（500字程度）`
  - `標準（1000字程度）`
  - `長い（2000字程度）`
- **説明**: 希望する記事の長さ
- **用途**: 記事の詳細度を調整

#### **include_code_examples**
- **タイプ**: `Boolean`
- **必須**: `false`
- **デフォルト**: `true`
- **説明**: コード例を含めるかどうか
- **用途**: コード例の有無を制御

#### **seo_keywords**
- **タイプ**: `Text`
- **必須**: `false`
- **説明**: SEO用のキーワード（カンマ区切り）
- **用途**: メタデータの生成
- **例**: `React, useState, ページネーション, フロントエンド`

## 🔧 Dify側での設定方法

### **1. 変数の追加手順**

1. **Difyアプリの編集画面に移動**
2. **「変数」タブを選択**
3. **「変数を追加」をクリック**
4. **各変数を上記の仕様で追加**

### **2. プロンプトの更新**

```markdown
以下のメモ内容を分析して、ブログ記事のアイデアや技術的な考察を提案してください。

## 入力情報
- **メモ内容**: {{memo_content}}
- **記事スタイル**: {{blog_style}}
- **ターゲット読者**: {{target_audience}}
- **技術フォーカス**: {{technical_focus}}
- **記事の長さ**: {{blog_length}}
- **コード例**: {{include_code_examples}}
- **SEOキーワード**: {{seo_keywords}}

## 出力形式
以下の形式で回答してください：

### 1. 記事タイトル案
- 学習記録系: [タイトル1]
- 実践メモ系: [タイトル2]
- トラブルシュート系: [タイトル3]

### 2. 記事構成
- はじめに
- 背景・目的
- 問題の発生
- 試行錯誤・考察
- 解決策・実装
- まとめ & 次回予告

### 3. 技術的なポイント
- [技術ポイント1]
- [技術ポイント2]
- [技術ポイント3]

### 4. ブログ記事のアイデア
- [アイデア1]
- [アイデア2]
- [アイデア3]

### 5. コード例（必要な場合）
```javascript
// コード例
```

### 6. SEOメタデータ
- **description**: [記事の説明]
- **keywords**: [キーワード]
- **tags**: [タグ]

注意事項：
- ターゲット読者のレベルに合わせた説明
- 実体験に基づく具体的な内容
- 親しみやすく読みやすい文体
- 技術的な正確性の確保
```

## 📝 scripts/index.jsの修正

### **現在の実装**
```javascript
body: JSON.stringify({
  inputs: {
    memo_content: memoContent
  },
  query: `以下のメモ内容を分析して、ブログ記事のアイデアや技術的な考察を提案してください：\n\n${memoContent}`,
  response_mode: "blocking",
  user: "github-actions"
})
```

### **修正後の実装**
```javascript
body: JSON.stringify({
  inputs: {
    memo_content: memoContent,
    blog_style: process.env.BLOG_STYLE || "学習記録",
    target_audience: process.env.TARGET_AUDIENCE || "初心者",
    technical_focus: process.env.TECHNICAL_FOCUS || "",
    blog_length: process.env.BLOG_LENGTH || "標準",
    include_code_examples: process.env.INCLUDE_CODE_EXAMPLES !== "false",
    seo_keywords: process.env.SEO_KEYWORDS || ""
  },
  query: `以下のメモ内容を分析して、ブログ記事のアイデアや技術的な考察を提案してください：\n\n${memoContent}`,
  response_mode: "blocking",
  user: "github-actions"
})
```

## 🔧 環境変数の追加

### **env.exampleの更新**
```bash
# Dify API設定
DIFY_API_URL=https://your-dify-app.dify.ai/v1/chat-messages
DIFY_API_KEY=your-dify-api-key

# ブログ記事生成設定
BLOG_STYLE=学習記録
TARGET_AUDIENCE=初心者
TECHNICAL_FOCUS=React,Next.js
BLOG_LENGTH=標準
INCLUDE_CODE_EXAMPLES=true
SEO_KEYWORDS=React,useState,フロントエンド,学習記録

# MicroCMS設定（オプション）
ENDPOINT_URL=https://your-service.microcms.io/api/v1/blogs
API_KEY=your-microcms-api-key

# 自動投稿設定（オプション）
AUTO_POST=false

# 次の日memo作成設定（オプション）
CREATE_NEXT_DAY_MEMO=true

# memoテンプレート設定（オプション）
# MEMO_TEMPLATE=カスタムテンプレート内容

# 保存場所設定（オプション）
LOG_DIR=./logs
BLOG_STRUCTURE_DIR=./blogs/memoToBlogs
CREATED_BLOGS_MD_DIR=./blogs/created_blogs_md
CREATED_BLOGS_JSON_DIR=./blogs/created_blogs_json
```

## 🎯 変数の効果

### **1. blog_style**
- **学習記録**: 「【学習記録】〜」形式のタイトル
- **技術解説**: 「【完全ガイド】〜」形式のタイトル
- **トラブルシュート**: 「【解決】〜」形式のタイトル
- **実践メモ**: 「【実践】〜」形式のタイトル

### **2. target_audience**
- **初心者**: 基礎から丁寧に説明、専門用語の解説付き
- **中級者**: 実践的な内容、コード例重視
- **上級者**: 高度な技術的考察、最適化手法

### **3. technical_focus**
- 指定された技術分野に特化した内容
- 関連する技術の説明を強化
- 技術的なポイントの抽出を改善

### **4. blog_length**
- **短い**: 要点のみ、簡潔な説明
- **標準**: バランスの取れた内容
- **長い**: 詳細な説明、複数の例

### **5. include_code_examples**
- **true**: 具体的なコード例を含む
- **false**: コード例なし、概念的な説明

### **6. seo_keywords**
- メタデータの自動生成
- 検索エンジン最適化
- 関連記事の提案

## 📊 使用例

### **例1: React学習記録**
```bash
BLOG_STYLE=学習記録
TARGET_AUDIENCE=初心者
TECHNICAL_FOCUS=React,useState
BLOG_LENGTH=標準
INCLUDE_CODE_EXAMPLES=true
SEO_KEYWORDS=React,useState,フロントエンド,学習記録
```

### **例2: 技術解説記事**
```bash
BLOG_STYLE=技術解説
TARGET_AUDIENCE=中級者
TECHNICAL_FOCUS=Next.js,Firebase
BLOG_LENGTH=長い
INCLUDE_CODE_EXAMPLES=true
SEO_KEYWORDS=Next.js,Firebase,認証,実装
```

### **例3: トラブルシュート**
```bash
BLOG_STYLE=トラブルシュート
TARGET_AUDIENCE=初心者
TECHNICAL_FOCUS=TypeScript,エラー解決
BLOG_LENGTH=標準
INCLUDE_CODE_EXAMPLES=true
SEO_KEYWORDS=TypeScript,エラー,解決,デバッグ
```

## ✅ 実装手順

1. **Dify側で変数を定義**
2. **プロンプトを更新**
3. **scripts/index.jsを修正**
4. **環境変数を設定**
5. **テスト実行**

これにより、より柔軟で高品質なブログ記事生成が可能になります！ 
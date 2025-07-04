# blogArticles ワークフロー・説明書

## 概要
このリポジトリは、Markdown形式で作成したブログ記事（`blogs/created_blogs/`配下）を自動的にmicroCMSへ投稿するワークフローを提供します。

## ディレクトリ構成
- `blogs/created_blogs/` : 投稿対象のMarkdownファイルを配置するディレクトリ
- `scripts/autoPostToMicroCMS.js` : ファイル監視＆自動投稿スクリプト
- `scripts/postToMicroCMS.js` : microCMSへの投稿処理本体
- `package.json` : 依存パッケージ・npmスクリプト定義

## 必要な環境
- Node.js（v16以上推奨）
- microCMSのAPIエンドポイントとAPIキー

## セットアップ手順
1. **依存パッケージのインストール**

   ```sh
   npm install chokidar node-fetch gray-matter
   ```
   ※ `chokidar`と`node-fetch`は`package.json`に未記載の場合があるため、明示的にインストールしてください。

2. **環境変数の設定**

   `.env`ファイル、またはシェルの環境変数として以下を設定してください：
   - `ENDPOINT_URL` : microCMSのエンドポイントURL
   - `API_KEY` : microCMSのAPIキー

   例：
   ```sh
   export ENDPOINT_URL="https://xxxx.microcms.io/api/v1/blogs"
   export API_KEY="your-microcms-api-key"
   ```

3. **ディレクトリの準備**
   - `blogs/created_blogs/` ディレクトリが存在しない場合は作成してください。

## ワークフロー
1. `npm start` または `node scripts/autoPostToMicroCMS.js` を実行します。
2. `blogs/created_blogs/` に新しいMarkdownファイル（拡張子`.md`）を追加すると、自動的にmicroCMSへ投稿されます。
3. 投稿が完了すると、コンソールに完了メッセージが表示されます。

## Markdownファイルの書式
ファイル先頭にFrontMatter形式でメタデータ（title, description, keywords, date, author, tagsなど）を記載してください。

例：
```markdown
---
title: "記事タイトル"
description: "記事の説明"
keywords: ["keyword1", "keyword2"]
date: "2024-07-01"
author: "著者名"
tags: ["tag1", "tag2"]
---

本文...
```

## 注意点
- microCMSのスキーマに合わせてFrontMatterの項目を調整してください。
- 投稿失敗時はエラーメッセージがコンソールに表示されます。
- 既存記事の更新や削除には対応していません（新規追加のみ）。

## 依存パッケージ
- chokidar : ファイル監視
- node-fetch : HTTPリクエスト
- gray-matter : MarkdownのFrontMatterパース

## ライセンス
本リポジトリはMITライセンスです。 
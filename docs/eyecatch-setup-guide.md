# アイキャッチ画像設定ガイド

## 概要

MicroCMSへの投稿時に使用されるアイキャッチ画像の設定方法について説明します。

## ディレクトリ構造

```
public/
└── image/
    ├── default-eyecatch.jpg
    ├── react-learning.jpg
    ├── javascript-basics.jpg
    └── ...
```

## 環境変数設定

`.env`ファイルに以下の設定を追加してください：

```bash
# アイキャッチ画像設定
EYECATCH_IMAGE=default-eyecatch.jpg
EYECATCH_BASE_URL=https://yourdomain.com
```

### パラメータ説明

- `EYECATCH_IMAGE`: `public/image/`ディレクトリ内の画像ファイル名
- `EYECATCH_BASE_URL`: 画像を公開するドメインのベースURL

## 画像の配置

1. `public/image/`ディレクトリを作成
2. アイキャッチ画像を配置
3. 推奨サイズ: 1200x630px（SNSシェア用）

## 使用例

### 1. デフォルト画像を使用
```bash
EYECATCH_IMAGE=default-eyecatch.jpg
EYECATCH_BASE_URL=https://example.com
```

### 2. 学習内容に応じて画像を変更
```bash
# React学習時
EYECATCH_IMAGE=react-learning.jpg

# JavaScript学習時
EYECATCH_IMAGE=javascript-basics.jpg
```

### 3. 動的な画像選択（将来的な拡張）
現在は固定の画像を使用していますが、将来的には学習内容に応じて自動的に画像を選択する機能を追加できます。

## 画像の準備

### 推奨仕様
- **サイズ**: 1200x630px
- **形式**: JPG, PNG, WebP
- **ファイルサイズ**: 1MB以下
- **内容**: プログラミング、学習、技術関連の画像

### 画像ソース
- Unsplash
- Pexels
- 自作画像
- 商用利用可能な画像

## トラブルシューティング

### 画像が表示されない場合
1. ファイルパスが正しいか確認
2. `EYECATCH_BASE_URL`が正しく設定されているか確認
3. 画像ファイルが存在するか確認

### 画像サイズが大きすぎる場合
1. 画像を1200x630pxにリサイズ
2. 画像圧縮ツールを使用
3. WebP形式に変換

## カスタマイズ

### 動的なalt属性
```javascript
alt: `${blogStructure.title} - 開発日記`
```

### 複数の画像から選択
```javascript
const images = ['react.jpg', 'javascript.jpg', 'vue.jpg'];
const randomImage = images[Math.floor(Math.random() * images.length)];
```

## 注意事項

- 画像の著作権に注意してください
- 商用利用可能な画像を使用してください
- 画像サイズは適切に最適化してください
- アクセシビリティのためalt属性を適切に設定してください 
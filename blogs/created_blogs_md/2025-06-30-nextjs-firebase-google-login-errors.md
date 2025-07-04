---
title: "【第2回】Next.js × Firebaseチャット構想！Googleログイン実装でハマったエラーと解決策"
description: "Next.js App RouterでGoogleログインを実装する際に遭遇した「React Context is unavailable in Server Components」エラーの解決方法を実体験ベースで解説。Server ComponentとClient Componentの使い分けについても詳しく説明します。"
keywords: "Next.js, Firebase, Googleログイン, NextAuth.js, App Router, Server Component, Client Component, エラー解決"
date: "2025-06-30"
author: "Ryusei"
tags: ["Next.js", "Firebase", "認証", "エラー解決", "App Router"]
---

# 【第2回】Next.js × Firebaseチャット構想！Googleログイン実装でハマったエラーと解決策

こんにちは！Ryuseiです。

今回は、前回のチャット構想に続いて、**Googleログイン機能の実装**で実際に遭遇したエラーとその解決策について、自分用の備忘録を兼ねてまとめておこうと思います。

実は、Next.jsのApp RouterでGoogleログインを実装する際に、思わぬエラーにハマってしまって...。でも、この経験を通して、Server ComponentとClient Componentの使い分けについて深く理解できました。

同じような問題で困っている方の参考になれば嬉しいです！

---

## 🔍 今回の目的と技術選定

### 実装したい機能
- **目的**: LINE風のチャット機能を既存のNext.jsアプリの一部として実装
- **認証**: Googleログインでユーザー管理
- **UI**: スマホでも快適に使えるLINE風チャット

### 技術スタック
| 技術 | 役割 | 選定理由 |
| --- | --- | --- |
| Next.js (App Router) | フレームワーク | SSR対応の柔軟な構成 |
| Tailwind CSS | スタイリング | モバイルUIとの相性が良い |
| Firebase | バックエンド | チャット・画像・ユーザー情報管理 |
| NextAuth.js | 認証 | Googleログインの導入が簡単 |
| Vercel | デプロイ | Next.jsとの相性抜群 |

---

## 🛠️ Googleログイン実装の手順

### Step1: Google Cloud Consoleでの設定

まず、Google Cloud ConsoleでOAuthクレデンシャルを作成する必要があります。

```bash
# 環境変数の設定例
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string
```

### Step2: 承認済みリダイレクトURIの設定

ここで最初のハマりポイントがありました。

**❌ 間違った設定**: リダイレクトURIを設定し忘れる
**✅ 正しい設定**: `http://localhost:3000/api/auth/callback/google` を設定

この設定を忘れると、ログイン後にエラーが発生してしまいます。

実は、最初はこの設定を忘れていて、「なんでログインできないんだろう？」としばらく悩んでいました。Google Cloud Consoleの画面を何度も見直して、ようやく気づいたんです。

---

## ⚠️ 実際に遭遇したエラーと解決策

### エラー1: React Context is unavailable in Server Components

**エラーメッセージ**:
```
Error: React Context is unavailable in Server Components
```

このエラーが出たときは、正直「何が起きているんだ？」と混乱しました。

**原因**: `Header.tsx` で `useSession()` を使用していたが、Server Componentだったため

**解決策**: 
```tsx
// Header.tsx
"use client"  // この行を追加

import { useSession } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()
  // ...
}
```

App Routerでは、デフォルトでServer Componentになっているので、`useSession()`のようなフックを使う場合は、必ず `"use client"` を追加する必要があります。

### エラー2: SessionProviderの配置問題

**試したこと**:
- `layout.tsx` に `SessionProvider` を配置
- `Header` コンポーネントから `LoginButton` を呼び出し

**解決策**:
```tsx
// LoginButton.tsx
"use client"  // この行も必要

export default function LoginButton() {
  const { data: session, signIn, signOut } = useSession()
  // ...
}
```

最初は、`Header.tsx` だけに `"use client"` を追加すれば大丈夫だと思っていたんですが、`LoginButton.tsx` でも `useSession()` を使っているので、こちらにも `"use client"` が必要でした。

---

## 📌 学んだことと次回への課題

### 今回学んだこと
1. **App Routerでの認証**: Server ComponentとClient Componentの使い分けが重要
2. **OAuth設定**: リダイレクトURIの設定は必須
3. **エラーハンドリング**: エラーメッセージから原因を特定する方法

特に、App RouterでのServer ComponentとClient Componentの使い分けについては、実際にエラーに遭遇してから理解が深まりました。

### 次回の課題
1. **チャットDB設計**: Firestoreでのメッセージ管理
2. **リアルタイム機能**: メッセージの即座反映
3. **UI改善**: よりLINEらしいデザインへの調整

---

## まとめ

今回は、Googleログイン機能の実装で遭遇したエラーとその解決策について学びました。Next.jsのApp Routerでは、Server ComponentとClient Componentの使い分けが特に重要だと気づきました。

エラーに遭遇したときは焦ってしまいますが、一つずつ原因を特定していくことで、必ず解決できると思います。私も今回の経験を通して、Next.jsの理解がより深まりました。

次回は、認証機能を活用して、実際のチャット機能の実装に取り組んでいきます！

引き続き、学んだことをブログとしてまとめていくので、よろしくお願いします！

---

**関連記事**:
- [【第1回】Next.js × Firebaseチャット構想！LINE風UIを目指して](/blogs/nextjs-firebase-chat-planning)

**タグ**: #Next.js #Firebase #Googleログイン #NextAuth.js #AppRouter #エラー解決 
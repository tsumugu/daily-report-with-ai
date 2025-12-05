# Daily Report 📝

日報管理システム - 新卒社員の成長を加速するためのプロダクト

---

## クイックスタート

```bash
# 1. 依存関係のインストール
npm install

# 2. 開発サーバー起動（フロントエンド + バックエンド）
npm run dev
```

**起動後:**
- フロントエンド: http://localhost:4200
- バックエンド: http://localhost:3000
- Storybook: `npm run storybook` → http://localhost:6006

詳細なセットアップ手順は [セットアップガイド](./docs/general/setup.md) を参照してください。

---

## プロジェクト概要

新卒社員が日報で記録する「よかったこと」と「改善すべきこと」を、書きっぱなしではなく **再現性の追求** と **改善の追跡** により、成長を加速させるプロダクトです。

### 主要機能

- 📝 **日報入力**: よかったこと（要因）、改善すべきこと（アクション）
- 📊 **日報一覧**: 過去の振り返り、検索・フィルタリング
- 🎯 **目標管理**: 半期目標との連携
- 👤 **ユーザー認証**: メール/パスワード認証

詳細は [PRD（サービス要件）](./docs/general/prd.md) を参照してください。

---

## 技術スタック

### フロントエンド
- **Angular 19** - メインフレームワーク
- **Tailwind CSS + Shadow-CN** - スタイリング
- **Storybook** - コンポーネントカタログ

### バックエンド
- **Express** - Web APIフレームワーク
- **TypeScript** - 型安全な開発
- **JWT** - 認証

### 開発ツール
- **npm workspaces** - Monorepo管理
- **ESLint** - コード品質
- **Husky + lint-staged** - Git Hooks

---

## ドキュメント

### 📚 全体仕様
- [セットアップガイド](./docs/general/setup.md) - 環境構築手順
- [PRD（サービス要件）](./docs/general/prd.md) - サービス全体の要件定義
- [ロードマップ](./docs/general/roadmap.md) - 開発計画
- [アーキテクチャ](./docs/general/arch.md) - システム構成
- [デザインシステム](./docs/general/design_system.md) - UIガイドライン
- [Lint設定ガイド](./docs/general/lint-rules.md) - コード品質管理

### 🔧 機能別仕様
- [認証機能](./docs/features/auth/) - ログイン/サインアップ
- [日報入力](./docs/features/daily-report-input/) - 日報作成
- [日報一覧](./docs/features/daily-report-list/) - 日報閲覧

---

## コマンド一覧

```bash
# 開発
npm run dev          # フロントエンド + バックエンド同時起動
npm run dev:web      # フロントエンドのみ
npm run dev:api      # バックエンドのみ

# ビルド
npm run build        # 全ワークスペースビルド
npm run build:web    # フロントエンドのみ
npm run build:api    # バックエンドのみ

# コード品質
npm run lint         # Lint実行
npm run test         # テスト実行

# E2Eテスト
npm run e2e          # E2Eテスト実行
npm run e2e:ui       # E2Eテスト（UIモード）

# Storybook
npm run storybook    # Storybook起動
```

詳細は [セットアップガイド](./docs/general/setup.md) を参照してください。

---

## コード品質保証

このプロジェクトでは、commit時に自動的にLintが実行されます。

```bash
git commit -m "feat: 新機能追加"
# → 変更されたファイルのみ自動チェック
# → エラーがあればcommit中断
```

詳細は [Lint設定ガイド](./docs/general/lint-rules.md) を参照してください。

---

## ライセンス

MIT

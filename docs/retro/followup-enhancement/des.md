# フォローアップ動作改善機能 Des振り返り

**作成日**: 2025-12-12

---

## 担当した成果物

- `docs/features/followup-enhancement/ui_design.md`
- `apps/web/src/app/features/followup/pages/followup-page/followup-page.component.html`
- `apps/web/src/app/features/followup/pages/followup-page/followup-page.component.scss`

---

## Keep

1. **UI設計の明確化**
   - エピソード/アクション一覧の表示方法を明確に定義
   - ステータス表示の形式（例: 「進行中 2/3件」）を明文化

2. **デザイントークンの使用**
   - CSS変数を使用したスタイル実装
   - デザインシステムに準拠した実装

3. **アクセシビリティへの配慮**
   - キーボード操作（Escapeキー、Enterキー、Spaceキー）の対応
   - ARIA属性の適切な設定

---

## Problem

1. **プロトタイプの作成**
   - UI設計書は作成したが、プロトタイプを作成していない
   - プロトタイプレビューを実施していない

2. **Storybookの更新**
   - 新規コンポーネントのStorybookストーリーを作成していない
   - Storybookファーストの原則に従っていない

---

## Try

1. **プロトタイプの作成**
   - UI設計書作成後、必ずプロトタイプを作成
   - プロトタイプレビューを実施

2. **Storybookファーストの徹底**
   - 実装と同時にStorybookストーリーを作成
   - 各バリエーション（状態、サイズ等）のストーリーを作成

3. **デザイントークンの徹底**
   - ハードコードされた色・サイズは使用しない
   - すべてのスタイルにデザイントークンを使用

---

## 学びの反映

`docs/rules/jobs/des.md` に以下を追記予定：

- UI設計書作成後、必ずプロトタイプを作成すること
- 実装と同時にStorybookストーリーを作成すること
- デザイントークンを徹底すること

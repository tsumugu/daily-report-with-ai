# デザインシステム 運用ルール（統合ドラフト）

このドキュメントは、プロジェクトのUI/UXの一貫性を保ち、再利用性の高いコンポーネント資産を構築するためのガイドラインです。既存のルールを統合し、機能固有のコードによる「汚染」を防ぐための階層構造を定義しています。

---

## 1. 基本理念

- **一貫性**: ユーザー体験と視覚的デザインをプロジェクト全体で統一します。
- **再利用性**: 特定のドメインに依存しない汎用的なコンポーネントを資産化します。
- **疎結合**: UI（見た目）とビジネスロジック（データ取得・加工）を明確に分離します。

---

## 2. スタイリングとカスタマイズ

### 2.1 デザイントークンの活用（必須）

スタイルには必ず **CSS変数（デザイントークン）** を使用してください。ハードコードされた色やサイズは禁止です。

- カラー: `--color-primary-*`, `--color-gray-*`, `--color-success` 等
- 詳細は `src/styles/tokens/` 配下を参照

### 2.2 ライブラリ・カスタマイズ方針

- **Shadow-CN**: スタイリングや基礎UIにはShadow-CNのクラス/標準コンポーネントを最優先で使用します。
- **独自CSS**: 極力避け、どうしても必要な場合のみユーティリティクラス（className）で調整します。

---

## 3. コンポーネントの分類 (Tier)

プロジェクトのコンポーネントは、以下の3つの階層（Tier）に分類して管理します。

### Tier 1: 共通UI (Design System)

- **定義**: ドメイン知識を一切持たない純粋なUI部品（Atoms, Molecules）。
- **配置先**: `apps/web/src/app/shared/ui/`
- **制約**:
  - `features/` 配下のサービスやモデルのインポートを**厳禁**します。
  - データの受け渡しは `@Input`, `@Output` のみで行う「Dumb Component」とします。
- **Storybookカテゴリ**: `Design System/`

### Tier 2: 共通ドメインコンポーネント

- **定義**: 複数の機能で再利用されるが、特定のドメイン知識（サービスやモデル）に依存する部品。
- **配置先**: `apps/web/src/app/shared/domain-components/`
- **制約**:
  - `features/` 配下のサービスやモデルをインポート可能です。
- **Storybookカテゴリ**: `Design System/Domain Components/`
  - Tier 1 と同様にデザインシステムの一部として扱い、発見性を向上

### Tier 3: 機能固有コンポーネント

- **定義**: 特定の機能内（ページ等）でのみ使用されるコンポーネント。
- **配置先**: `apps/web/src/app/features/[feature-name]/components/`
- **制約**: その機能内にカプセル化し、他から参照されないようにします。
- **Storybookカテゴリ**: `Features/[FeatureName]/`（ドキュメント化が必要な場合のみ）

---

## 4. 設計原則

### 4.1 命名規則

**Tier 1（純粋UI）の場合**:

- **汎用的な命名**: 特定のドメイン（例: Goal）に依存した命名を避け、その役割を表す名前を付けます。
  - ❌ `GoalCard`, `GoalSelectField`
  - ✅ `HierarchyCard`, `EntitySelectField`
- **ラベルやテキストは props で受け取る**: コンポーネント内にドメイン固有の文言をハードコードしない。

  ```typescript
  // ✅ 推奨: ラベルを props で受け取る
  @Input() levelName!: string;  // "長期目標", "Long-term Goal" など外から渡す

  // ❌ 非推奨: ドメイン固有のラベルを内部で持つ
  getLevelLabel(level: string): string {
    return level === 'long' ? '長期目標' : '中期目標';
  }
  ```

**Tier 2（ドメイン）の場合**:

- ドメイン固有の命名が許容されます（例: `GoalChip`, `ReportCard`）
- ただし、責務は明確にし、過度に複雑にしないこと

### 4.2 再利用性の検討 checklist

新規コンポーネント作成前に以下を確認してください。

- [ ] 既存のコンポーネントの variant（引数）で対応できないか？
- [ ] タイトルやラベルを props で柔軟に変更できるか？
- [ ] ドメイン固有のモデルに依存していないか？（Tier 1を目指す場合）

---

## 5. Storybook 運用ルール

### 5.1Storybookファーストの実装

コンポーネントの実装と同時に、`src/stories/components/` にストーリーを作成します。

### 5.2 ストーリーの要件

- **バリエーションの網羅**: 通常、ホバー、無効、ローディング、エラーなどの状態を網羅。
- **ドキュメント化**: `argTypes` を使用して props の説明を記載。
- **階層の明示**: `title` プロパティで Tier に合わせた階層を指定します。
  - Tier 1 例: `title: 'Design System/UI Components/Button'`
  - Tier 2 例: `title: 'Design System/Domain Components/GoalChip'`
  - Tier 3 例: `title: 'Features/GoalManagement/GoalFormPage'`（必要な場合のみ）

---

## 6. アクセシビリティと品質

- **キーボード対応**: フォーカス状態（:focus-visible）とナビゲーションを確保。
- **ARIA属性**: 適切な `aria-label` や `aria-describedby` を設定。
- **アニメーション**: 状態遷移には適切なトランジションを追加し、UXを向上させます。

---

## 8. プロトタイプと本実装の区別

プロトタイプ作成時に新規作成したコンポーネントは、以下のいずれであるかを明確に定義してください。

### 8.1 モック用部品 (Mock Only)

- **目的**: プロトタイプで見た目を確認するためだけの使い捨て部品。
- **扱い**:
  - 本実装時には破棄、または正式なコンポーネントとして再実装する。
  - ファイル名やディレクトリ名に `mock-` 接頭辞を付けることを推奨。

### 8.2 本実装用部品 (Production Ready)

- **目的**: プロトタイプで検証し、そのまま本実装でも使用する部品。
- **扱い**:
  - 最初から Tier 1〜3 のいずれかの配置基準に従って実装する。
  - Storybookへの登録を実装と同時に行う。

---

## 9. 開発フロー

1. **設計**: `ui_design.md` にて既存コンポーネントの活用計画や新規設計（モック用か本実装用か）を記載。
2. **レビュー**: props 定義や責務について事前に合意を得る。
3. **実装**: Storybook と同時に実装し、PRマージの条件として必須とする。

---

## 10. 設計根拠とベストプラクティス

この3層Tier分類は、以下の業界標準のベストプラクティスに基づいています。

### 10.1 Atomic Design（2025年版）

- **Tier 1** は Atomic Design の Atoms/Molecules 層に相当
- 純粋なUI部品として、ドメイン知識を持たない「Presentational Components」として設計
- 参考: [Atomic Design in 2025: From Rigid Theory to Flexible Practice](https://medium.com/design-bootcamp/atomic-design-in-2025-from-rigid-theory-to-flexible-practice-91f7113b9274)

### 10.2 Domain-Driven Design (DDD)

- **Tier 2** はドメイン知識を持つコンポーネント層として、DDDのモジュール分割原則に従う
- ビジネスロジックとUI表示の適切な分離を実現
- 参考: [Domain-Driven Design for UI Components](https://coryrylan.com/blog/domain-driven-design-for-ui-components-improving-consistency-and-quality)

### 10.3 Separation of Concerns (SoC)

- **Tier 1** で厳格な制約（`features/` のインポート禁止）により、UI層とビジネスロジック層の疎結合を実現
- コンポーネントの責務を明確にし、保守性・テスタビリティを向上
- 参考: [Best Practices for Keeping Your React UI and Logic Separate](https://www.dhiwise.com/post/mastering-the-art-of-separating-ui-and-logic-in-react)

### 10.4 Feature-Based Architecture

- **Tier 3** で機能ごとのカプセル化を実現
- `features/[feature-name]/components/` 構造は、現代のフロントエンド開発における標準的なアプローチ
- 参考: [React Best Practices for Folder Structure & System Design](https://javascript.plainenglish.io/react-best-practices-for-folder-structure-system-design-architecture-8fc2f09e3fff)

### 10.5 実務的なバランス

- 純粋なAtomic Designでは扱いにくい「ドメイン依存だが再利用可能」なコンポーネントに対し、Tier 2 という明確な配置場所を提供
- 理論と実務のバランスを取った、実践的なアーキテクチャ

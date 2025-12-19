# Tech Spec: Design System Refactor

**ステータス**: Pending

## 1. 背景・目的

デザインシステムの資産価値を高め、機能固有コードによる「汚染」を防ぐため、コンポーネントを 3 つの Tier に分類して再配置する。

## 2. アーキテクチャ構成 (Tier)

### Tier 1: 共通UI (Design System)

- **配置先**: `apps/web/src/app/shared/ui/`
- **対象**:
  - `alert-banner`
  - `button`
  - `date-field`
  - `empty-state`
  - `entity-select-field`
  - `form-card`
  - `icon`
  - `icon-button`
  - `input-field`
  - `status-badge`
  - `textarea-field`
  - `toast`
  - `view-toggle`
  - `hierarchy-card` (注: ドメイン知識の排除が必要)
  - `hierarchy-tree-view`

### Tier 2: 共通ドメインコンポーネント

- **配置先**: `apps/web/src/app/shared/domain-components/`
- **対象**:
  - `goal-chip`
  - `goal-multi-select-field`
  - `related-daily-reports-list`
  - `report-card`
  - `weekly-focus-card`
  - `weekly-focus-section`

### Tier 3: 機能固有

- **配置先**: `apps/web/src/app/features/[feature]/components/`

## 3. 実装詳細

### 3.1 ディレクトリ構成の変更

既存の `shared/components/` 配下のコンポーネントを `shared/ui/` または `shared/domain-components/` に移動する。
`shared/components/` は廃止または移行用のエイリアスとして一時的に残す（最終的には削除）。

### 3.2 HierarchyCard のリファクタリング（推奨アプローチ）

現在 `HierarchyCard` は「長期目標」などのラベルを内部で持っている。これを Tier 1 に置くため、以下を実施する：

**推奨アプローチ: ラベル文字を Input prop として受け取る**

```typescript
@Component({
  selector: "app-hierarchy-card",
})
export class HierarchyCardComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() metadata?: string;
  @Input() levelName!: string; // "長期目標", "中期目標", "短期目標" など外から渡す
  @Input() onClick?: () => void;
}
```

**理由**:

- より柔軟で、国際化（i18n）にも対応しやすい
- コンポーネントがビジネスロジック（「長期目標」という概念）を持たない
- Pure UI Component のベストプラクティスに従う
- 参考: [Domain Driven Design and Functional Pure UI Components](https://dev.to/kmruiz/domain-driven-design-and-functional-pure-ui-components-29a7)

**非推奨**: 汎用的な level 表示ロジック（"Level 1" など）に変更する方法

- 表示テキストが英語固定になり、国際化が困難
- ドメイン層で翻訳する追加ロジックが必要になり、複雑化する

### 3.3 エクスポート戦略

`shared/ui/index.ts` および `shared/domain-components/index.ts` を作成し、一括エクスポートを行う。
機能側（Features）からのインポートパスを順次更新する。

## 4. 影響範囲

- `apps/web/src/app/features/` 配下の全コンポーネントにおけるインポートパス。
- `apps/web/src/stories/` 配下の Storybook 定義。

## 5. 移行ステップ

1. 基盤ディレクトリの作成。
2. Tier 1 コンポーネントの移動とリファクタリング。
3. Tier 2 コンポーネントの移動。
4. インポートエラーの修正。
5. Storybook のパス設定変更。

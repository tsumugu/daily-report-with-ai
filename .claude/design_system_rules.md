# 🎨 デザインシステム：ルール

このドキュメントは、プロジェクトのUI/UXを快適かつ一貫性あるものに保つための**ルール・ガイドライン**です。開発・運用時には必ず遵守してください。

**重要**: デザインシステムの実体（コンポーネントの実際の見た目、使い方、バリエーションなど）は**Storybook**（`apps/web/src/stories`ディレクトリ）を参照してください。

- Storybookディレクトリ: `apps/web/src/stories/`
  - `components/` - コンポーネントストーリー
  - `design-tokens/` - デザイントークン（カラー、アイコン等）
  - `prototypes/` - プロトタイプ
- 人間が確認する場合は `npm run storybook` で起動

---

## 1. 基本理念

- **一貫性**：画面やコンポーネントのデザイン・体験を統一します。
- **再利用性**：様々な場面で使いまわせるコンポーネントを作成します。
- **アクセシビリティ**：WCAG 2.1 AA準拠レベルを目標に、誰にでもやさしいデザインを心がけます。

---

## 2. スタイリングとカスタマイズ

### 2.1. デザイントークンの活用（必須）

スタイルには必ず **CSS変数（デザイントークン）** を使用する：

```scss
// ✅ OK: CSS変数を使用
.button {
  background-color: var(--color-primary-500);
  color: var(--color-white);
}

// ❌ NG: ハードコードされた値
.button {
  background-color: #6366f1;
  color: #ffffff;
}
```

**利用可能なトークン:**

- カラー: `--color-primary-*`, `--color-gray-*`, `--color-success`, `--color-error` 等
- 詳細は `src/styles/tokens/_colors.scss` を参照

### 2.2. Shadow-CN の活用（標準スタイル）

- Tailwind CSSベースのコンポーネントライブラリ「Shadow-CN」を全画面・全コンポーネントで利用します。
- スタイリング、レイアウト、基礎的なUI要素の実装にはShadow-CNのクラス（ユーティリティ）・標準コンポーネントを最優先で使ってください。

### 2.3. カスタマイズ方針

- どうしても標準のまま使えない場合のみ、ユーティリティクラス(className)で調整します。
- 独自CSS（グローバルCSSや個別cssファイル）は極力避け、最小限に留めてください。
- **デザイントークンを徹底する**: ハードコードされた色・サイズは使用しない。

---

## 3. コンポーネント運用ルール

### 3.1. コンポーネント利用の優先度

1. **Shadow-CN の標準コンポーネント**
2. **既存のStorybook登録済み独自コンポーネント**（`shared/components/`）
3. **新規で独自コンポーネントを実装**（実装後は必ずStorybook登録）

### 3.2. 既存コンポーネントの活用

実装前に `shared/components/` を確認し、既存のコンポーネントを活用する：

**新規コンポーネント作成前に必ず既存資産を確認すること。**

**重要**: `ui_design.md`作成時に、既存コンポーネントの使用計画を事前にプランニングすること。実装時に既存コンポーネントを確認するのではなく、設計段階で使用する既存コンポーネントを明確にする。

### 3.3. コンポーネント設計の事前レビュー

新規コンポーネントを作成する前に、以下を検討する：

1. **既存コンポーネントの variant で対応可能か？**
   - 例: AddButton → Button の `variant="add"` + `icon="plus"` で対応
   - スタイルのみの違いなら variant、挙動が大きく異なるなら別コンポーネント

2. **Engと事前に設計を共有する**
   - props の定義を事前に合意
   - コンポーネントの責務を明確にする

3. **ui_design.mdに新規コンポーネントの設計を記載する**
   - 新規コンポーネントが必要な理由
   - コンポーネントの責務とprops定義
   - Storybookストーリーの設計（各バリエーション、状態等）

```
❌ NG: 類似コンポーネントを別々に作成（後で統合作業が発生）
✅ OK: 既存コンポーネントの variant として追加
```

**重要**: 新規コンポーネントが必要な場合は、`ui_design.md`に設計を記載し、FE実装と同時に作成すること。実装完了後に新規コンポーネントを作成するのではなく、実装と同時に行う。

### 3.4. 再利用性を考慮した設計と命名

新規コンポーネントを作成する際は、**再利用性を考慮した設計と命名**を徹底する：

#### 設計原則

1. **汎用性の高い設計**
   - 特定の機能に依存しない、汎用的なインターフェースを設計する
   - データ構造に依存せず、propsで柔軟に設定できるようにする
   - 例: `GoalCard` → `HierarchyCard` として汎用化し、`goal` プロパティではなく `title`, `subtitle`, `metadata` などの汎用的なプロパティを提供

2. **責務の明確化**
   - 1つのコンポーネントは1つの責務を持つ
   - 表示ロジックとビジネスロジックを分離する
   - 例: `HierarchyTreeView` → 階層構造の表示のみを担当し、データ取得は親コンポーネントで行う

3. **コンポーネントの粒度**
   - 小さな再利用可能なコンポーネントを組み合わせて大きなコンポーネントを構築する
   - 例: `HierarchyCard` は `Icon`, `Button` などの既存コンポーネントを組み合わせて構築

#### 命名規則

1. **機能固有の命名を避ける**
   - ❌ NG: `GoalCard`, `GoalTreeView`, `GoalSelectField`
   - ✅ OK: `HierarchyCard`, `HierarchyTreeView`, `EntitySelectField`（階層構造全般に使える）
   - ✅ OK: `EntityCard`, `TreeView`, `EntitySelectField`（より汎用的）

2. **再利用性を考慮した命名**
   - コンポーネント名は、そのコンポーネントが何をするか（責務）を表す
   - 特定のドメイン（Goal）に依存しない命名を心がける
   - 例: `ViewToggle`（ビュー切り替え全般に使える）は良い命名

3. **配置場所の判断**
   - **汎用的なコンポーネント**: `shared/components/` に配置
     - 複数の機能で使用される可能性がある
     - 特定のドメインに依存しない
     - 例: `TreeView`, `ViewToggle`, `EntityCard`
   - **機能固有のコンポーネント**: `features/{feature_name}/components/` に配置
     - 特定の機能でのみ使用される
     - ドメイン固有のロジックを含む
     - 例: `GoalListPage`, `GoalFormPage`

#### 実装チェックリスト

新規コンポーネント作成前に以下を確認：

- [ ] 既存コンポーネントの variant で対応できないか検討した
- [ ] コンポーネント名が再利用性を考慮した命名になっているか
- [ ] コンポーネントの責務が明確か（1つの責務のみを持つ）
- [ ] props が汎用的で、特定のドメインに依存していないか
- [ ] 配置場所が適切か（汎用的なら `shared/`、機能固有なら `features/`）
- [ ] `ui_design.md` に設計を記載した
- [ ] Storybookストーリーの設計を検討した

#### 例: 良い設計 vs 悪い設計

**❌ 悪い設計（再利用性が低い）**:

```typescript
// 機能固有の命名、Goalに依存
@Component({
  selector: "app-goal-card",
})
export class GoalCardComponent {
  @Input() goal!: Goal; // Goalモデルに依存
}
```

**✅ 良い設計（再利用性が高い）**:

```typescript
// 汎用的な命名、階層構造全般に使える
@Component({
  selector: "app-hierarchy-card",
})
export class HierarchyCardComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() metadata?: string;
  @Input() level?: "long" | "medium" | "short";
  @Input() onClick?: () => void;
}
```

**判断基準**:

- 他の機能（例: プロジェクト管理、タスク管理）でも使えるか？
- データ構造を変更してもコンポーネントが使えるか？
- コンポーネント名から責務が明確か？

### 3.5. 独自コンポーネントの定義

- Shadow-CNに存在しない、もしくはプロジェクト独自仕様を含むUIは「独自コンポーネント」とします。
- 例：
  - Atomic（ボタン、入力フィールドなど）
  - Composite（ヘッダー・フッターなどの複合パーツ）

---

## 4. Storybook運用ルール

### 4.1. Storybook登録の義務

作成した独自コンポーネント（特に再利用性が高い汎用コンポーネント）は必ずStorybookへ登録してください。

**登録対象**:

- `shared/components/` に配置された汎用的なコンポーネント
- 複数の機能で使用される可能性があるコンポーネント
- 特定のドメインに依存しないコンポーネント

**登録不要**:

- 機能固有のページコンポーネント（`features/{feature_name}/pages/`）
- 特定の機能でのみ使用されるコンポーネント（`features/{feature_name}/components/`）

### 4.2. Storybookファースト

**実装と同時に** Storybook を更新する：

1. `src/stories/components/` に `ComponentName.stories.ts` を作成
2. 各バリエーション（状態、サイズ等）のストーリーを作成
3. `npm run storybook` で表示を確認
4. **PRマージ前にStorybookの変更を確認する**

```
❌ NG: 実装完了後にStorybookを更新
✅ OK: 実装と同時にStorybookを更新
```

**重要**:

- 新規コンポーネントを作成する場合は、FE実装と同時にStorybookストーリーも作成すること
- Storybookへのコンポーネント反映は受け入れ条件のひとつとして必須とする
- 実装完了時に、すべてのコンポーネントがStorybookに反映されていることを確認すること

### 4.3. Storybookストーリーの要件

Storybookストーリーには以下を含める：

1. **すべての状態の確認**
   - 通常状態
   - ホバー状態
   - フォーカス状態
   - 無効状態
   - ローディング状態
   - エラー状態

2. **Propsや使い方のドキュメント**
   - `argTypes` で各propsの説明を記載
   - `parameters.docs.description` でコンポーネントの説明を記載

3. **バリエーションの網羅**
   - 各variant、size、stateの組み合わせを確認可能にする

### 4.4. Storybook登録で得られる効果

- デザイン共有・レビュー・テストを効率化
- コンポーネントの再利用性を向上
- 開発時のコンポーネント確認が容易

---

## 5. アクセシビリティへの配慮

- フォーカス状態のスタイルを適切に設定する（:focus-visible）
- キーボードナビゲーションに対応する
- エラーメッセージはフォームフィールドに関連付ける（aria-describedby等）
- 適切なaria-labelを設定する
- スクリーンリーダー対応を考慮する

---

## 6. アニメーション・トランジション

ユーザー体験を向上させるため、適切な箇所にアニメーションを追加する：

- 状態遷移時のトランジション
- ホバー時のフィードバック
- ローディング状態の表示

---

## 7. デザインシステム運用・改善体制

- デザインシステムの内容と実装のズレが起きないよう、Des（デザイナー）が保守責任を持つ。
- 新しい共通コンポーネントの追加や仕様変更は、PdMの承認を経て、必ずEngと連携しながら進める。
- デザインシステムの改善は、振り返り（Retro）を通じて継続的に行う。

---

## 8. デザインシステムの実体（Storybook）

**デザインシステムの実体はStorybook（`apps/web/src/stories`ディレクトリ）で管理されています。**

### 8.1. Storybookディレクトリ構造

```
apps/web/src/stories/
├── components/          # コンポーネントストーリー
│   ├── Button.stories.ts
│   ├── InputField.stories.ts
│   └── ...
├── design-tokens/      # デザイントークン（カラー、アイコン等）
│   ├── Colors.stories.ts
│   ├── Icons.stories.ts
│   └── ...
└── prototypes/         # プロトタイプ
```

### 8.2. Storybookで確認できる内容

- **コンポーネントの実際の見た目**: 各コンポーネントの視覚的なデザイン
- **バリエーション**: variant、size、stateなどの組み合わせ
- **使用方法**: propsの設定例、コード例
- **インタラクション**: ホバー、フォーカス、クリックなどの挙動
- **デザイントークン**: カラー、スペーシングなどの実際の値

### 8.3. コンポーネントの確認方法

**AIエージェント向け**:

- `apps/web/src/stories/components/` ディレクトリ内のストーリーファイルを参照
- 各ストーリーファイルでコンポーネントのバリエーション、props、使用方法を確認

**人間向け**:

1. Storybookを起動（`npm run storybook`）
2. 左サイドバーからコンポーネントを選択
3. 各ストーリーでバリエーションを確認
4. 「Docs」タブで詳細な使用方法を確認

### 8.4. 新規コンポーネントの追加

新規コンポーネントを追加した場合は、必ずStorybookに登録してください。

- 登録場所: `apps/web/src/stories/components/ComponentName.stories.ts`
- 詳細は「4. Storybook運用ルール」を参照

---

## 9. 関連ドキュメント

- `.claude/jobs/des.md` - Desロールの詳細ルール
- `.claude/development-flow.md` - 開発フロー
- `apps/web/src/styles/tokens/_colors.scss` - カラートークン定義
- **Storybook** (`apps/web/src/stories/`) - デザインシステムの実体
  - `components/` - コンポーネントストーリー
  - `design-tokens/` - デザイントークン
  - `prototypes/` - プロトタイプ

---

何か困ったこと、不明点があれば必ず関係ロール（PdM / Eng / Des）へ相談してください。

# UIUX改善 UI設計書

**バージョン**: v1  
**作成日**: 2025-01-XX  
**作成者**: Des  
**ステータス**: Approved  
**承認日**: 2025-01-XX  
**承認者**: PdM（レビュー完了）、human（プロトタイプレビュー完了）

---

## 1. 概要

UIUX改善のUI設計方針を定義する。  
プロフェッショナルで一貫性のあるデザインシステムを確立し、ブランドイメージを確立するための設計を記載する。

---

## 2. 画面構成

本改善は既存画面への適用となるため、新規画面の追加はない。  
既存画面（ホーム、日報入力、日報一覧、詳細、フォローアップ）に対して、以下の改善を適用する：

- グリッドレイアウトシステムの適用
- EmojiからIconへの置き換え
- Primary Colorの変更
- マイクロインタラクションの追加
- ブランドイメージの反映

---

## 3. グリッドレイアウトシステム

### 3.1 システム設計

**12カラムグリッドシステム**を採用：

```scss
// グリッドコンテナ
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

// レスポンシブ対応
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
}
```

### 3.2 適用箇所

- **ホーム画面**: 機能カードの配置
- **日報一覧画面**: 日報カードの配置
- **フォローアップ一覧画面**: フォロー項目カードの配置
- **その他**: 全画面のコンテンツエリア

### 3.3 ワイヤーフレーム（グリッド適用例）

```
┌─────────────────────────────────────────┐
│ ヘッダー（全幅）                        │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │ 1/3 │ │ 1/3 │ │ 1/3 │              │
│  └─────┘ └─────┘ └─────┘              │
│                                         │
│  ┌───────────┐ ┌───────────┐          │
│  │    1/2    │ │    1/2    │          │
│  └───────────┘ └───────────┘          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 4. アイコンシステム

### 4.1 アイコンライブラリ

**Lucide Icons** (`lucide-angular`) を使用。

### 4.2 アイコンコンポーネント

統一的な使用方法のため、Iconコンポーネントを作成：

```typescript
// Iconコンポーネント
@Component({
  selector: "app-icon",
  template: '<lucide-icon [name]="iconName" [size]="size" [color]="color" />',
})
export class IconComponent {
  @Input() iconName!: string;
  @Input() size: number = 24;
  @Input() color?: string;
}
```

### 4.3 置き換えマッピング

| 現在のEmoji | 用途             | アイコン        | サイズ | 色            |
| :---------- | :--------------- | :-------------- | :----- | :------------ |
| 📝          | ロゴ・日報       | `FileText`      | 24px   | Primary Color |
| 📋          | 日報入力         | `Clipboard`     | 24px   | Primary Color |
| 📊          | 日報一覧         | `BarChart3`     | 24px   | Primary Color |
| 🎯          | フォーカス・目標 | `Target`        | 24px   | Primary Color |
| ✨          | よかったこと     | `Sparkles`      | 20px   | Success Color |
| 💡          | 学び             | `Lightbulb`     | 20px   | Warning Color |
| 📅          | 日付             | `Calendar`      | 20px   | Gray-600      |
| ⚠️          | 警告             | `AlertTriangle` | 20px   | Error Color   |

### 4.4 アイコン使用ガイドライン

- **サイズ**: 20px（小）、24px（中）、32px（大）
- **色**: Primary Color、Semantic Color（Success/Error/Warning）、Gray
- **アクセシビリティ**: `aria-label`を必ず付与

---

## 5. Primary Color

### 5.1 カラーオプション

#### オプションA: Emerald Green (`#10b981`)

**カラーパレット**:

```
--color-primary-50: #ecfdf5
--color-primary-100: #d1fae5
--color-primary-200: #a7f3d0
--color-primary-300: #6ee7b7
--color-primary-400: #34d399
--color-primary-500: #10b981  ← メイン
--color-primary-600: #059669
--color-primary-700: #047857
--color-primary-800: #065f46
--color-primary-900: #064e3b
```

**特徴**:

- 成長・前進を表現
- ビジネス向けに適切な落ち着いた色
- 既存のSuccessカラーとの統一感

#### オプションB: Blue (`#3b82f6`)

**カラーパレット**:

```
--color-primary-50: #eff6ff
--color-primary-100: #dbeafe
--color-primary-200: #bfdbfe
--color-primary-300: #93c5fd
--color-primary-400: #60a5fa
--color-primary-500: #3b82f6  ← メイン
--color-primary-600: #2563eb
--color-primary-700: #1d4ed8
--color-primary-800: #1e40af
--color-primary-900: #1e3a8a
```

**特徴**:

- 信頼感・安定感を表現
- プロフェッショナルな印象
- 多くのビジネスサービスで採用

#### オプションC: Amber (`#f59e0b`)

**カラーパレット**:

```
--color-primary-50: #fffbeb
--color-primary-100: #fef3c7
--color-primary-200: #fde68a
--color-primary-300: #fcd34d
--color-primary-400: #fbbf24
--color-primary-500: #f59e0b  ← メイン
--color-primary-600: #d97706
--color-primary-700: #b45309
--color-primary-800: #92400e
--color-primary-900: #78350f
```

**特徴**:

- エネルギー・活力を表現
- 若々しく前向きな印象
- 注意喚起にも使用可能

### 5.2 プロトタイプでの比較

各オプションをStorybookプロトタイプで実装し、以下で比較：

- ホーム画面での見た目
- 日報一覧画面での見た目
- 日報入力画面での見た目
- ボタン・リンクでの使用感
- アクセシビリティ（コントラスト比）

**選定結果**: humanレビューにより、**オプションC: Amber (#f59e0b)** を採用決定。

### 5.3 適用範囲

Primary Colorは以下の要素に適用：

- ボタン（Primary variant）
- リンク
- フォーカスリング
- アクセント要素
- ロゴ
- Favicon

---

## 6. スペーシングシステム

### 6.1 スペーシングトークン

8px基準のスペーシングシステム：

```scss
:root {
  --spacing-1: 4px; // 0.25rem
  --spacing-2: 8px; // 0.5rem
  --spacing-3: 12px; // 0.75rem
  --spacing-4: 16px; // 1rem
  --spacing-6: 24px; // 1.5rem
  --spacing-8: 32px; // 2rem
  --spacing-12: 48px; // 3rem
  --spacing-16: 64px; // 4rem
}
```

### 6.2 使用ガイドライン

- **コンテンツ間**: `--spacing-4` (16px)
- **セクション間**: `--spacing-8` (32px)
- **カード間**: `--spacing-6` (24px)
- **グリッド間隔**: `--spacing-6` (24px)

---

## 7. マイクロインタラクション

### 7.1 ボタンインタラクション

#### ホバー状態

```scss
.button {
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
```

#### クリック状態

```scss
.button {
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
}
```

#### ローディング状態

- スピナーの改善（より滑らかなアニメーション）
- ボタンテキストのフェードアウト

### 7.2 フォームインタラクション

#### フォーカス状態

```scss
.input-field {
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px var(--color-primary-100);
  }
}
```

#### バリデーション

- リアルタイムバリデーション
- エラーメッセージのスライドイン（200ms）
- 成功状態の視覚的フィードバック

### 7.3 画面遷移

#### ページ遷移

```typescript
// Angular Animations
trigger("fadeIn", [
  transition(":enter", [
    style({ opacity: 0 }),
    animate("200ms ease-in", style({ opacity: 1 })),
  ]),
]);
```

#### モーダル開閉

```typescript
trigger("modalScale", [
  transition(":enter", [
    style({ transform: "scale(0.95)", opacity: 0 }),
    animate("200ms ease-out", style({ transform: "scale(1)", opacity: 1 })),
  ]),
  transition(":leave", [
    animate("150ms ease-in", style({ transform: "scale(0.95)", opacity: 0 })),
  ]),
]);
```

#### リストアイテム表示

```typescript
trigger("listItem", [
  transition(":enter", [
    style({ opacity: 0, transform: "translateY(10px)" }),
    animate(
      "200ms ease-out",
      style({ opacity: 1, transform: "translateY(0)" }),
    ),
  ]),
]);
```

**Stagger効果**: リストアイテムを順番に表示（50ms間隔）

### 7.4 ローディング状態

#### スケルトンローダー

```scss
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

**適用箇所**:

- 日報カード読み込み時
- フォロー項目カード読み込み時
- リスト読み込み時

---

## 8. ブランドイメージ

### 8.1 ロゴデザイン

**デザイン案**:

```
[Icon] Daily Report
```

- **Icon**: `FileText` または `Target`（Primary Color）
- **テキスト**: "Daily Report"（Primary Color、太字）
- **フォント**: システムフォント（Noto Sans JP推奨）
- **サイズ**: 24px（Icon）、20px（テキスト）

**配置**:

- ヘッダー左側
- クリックでホーム画面に遷移

### 8.2 Faviconデザイン

**デザインコンセプト**:

- 日報を表現するアイコン（`FileText`）
- Primary Colorを基調
- シンプルで認識しやすい

**サイズ**:

- 16x16（ブラウザタブ）
- 32x32（ブックマーク）
- 48x48（デスクトップショートカット）
- 192x192（PWA）
- 512x512（PWA）

**実装**:

- SVG形式で作成
- 各サイズに最適化
- `index.html`に反映

---

## 9. 状態別の表示

### 9.1 初期状態

- グリッドシステムに基づいた整列
- 統一されたアイコン表示
- Primary Colorの適用

### 9.2 ホバー状態

- ボタン: スケールアニメーション（scale: 1.02）
- カード: シャドウの強化
- リンク: 色の変化

### 9.3 フォーカス状態

- フォーカスリング（Primary Color）
- キーボード操作時の視覚的フィードバック

### 9.4 ローディング状態

- スケルトンローダー
- スピナーの改善

### 9.5 エラー状態

- エラーメッセージのスライドイン
- エラー色の適用

---

## 10. インタラクション詳細

### 10.1 ボタン

- **ホバー**: スケール（1.02）、シャドウ強化
- **クリック**: スケール（0.98）、リップル効果
- **ローディング**: スピナー表示、テキストフェードアウト

### 10.2 フォーム

- **フォーカス**: ボーダー色変更、フォーカスリング表示
- **バリデーション**: リアルタイムフィードバック
- **エラー**: メッセージスライドイン、エラー色適用

### 10.3 カード

- **ホバー**: シャドウ強化、軽い浮き上がり
- **クリック**: スケール（0.98）

### 10.4 モーダル

- **開く**: スケールアニメーション（0.95 → 1.0）
- **閉じる**: スケールアニメーション（1.0 → 0.95）
- **オーバーレイ**: フェードイン/アウト

---

## 11. 使用するデザイントークン

### 11.1 カラー

- **プライマリ**: `var(--color-primary-500)` = `#f59e0b` (Amber - 採用決定)
- **セカンダリ**: `var(--color-secondary-600)` = `#ffffff` (白系統)
- **セカンダリテキスト**: `var(--color-secondary-text)` = `#f59e0b` (Primary Colorと同じ)
- **成功**: `var(--color-success-500)`
- **エラー**: `var(--color-error-500)`
- **警告**: `var(--color-warning-500)`
- **グレー**: `var(--color-gray-*)`

### 11.2 スペーシング

- **コンテンツ間**: `var(--spacing-4)` (16px)
- **セクション間**: `var(--spacing-8)` (32px)
- **カード間**: `var(--spacing-6)` (24px)
- **グリッド間隔**: `var(--spacing-6)` (24px)

### 11.3 タイポグラフィ

- **フォント**: システムフォント（Noto Sans JP推奨）
- **サイズ**: 既存のタイポグラフィシステムを維持

---

## 12. 画面遷移

本改善は既存画面への適用のため、画面遷移の変更はない。

---

## 13. レスポンシブ対応

### 13.1 モバイル（< 768px）

- グリッド: 1カラムに自動調整
- スペーシング: パディングを1remに調整
- アイコン: サイズを20pxに調整

### 13.2 PC（≥ 768px）

- グリッド: 12カラムシステム
- 最大幅: 1200px
- 中央寄せ

---

## 14. アクセシビリティ

### 14.1 キーボード操作

- Tabキーでフォーカス移動
- Enterキーでボタン実行
- Escキーでモーダル閉じる

### 14.2 スクリーンリーダー

- アイコンに`aria-label`を付与
- ボタンに適切な`aria-label`を付与
- フォーカス状態の視覚的フィードバック

### 14.3 コントラスト比

- テキストと背景のコントラスト比: WCAG 2.1 AA準拠（4.5:1以上）
- Primary Colorの選定時にも確認

---

## 15. 実装ファイル

### 15.1 新規作成

- `apps/web/src/styles/tokens/_grid.scss` - グリッドシステム
- `apps/web/src/styles/tokens/_spacing.scss` - スペーシングトークン
- `apps/web/src/app/shared/components/icon/icon.component.ts` - Iconコンポーネント
- `apps/web/src/stories/prototypes/primary-color/` - Primary Colorプロトタイプ

### 15.2 更新

- `apps/web/src/styles/tokens/_colors.scss` - Primary Color更新
- `apps/web/src/index.html` - Favicon反映
- 全画面コンポーネント - グリッドシステム適用
- 全Emoji使用箇所 - Iconへの置き換え

---

## 16. プロトタイプ

### 16.1 Primary Colorプロトタイプ

Storybookで3つのカラーオプションを実装：

- `PrimaryColorOptionA.stories.ts` - Emerald Green
- `PrimaryColorOptionB.stories.ts` - Blue
- `PrimaryColorOptionC.stories.ts` - Amber

各ストーリーで以下を表示：

- ホーム画面
- 日報一覧画面
- 日報入力画面
- ボタン各種
- カード各種

### 16.2 マイクロインタラクションプロトタイプ

Storybookで以下を実装：

- ボタンインタラクション
- フォームインタラクション
- モーダル開閉
- リストアイテム表示

---

## 17. 品質基準

### 17.1 視覚的品質

- [ ] グリッドシステムが全画面に適用されている
- [ ] アイコンが統一されている
- [ ] Primary Colorが一貫して適用されている
- [ ] スペーシングが統一されている

### 17.2 インタラクション品質

- [ ] ボタンインタラクションが実装されている
- [ ] フォームインタラクションが実装されている
- [ ] 画面遷移アニメーションが実装されている
- [ ] ローディング状態が改善されている

### 17.3 アクセシビリティ品質

- [ ] コントラスト比がWCAG 2.1 AA準拠
- [ ] キーボード操作が可能
- [ ] スクリーンリーダー対応

---

## 18. 関連ドキュメント

- `docs/features/uiux-improvement/prd.md` - PRD
- `docs/features/uiux-improvement/des_research.md` - デザインリサーチ
- `docs/features/uiux-improvement/proposal.md` - 提案書
- `docs/general/design_system.md` - デザインシステム

---

---

## 19. プロトタイプレビュー結果

### 19.1 Primary Color選定

**選定結果**: humanレビューにより、**オプションC: Amber (#f59e0b)** を採用決定。

**選定理由**: エネルギー・活力を表現するAmberが、日報管理サービスに適していると判断されました。

**その他の仕様**: 違和感なく、問題ありませんでした。

### 19.2 プロトタイプレビュー完了

- [x] Primary Colorプロトタイプ（3オプション）作成完了
- [x] マイクロインタラクションプロトタイプ作成完了
- [x] humanレビュー完了
- [x] Primary Color選定完了（Amber採用）

---

_本UI設計書は Approved ステータスです。実装開始可能です。_

# Role Definition: Engineer (Eng)

## 1. ミッション

PdMの要件とDesのデザインを、堅牢なシステムとして具現化し、技術情報を管理する。

## 2. 主な責務

- **アーキテクチャ設計:** 機能実装に必要なデータ構造や処理フローの設計。
- **ロジック実装:** バックエンド、API連携、計算ロジックの実装。
- **ドキュメント管理:** 技術的な詳細仕様の明文化。

## 3. 成果物

以下のファイルを `docs/features/{feature_name}/` 内に作成・管理する。

- `tech_research.md`: 技術リサーチ結果。prd.mdの要求を実現する一般的な手法・類似事例・ベストプラクティスを検索し整理。
- `tech_spec.md`: 技術設計書。API定義、データスキーマ、シーケンス図、実装方針を記載。

※全体共通の技術仕様（DB設計図、全体アーキテクチャ）は `docs/general/` 配下で管理する。

## 3.1. 作成プロセス

1. **リサーチ（tech_spec作成前）**: prd.mdの要求に対し、一般的な実現方法・類似サービスの技術構成・ベストプラクティスを検索し、`tech_research.md` にまとめる
2. **設計**: リサーチ結果を踏まえて `tech_spec.md` を作成
3. **セルフレビュー（tech_spec作成後）**: `tech_spec.md` と `prd.md` を照らし合わせ、設計の妥当性・要件充足度を確認し、必要に応じて修正
4. **クロスレビュー（Des連携）**: `ui_design.md` と `tech_spec.md` を照らし合わせ、以下を確認
   - UIが必要とするデータ・APIが tech_spec で定義されているか
   - tech_spec のデータ構造が UI の表示要件を満たせるか
   - 齟齬があれば Des と協議し、双方のドキュメントを調整

## 4. 実装プロセス（振り返りからの学び）

### 4.1. TDD（テスト駆動開発）の徹底

**Red-Green-Refactor** サイクルで実装する。

→ 詳細・スニペットは `docs/general/test_rules.md` を参照

```
❌ NG: 実装を先に書いてからテストを追加
✅ OK: テストを先に書いてから実装
```

### 4.2. テストカバレッジ100%の遵守

- `npm run test:coverage` でカバレッジ100%を確認してからコミット

### 4.3. 既存コンポーネント・ユーティリティの活用

実装前に `shared/` ディレクトリを確認し、既存のコンポーネント・ユーティリティを活用する：

- `shared/components/`: InputField, Button, AlertBanner, TextareaField, DateField, FormCard 等
- `shared/utils/`: form-validation 等

**新規作成前に必ず既存資産を確認すること。**

### 4.4. コンポーネント設計の事前レビュー

新規コンポーネントを作成する前に、以下を検討する：

1. **既存コンポーネントの variant で対応可能か？**
   - 例: AddButton → Button の `variant="add"` で対応
   - スタイルのみの違いなら variant、挙動が大きく異なるなら別コンポーネント

2. **共通化できるロジックはないか？**
   - 例: ControlValueAccessor の実装は base class に抽出可能
   - 重複コードを避け、保守性を向上させる

```
❌ NG: 類似コンポーネントを別々に作成
✅ OK: 既存コンポーネントの variant として追加
```

### 4.5. Sass @use の徹底

新規SCSSファイルでは `@import` を使用しない（Dart Sass 3.0.0 で削除予定）：

```scss
// ❌ NG: @import（非推奨）
@import "./styles/tokens/colors";

// ✅ OK: @use
@use "./styles/tokens/colors";
```

### 4.6. HTML属性バインディング

ネイティブHTML属性をAngularでバインドする場合は `[attr.xxx]` を使用：

```html
<!-- ❌ NG: ネイティブ属性を直接バインド（エラーになる場合あり） -->
<textarea [maxlength]="maxLength"></textarea>

<!-- ✅ OK: attr. プレフィックスを使用 -->
<textarea [attr.maxlength]="maxLength"></textarea>
```

### 4.7. SSRは必要になってから

- 初期はCSR（Client-Side Rendering）で開発
- SEO要件が明確になってからSSRを検討
- localStorage等のブラウザAPIを使う場合、SSRでは動作しないことに注意

## 5. 他ロールとの連携

- **To PdM:** `tech_spec.md` を作成する過程で判明した技術的制約やエッジケースを共有する。
- **To Des:** フロントエンドに必要なデータ構造を連携する。

## 6. 行動指針

- 実装に入る前に必ず `tech_spec.md` を書き、PdMとDesの合意を得る（Update Docs First）。
- 機能ディレクトリを見るだけで、その機能が技術的にどう動くか把握できるようにする。
- **テストを後回しにしない**: テストは実装の一部であり、後付けではない。
- **設計ドキュメントを信頼する**: tech_spec.md があれば、実装時の迷いが減る。
- **既存コンポーネントを活用する**: 類似コンポーネントは variant で対応できないか検討する。
- **重複コードを避ける**: 共通ロジックは base class や shared/utils に抽出する。

## 7. 参考資料

- テスト設定のスニペット・パターン: `docs/general/test_rules.md` を参照

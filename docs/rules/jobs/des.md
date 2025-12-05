# Role Definition: Designer (Des)

## 1. ミッション
使いやすく美しいインターフェースを設計し、コードとして実装・保守する。

## 2. 主な責務
* **UX/UI設計:** 画面構成、状態遷移、インタラクションの定義。
* **フロントエンド実装:** コンポーネント実装、スタイル適用。
* **デザインシステム管理:** 全体の一貫性維持。

## 3. 成果物
以下のファイルを `docs/features/{feature_name}/` 内に作成・管理する。

* `des_research.md`: デザインリサーチ結果。prd.mdの要求を実現する一般的なUI/UXパターン・類似サービスのデザイン事例・ベストプラクティスを検索し整理。
* `ui_design.md`: UI設計書。画面レイアウト、状態遷移、使用コンポーネントを記載。
* **ワイヤーフレーム（必須）**: 各画面のワイヤーフレームを `ui_design.md` 内にテキストベース or 画像で必ず含めること。

※全体共通のデザインシステム（カラー、Typography、共通コンポーネント定義）は `docs/general/design_system.md` 等で管理する。

## 3.1. 作成プロセス
1. **リサーチ（ui_design作成前）**: prd.mdの要求に対し、一般的なUI/UXパターン・類似サービスのデザイン・ベストプラクティスを検索し、`des_research.md` にまとめる
2. **設計**: リサーチ結果を踏まえて `ui_design.md` を作成（ワイヤーフレーム必須）
3. **セルフレビュー（ui_design作成後）**: `ui_design.md` と `prd.md` を照らし合わせ、設計の妥当性・要件充足度・UX品質を確認し、必要に応じて修正
4. **クロスレビュー（Eng連携）**: `tech_spec.md` と `ui_design.md` を照らし合わせ、以下を確認
   - UIで表示するデータが tech_spec のAPIレスポンスに含まれているか
   - UIの操作（ボタン押下等）に対応するAPIが定義されているか
   - 齟齬があれば Eng と協議し、双方のドキュメントを調整

## 4. 実装プロセス（振り返りからの学び）

### 4.1. デザイントークンの活用
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

### 4.2. 既存コンポーネントの活用
実装前に `shared/components/` を確認し、既存のコンポーネントを活用する：

| コンポーネント | 用途 |
|:--------------|:-----|
| `InputFieldComponent` | テキスト/メール/パスワード入力 |
| `ButtonComponent` | ボタン（Primary/Secondary/Outline等） |
| `AlertBannerComponent` | 成功/警告/エラー/情報メッセージ |

**新規コンポーネント作成前に必ず既存資産を確認すること。**

### 4.3. Storybookへの登録
新しいコンポーネントを作成したら、必ず **Storybook** に登録する：

1. `src/stories/components/` に `ComponentName.stories.ts` を作成
2. 各バリエーション（状態、サイズ等）のストーリーを作成
3. `npm run storybook` で表示を確認

### 4.4. アクセシビリティへの配慮
- フォーカス状態のスタイルを適切に設定する（:focus-visible）
- キーボードナビゲーションに対応する
- エラーメッセージはフォームフィールドに関連付ける（aria-describedby等）

### 4.5. アニメーション・トランジション
ユーザー体験を向上させるため、適切な箇所にアニメーションを追加する：

```scss
// ボタンのホバー状態
.button {
  transition: background-color 0.2s ease, transform 0.1s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
}

// エラーメッセージのフェードイン
.error-message {
  animation: fadeIn 0.2s ease;
}
```

## 5. 他ロールとの連携
* **To PdM:** 要件(`prd.md`)を満たすUIを提案し、使い勝手を保証する。
* **To Eng:** UIに必要なデータや状態管理の要件を伝える。

## 6. 行動指針
* 機能固有のスタイル定義と、全体共通のデザインシステムを明確に区別する。
* `ui_design.md` には、正常系だけでなく、エラー時やローディング時の表示についても記載する。
* **デザイントークンを徹底する**: ハードコードされた色・サイズは使用しない。
* **コンポーネントの再利用性を意識する**: 汎用的なUIは shared/components に切り出す。

## 7. ui_design.md に必ず含める項目

### 基本項目
1. 画面構成
2. UIコンポーネント一覧
3. ワイヤーフレーム

### 追加必須項目（振り返りからの学び）
4. **状態別の表示**
   - 初期状態
   - ローディング状態
   - 成功状態
   - エラー状態
   - 空状態（データがない場合）

5. **インタラクション詳細**
   - ホバー/フォーカス/アクティブ時のスタイル変化
   - アニメーション・トランジションの有無

6. **使用するデザイントークン**
   - カラー（どのトークンを使うか明記）
   - スペーシング

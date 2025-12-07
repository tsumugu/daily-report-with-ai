# 開発フロー遵守のシステム化

開発フローを自動的に遵守できるようにするためのシステム化方法を定義します。

---

## 1. システム化の目的

- 開発フローの遵守を自動化し、人的ミスを防止
- ドキュメントステータスの検証を自動化
- 実装開始前の必須チェックを自動化
- レビュープロセスの漏れを防止

---

## 2. 実装方針

### 2.1. Git Hooksによる自動検証

既存のHuskyを活用し、以下の検証を自動化：

1. **Pre-commit**: ドキュメントステータスの検証
2. **Pre-push**: 実装開始前の必須チェック

### 2.2. 検証スクリプトの作成

Node.jsスクリプトで以下を検証：

- ドキュメントステータスの存在と妥当性
- 実装開始前の必須ドキュメントのApproved状態
- ブランチ名とドキュメントステータスの整合性

### 2.3. テンプレートの提供

ドキュメント作成時のテンプレートを提供：

- `prd.md` テンプレート
- `tech_spec.md` テンプレート
- `ui_design.md` テンプレート

---

## 3. 検証ルール

### 3.1. ドキュメントステータス検証

以下のドキュメントにステータスが記載されているか検証：

- `docs/features/{feature_name}/prd.md`
- `docs/features/{feature_name}/tech_spec.md`
- `docs/features/{feature_name}/ui_design.md`

**検証内容**:

- ステータス行が存在するか
- ステータスが `Pending` または `Approved` か
- ステータスの形式が正しいか

### 3.2. 実装開始前の必須チェック

実装コード（`apps/api/src/**` または `apps/web/src/**`）が変更された場合：

- すべての設計ドキュメントが **Approved** ステータスであること
- プロトタイプが存在すること（`apps/web/src/stories/prototypes/{feature_name}/`）

### 3.3. ブランチ名検証

機能開発ブランチは以下の命名規則に従う：

- `feature/{feature_name}`: 新機能開発
- `fix/{feature_name}`: バグ修正

---

## 4. 実装方法

### 4.1. 検証スクリプトの作成

`scripts/verify-workflow.js` を作成：

```javascript
// ドキュメントステータスの検証
// 実装開始前の必須チェック
// ブランチ名の検証
```

### 4.2. Git Hooksの設定

`.husky/pre-commit` に追加：

```bash
# ドキュメントステータス検証
npm run verify:docs

# 実装開始前チェック
npm run verify:implementation-ready
```

### 4.3. package.jsonへのスクリプト追加

```json
{
  "scripts": {
    "verify:docs": "node scripts/verify-workflow.js --check-docs",
    "verify:implementation-ready": "node scripts/verify-workflow.js --check-implementation",
    "verify:workflow": "node scripts/verify-workflow.js --all"
  }
}
```

---

## 5. テンプレートの提供

### 5.1. テンプレートディレクトリ

`docs/templates/` に以下を配置：

- `prd.template.md`
- `tech_spec.template.md`
- `ui_design.template.md`

### 5.2. テンプレート使用コマンド

```bash
npm run create:prd {feature_name}
npm run create:tech-spec {feature_name}
npm run create:ui-design {feature_name}
```

---

## 6. CI/CDでの検証（将来実装）

GitHub Actions等で以下を検証：

- PR作成時にドキュメントステータスをチェック
- 実装コードの変更がある場合、設計ドキュメントがApprovedかチェック
- レビュープロセスの完了をチェック

---

## 7. ベストプラクティス

### ✅ 推奨

- 検証スクリプトは早期に失敗する（fail-fast）
- エラーメッセージは明確で、修正方法を提示
- 検証は高速に実行される（数秒以内）

### ❌ 非推奨

- `--no-verify` の乱用
- 検証をスキップする理由のない使用
- 検証スクリプトの無効化

---

## 8. トラブルシューティング

### 検証が失敗する場合

1. エラーメッセージを確認
2. ドキュメントステータスを確認
3. 必要に応じてステータスを更新

### 緊急時の対応

緊急修正が必要な場合のみ `--no-verify` を使用：

```bash
git commit --no-verify -m "緊急修正: [理由]"
```

**注意**: 緊急修正後は必ずドキュメントを更新し、検証を再実行すること。

---

## 9. 使用方法

### 9.1. ドキュメント作成

テンプレートから新規ドキュメントを作成：

```bash
# PRD作成
npm run create:prd {feature_name}

# Tech Spec作成
npm run create:tech-spec {feature_name}

# UI Design作成
npm run create:ui-design {feature_name}
```

例：

```bash
npm run create:prd auth
# → docs/features/auth/prd.md が作成される
```

### 9.2. 検証の実行

手動で検証を実行：

```bash
# ドキュメントステータスの検証
npm run verify:docs

# 実装開始前の必須チェック
npm run verify:implementation-ready

# すべての検証
npm run verify:workflow
```

### 9.3. Git Hooksによる自動検証

- **コミット時**: ドキュメントステータスが自動検証される
- **プッシュ時**: 実装開始前の必須チェックが自動実行される

検証に失敗した場合、コミット/プッシュが中断されます。

---

## 10. 関連ドキュメント

- `docs/rules/development-flow.md` - 開発フロー
- `docs/rules/documentation.md` - ドキュメント作成ルール
- `docs/general/lint-rules.md` - Lint設定（Git Hooksの参考）

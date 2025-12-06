# ESLint設定ガイド

## 設定構造

このプロジェクトでは、**統合型ESLint設定**を採用しています。

```
daily-report/
├── eslint.config.js           ← 共通ルール（ベース設定）
├── apps/
│   ├── api/
│   │   └── eslint.config.js   ← API固有ルール（ベースを継承）
│   └── web/
│       └── eslint.config.js   ← Web固有ルール（ベースを継承）
```

---

## 共通ルール（全プロジェクト適用）

`/eslint.config.js`で定義される、すべてのワークスペースで共有されるルール：

### 基本設定
- JavaScript推奨設定（`@eslint/js`）
- TypeScript推奨設定（`typescript-eslint`）

### 主要ルール

| ルール | 設定 | 説明 |
|--------|------|------|
| `@typescript-eslint/no-unused-vars` | error | 未使用変数を禁止（`_`始まりは除外） |
| `@typescript-eslint/no-explicit-any` | warn | `any`型は警告 |
| `no-console` | warn | `console.log`は警告（warn/error/infoは許可） |
| `prefer-const` | error | 再代入しない変数は`const`を強制 |
| `@typescript-eslint/no-empty-function` | warn | 空関数は警告 |

---

## API固有ルール

`/apps/api/eslint.config.js`で定義される、Node.js/Express環境に特化したルール：

### オーバーライド

| ルール | 設定 | 理由 |
|--------|------|------|
| `no-console` | off | サーバーログは必要 |
| `@typescript-eslint/no-explicit-any` | off | Express型定義で必要な場合がある |

---

## Web固有ルール

`/apps/web/eslint.config.js`で定義される、Angular環境に特化したルール：

### Angular ESLint
- `angular-eslint`の推奨設定を適用
- テンプレートアクセシビリティチェック

### 主要ルール

| ルール | 設定 | 説明 |
|--------|------|------|
| `@angular-eslint/directive-selector` | error | ディレクティブは`app`プレフィックス + camelCase |
| `@angular-eslint/component-selector` | error | コンポーネントは`app`プレフィックス + kebab-case |

**例：**
```typescript
// ✅ 正しい
@Component({
  selector: 'app-input-field'  // kebab-case
})

// ❌ 間違い
@Component({
  selector: 'inputField'  // プレフィックスなし
})
```

---

## Lintコマンド

### 全体をチェック
```bash
npm run lint
```

### ルートのみチェック
```bash
npm run lint:root
```

### 個別のワークスペースをチェック
```bash
# Web
cd apps/web && npm run lint

# API
cd apps/api && npm run lint
```

### ステージングファイルのみチェック（Git Hook用）
```bash
npm run lint:staged
```

---

## 自動Lint実行（Git Hooks）

このプロジェクトでは、**commit時に自動的にLintが実行**されます。

### 仕組み

```
git commit
    ↓
pre-commit hook (Husky)
    ↓
lint-staged
    ↓
変更されたファイルのみLint実行
    ↓
自動修正（--fix）
    ↓
エラーがあればcommit中断
```

### 対象ファイル

| ファイルタイプ | 実行内容 |
|--------------|---------|
| `apps/api/src/**/*.{ts,js}` | ESLint（自動修正あり） |
| `apps/web/src/**/*.{ts,html}` | ESLint（自動修正あり） |
| `**/*.{json,md}` | Prettier（自動整形） |

### Pre-push Hook（E2Eテスト）

プッシュ前に自動的にE2Eテストが実行されます。

```
git push
    ↓
pre-push hook (Husky)
    ↓
npm run e2e
    ↓
テスト失敗ならpush中断
```

### Hookをスキップする方法（非推奨）

緊急時のみ使用してください：

```bash
# コミット時のLintをスキップ
git commit --no-verify -m "緊急修正"

# プッシュ時のE2Eテストをスキップ
git push --no-verify
```

⚠️ **注意:** チーム開発では原則として`--no-verify`の使用は禁止です。

---

## ルール無効化の方法

### ファイル全体で無効化
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
```

### 特定行のみ無効化
```typescript
// eslint-disable-next-line @typescript-eslint/no-empty-function
private onChange: (value: string) => void = () => {};
```

### 複数ルールを無効化
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
```

---

## 新しいルールを追加する場合

### 全プロジェクト共通のルールを追加
1. `/eslint.config.js`の`rules`セクションに追加
2. 1箇所の変更で全ワークスペースに適用される

### 特定のワークスペースのみに追加
1. `apps/api/eslint.config.js`または`apps/web/eslint.config.js`に追加
2. 該当ワークスペースのみに適用される

---

## ベストプラクティス

### ✅ 推奨
- 共通ルールはルートの設定に定義
- ワークスペース固有の理由がある場合のみオーバーライド
- ルール無効化には必ずコメントで理由を記載

### ❌ 非推奨
- 同じルールを複数のワークスペースで重複定義
- 理由なく広範囲でルールを無効化
- `eslint-disable`の乱用

---

## トラブルシューティング

### Lintエラーが消えない場合
```bash
# キャッシュをクリア
rm -rf node_modules/.cache
npm run lint
```

### 新しいルールが反映されない場合
```bash
# 依存関係を再インストール
npm install
```

### IDEでESLintが動作しない場合
- VSCodeの場合: ESLint拡張機能を再起動
- 設定ファイルの変更後はIDEを再起動

---

## 参考リンク

- [ESLint公式ドキュメント](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Angular ESLint](https://github.com/angular-eslint/angular-eslint)


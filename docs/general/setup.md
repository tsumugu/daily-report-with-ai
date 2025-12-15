# セットアップガイド

このドキュメントでは、Daily Reportプロジェクトの環境構築から開発開始までの手順を説明します。

---

## Cursor CLIのインストール（Driverロール用）

Driverロールが他のロールに指示を出す際に使用するCursor CLIをインストールします。

### インストール方法

**macOS、Linux、Windows（WSL）**:

```bash
curl https://cursor.com/install -fsS | bash
```

### PATHへの追加

インストール後、`~/.local/bin`をPATHに追加します：

**zshの場合**:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**bashの場合**:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### インストール確認

```bash
cursor-agent --version
```

バージョン情報が表示されれば、インストールは成功です。

### 認証

Cursor CLIを使用する前に、認証が必要です：

```bash
cursor-agent login
```

ブラウザが開き、Cursorアカウントでログインします。認証が完了すると、CLIが使用可能になります。

**環境変数での認証（CI/CD等）**:

```bash
export CURSOR_API_KEY="your-api-key"
```

### 使用方法

Driverロールが他のロールに指示を出す際は、以下の形式を使用します：

```bash
# 対話型セッションの開始
cursor-agent

# または、初期プロンプトを指定して開始
cursor-agent "@PdM: Phase 3-1のPRD作成を開始してください。要件はロードマップに記載されています。"
```

**非対話モードでの使用**:

```bash
cursor-agent -p "@Eng: Tech Spec作成を開始してください。PRDはApprovedステータスです。" --output-format text
```

**注意**: Cursor CLIは現在ベータ版です。ターミナルコマンドを実行する前に、CLIが実行の可否を確認します。承認する場合は`Y`、拒否する場合は`N`を押してください。

---

## 前提条件

### 必須

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 確認方法

```bash
node --version  # v18.0.0以上
npm --version   # 9.0.0以上
```

### インストールが必要な場合

- [Node.js公式サイト](https://nodejs.org/)からLTS版をダウンロード
- または [nvm](https://github.com/nvm-sh/nvm)を使用して管理

```bash
# nvmを使う場合
nvm install 18
nvm use 18
```

---

## インストール

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd daily-report
```

### 2. 依存関係のインストール

```bash
# ルートで実行すると全ワークスペースの依存関係がインストールされる
npm install
```

**インストールされるもの:**

- `@daily-report/web` の依存関係（Angular等）
- `@daily-report/api` の依存関係（Express等）
- `@daily-report/shared` の依存関係
- ルートの開発依存関係（ESLint、Husky等）

---

## 開発サーバー起動

### フロントエンド + バックエンド同時起動（推奨）

```bash
npm run dev
```

**起動内容:**

- フロントエンド: http://localhost:4200
- バックエンド: http://localhost:3000

### 個別起動

#### フロントエンドのみ

```bash
npm run dev:web
```

**起動後:** http://localhost:4200

**ホットリロード:** ✓（ファイル変更時に自動更新）

#### バックエンドのみ

```bash
npm run dev:api
```

**起動後:** http://localhost:3000

**ホットリロード:** ✓（tsx watchで自動再起動）

---

## その他のコマンド

### ビルド

```bash
# 全ワークスペースをビルド
npm run build

# 個別ビルド
npm run build:web  # フロントエンドのみ
npm run build:api  # バックエンドのみ
```

**出力先:**

- Web: `apps/web/dist/`
- API: `apps/api/dist/`

### Lint

```bash
# 全体をチェック
npm run lint

# ルートのみ
npm run lint:root

# 個別ワークスペース
cd apps/web && npm run lint
cd apps/api && npm run lint
```

詳細は [Lint設定ガイド](./lint-rules.md) を参照。

### ユニットテスト

```bash
# 全ワークスペースのテスト実行（watchモード）
npm run test

# 全ワークスペースのテスト実行（CIモード、watchなし）
npm run test:ci

# 個別実行
cd apps/web && npm run test
cd apps/api && npm run test

# CIモード（watchなし）
cd apps/web && npm run test:ci
cd apps/api && npm run test:ci

# カバレッジ付き
cd apps/web && npm run test:coverage
```

### E2Eテスト

```bash
# 初回のみ: Playwrightのブラウザをインストール
cd apps/web && npx playwright install chromium

# E2Eテスト実行（API + FE が自動起動）
npm run e2e

# UIモードで実行（デバッグに便利）
npm run e2e:ui

# カバレッジ付きで実行
npm run e2e:coverage
```

詳細は [テストルール](./test_rules.md) を参照。

### Storybook

```bash
npm run storybook
```

**起動後:** http://localhost:6006

**内容:**

- デザインシステムのドキュメント
- コンポーネントカタログ

---

## ワークスペース構成

| パッケージ             | 説明                       | ポート | 開発コマンド      |
| :--------------------- | :------------------------- | :----- | :---------------- |
| `@daily-report/web`    | Angular フロントエンド     | 4200   | `npm run dev:web` |
| `@daily-report/api`    | Express バックエンド       | 3000   | `npm run dev:api` |
| `@daily-report/shared` | 共通型定義・ユーティリティ | -      | -                 |

---

## トラブルシューティング

### ポートが既に使用されている

```bash
# ポート4200が使用中の場合
Error: Port 4200 is already in use

# 解決策: ポートを変更
ng serve --port 4201
```

```bash
# ポート3000が使用中の場合
Error: Port 3000 is already in use

# 解決策: 環境変数で変更
PORT=3001 npm run dev:api
```

### node_modulesの破損

```bash
# node_modulesを削除して再インストール
rm -rf node_modules apps/*/node_modules
npm install
```

### Huskyのフックが動作しない

```bash
# フックに実行権限を付与
chmod +x .husky/pre-commit

# Huskyを再初期化
npx husky
```

### ビルドエラーが出る

```bash
# キャッシュをクリア
rm -rf apps/web/.angular
rm -rf apps/web/dist
rm -rf apps/api/dist

# 再ビルド
npm run build
```

---

## 環境変数

### API（`apps/api/.env`）

```bash
# ポート番号
PORT=3000

# JWT秘密鍵（本番環境では必ず変更）
JWT_SECRET=your-secret-key-change-this-in-production
```

### Web（`apps/web/src/environments/`）

**開発環境:** `environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
};
```

**本番環境:** `environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: "https://your-api-domain.com",
};
```

---

## 次のステップ

1. ✅ 環境構築完了
2. 📚 [アーキテクチャドキュメント](./arch.md)を読む
3. 🎨 [デザインシステムルール](../.cursor/rules/design_system_rules.mdc)を確認（実体はStorybook: `apps/web/src/stories/`）
4. 💻 [コーディングルール](./lint-rules.md)を確認
5. 🚀 開発開始！

---

## 参考リンク

- [Angular公式ドキュメント](https://angular.io/docs)
- [Express公式ドキュメント](https://expressjs.com/)
- [Storybook公式ドキュメント](https://storybook.js.org/)

# 📐 アーキテクチャ方針（Zero to One フェーズ）

本プロジェクトは「Zero to One」=プロダクトの最初期段階にあるため、以下の原則に則ります。

## 基本指針
- **変更容易性を最優先**とします。
- 要件や仕様は頻繁に変わることを前提とし、拡張・修正・置換がしやすい設計/実装方式を採用します。
- "技術的負債の先送り"を恐れず、現時点での必要最小限の分割・抽象化にとどめます。

## フロントエンド構成
- **Atomic Design + コンポーネント分割**
  - UIは粒度小さく整理し、ビジネスロジックをコンポーネント外に逃す(カスタムフック等の活用)
- **ディレクトリ設計と命名ルールの柔軟さ**
  - src/配下は機能や階層の見直しがしやすい粒度で整理、初期は単純でOK
- **グローバル変数・副作用の最小化**
  -状態・副作用の扱い（context/fook/store）は最小範囲で限定的に、安易なグローバル展開は避ける

## バックエンド／API連携
- Express + TypeScript でAPIサーバーを構築
- APIモックや外部APIクライアントは疎結合を優先し、将来的な入れ替え・ローカル実装も容易に

## モノレポ構成（現状）

```
daily-report/
├── apps/
│   ├── web/              # @daily-report/web（Angular フロントエンド）
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/       # シングルトン（ガード、インターセプター）
│   │   │   │   ├── shared/     # 共通部品
│   │   │   │   └── features/   # 機能単位のモジュール
│   │   │   └── environments/   # 環境変数
│   │   ├── angular.json
│   │   └── package.json
│   │
│   └── api/              # @daily-report/api（Express バックエンド）
│       ├── src/
│       │   ├── routes/         # APIルート
│       │   ├── middleware/     # ミドルウェア
│       │   ├── models/         # データモデル
│       │   └── db/             # データベース
│       └── package.json
│
├── packages/
│   └── shared/           # @daily-report/shared（FE/BE共通型定義）
│       └── src/
│           └── models/         # 共通型定義
│
├── docs/                 # ドキュメント
├── daily_report/         # 日報記録
├── rules/                # AIロール定義
└── package.json          # ルート（npm workspaces）
```

### 今後の拡張方針

#### コンポーネント方針
- **Standalone Components を採用**（Angular 17+ 推奨）
- NgModule は使用せず、各コンポーネントを独立して管理

#### フロントエンド（apps/web）ディレクトリ構成

```
apps/web/src/app/
├── core/                 # アプリ全体で1回だけ読み込むもの（シングルトン）
│   ├── guards/           # 認証ガード等
│   │   └── auth.guard.ts
│   ├── interceptors/     # HTTPインターセプター
│   │   └── auth.interceptor.ts
│   └── services/         # シングルトンサービス
│       └── api.service.ts
│
├── shared/               # 複数機能で共有するもの（再利用可能）
│   ├── components/       # 共通UIコンポーネント（Storybook登録対象）
│   ├── pipes/            # 共通パイプ
│   ├── directives/       # 共通ディレクティブ
│   ├── models/           # 共通型定義・インターフェース
│   └── utils/            # ユーティリティ関数
│
└── features/             # 機能単位のモジュール
    ├── auth/             # 認証機能
    ├── daily-report/     # 日報機能
    └── ...
```

#### features/ 配下の詳細構成（例：auth）

```
apps/web/src/app/features/auth/
├── components/           # 機能固有のUIコンポーネント
│   ├── login-form/
│   └── signup-form/
├── pages/                # ルーティング対象のページコンポーネント
│   ├── login-page/
│   └── signup-page/
├── services/             # 機能固有のサービス
│   └── auth.service.ts
├── models/               # 機能固有の型定義
│   └── user.model.ts
└── auth.routes.ts        # 機能のルーティング定義
```

#### Storybook との連携
- `shared/components/` の共通コンポーネントは Storybook に登録必須
- `features/*/components/` の機能固有コンポーネントは任意で登録
- 現在の `stories/` 配下はサンプルとして残し、実装時は上記構成に移行

## 変更履歴・技術的な意思決定
- 重要な設計判断・変更点は必ずdocs/general/以下のmdに追記してください

---

柔軟性と最小コストでの「やり直し」が可能なことを常に最優先し、スピードと安定性のバランスで方針判断してください。

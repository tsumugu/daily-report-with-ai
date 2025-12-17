# デプロイ機能実装 TODO

**作成日**: 2025-01-XX  
**作成者**: Eng  
**目的**: デプロイ機能の実装タスクを管理

---

## 📋 実装フェーズ

### フェーズ1: 必須コード実装

#### 1.1 Cloud Storage API対応

- [ ] `@google-cloud/storage`パッケージのインストール（注意: @typesパッケージは不要）
- [ ] `apps/api/src/db/storage-adapter.ts`の作成
  - [ ] `initializeTables`のインポート追加
  - [ ] Cloud Storageクライアントの初期化
  - [ ] ダウンロード機能の実装（リトライロジック含む）
  - [ ] アップロード機能の実装
  - [ ] WALファイルとSHMファイルのアップロード対応
  - [ ] シグナルハンドラーの重複登録防止
  - [ ] エラーハンドリングの強化
- [ ] `apps/api/src/db/database.ts`の非同期対応
  - [ ] `getDatabase()`を非同期関数に変更（ファクトリーパターン実装）
  - [ ] Cloud Storageアダプターの統合
  - [ ] 開発環境と本番環境の分岐処理
  - [ ] 開発環境用の`getDatabaseSync()`の実装（後方互換性）
- [ ] データベースクラスの非同期対応
  - [ ] `apps/api/src/db/users.db.ts`のファクトリーパターン実装
  - [ ] `apps/api/src/db/daily-reports.db.ts`のファクトリーパターン実装
  - [ ] `apps/api/src/db/goals.db.ts`のファクトリーパターン実装
  - [ ] `apps/api/src/db/followups.db.ts`のファクトリーパターン実装
  - [ ] `apps/api/src/db/weekly-focuses.db.ts`のファクトリーパターン実装
  - [ ] `apps/api/src/db/daily-report-goals.db.ts`のファクトリーパターン実装
- [ ] ルートハンドラーの非同期対応
  - [ ] `apps/api/src/routes/auth.routes.ts`の修正
  - [ ] `apps/api/src/routes/daily-reports.routes.ts`の修正
  - [ ] `apps/api/src/routes/goals.routes.ts`の修正
  - [ ] `apps/api/src/routes/followups.routes.ts`の修正
  - [ ] `apps/api/src/routes/weekly-focuses.routes.ts`の修正

#### 1.2 変更検知アップロードとバッチアップロードの統合

- [ ] 変更フラグ管理とバッチカウンターの実装
  - [ ] `markAsChanged()`関数の実装
  - [ ] `hasDatabaseChanges()`関数の実装
  - [ ] `clearChanges()`関数の実装
  - [ ] `syncIfNeeded()`関数の実装（変更検知とバッチアップロードの統合）
  - [ ] バッチサイズの設定（環境変数`BATCH_SIZE`）
- [ ] ミドルウェアの実装
  - [ ] リクエスト処理後の変更検知
  - [ ] 非同期アップロード処理（`syncIfNeeded()`の呼び出し）
  - [ ] エラーハンドリングの実装
- [ ] 各データベースクラスの修正
  - [ ] `apps/api/src/db/users.db.ts`: INSERT/UPDATE/DELETE操作時に`markAsChanged()`を呼び出す
  - [ ] `apps/api/src/db/daily-reports.db.ts`: INSERT/UPDATE/DELETE操作時に`markAsChanged()`を呼び出す
  - [ ] `apps/api/src/db/goals.db.ts`: INSERT/UPDATE/DELETE操作時に`markAsChanged()`を呼び出す
  - [ ] `apps/api/src/db/followups.db.ts`: INSERT/UPDATE/DELETE操作時に`markAsChanged()`を呼び出す
  - [ ] `apps/api/src/db/weekly-focuses.db.ts`: INSERT/UPDATE/DELETE操作時に`markAsChanged()`を呼び出す
  - [ ] `apps/api/src/db/daily-report-goals.db.ts`: INSERT/UPDATE/DELETE操作時に`markAsChanged()`を呼び出す

#### 1.3 終了時の確実な同期

- [ ] SIGTERMシグナルハンドラーの実装（重複登録防止）
- [ ] SIGINTシグナルハンドラーの実装（重複登録防止）
- [ ] 終了時の同期処理の実装
- [ ] シグナルハンドラーの重複登録防止フラグの実装

#### 1.4 その他の必須実装

- [ ] 環境変数の検証機能の実装
  - [ ] `apps/api/src/config/env.ts`の作成
  - [ ] `validateEnvironmentVariables()`関数の実装
  - [ ] `apps/api/src/index.ts`での検証呼び出し
- [ ] CORS設定の環境変数化（`apps/api/src/index.ts`）
- [ ] JWT_SECRETの必須化（`apps/api/src/middleware/auth.middleware.ts`）
- [ ] フロントエンド環境設定の更新（`apps/web/src/environments/environment.prod.ts`）
- [ ] GitHub Pages用SPAルーティング対応（404.htmlの作成）
- [ ] 環境変数テンプレートの作成（`apps/api/.env.example`）
  - [ ] `NODE_ENV`の説明
  - [ ] `DB_PATH`の説明（デフォルト: `/tmp/daily-report.db`）
  - [ ] `JWT_SECRET`の説明
  - [ ] `CORS_ORIGIN`の説明
  - [ ] `GCS_BUCKET_NAME`の説明
  - [ ] `GOOGLE_APPLICATION_CREDENTIALS`の説明
  - [ ] `BATCH_SIZE`の説明（デフォルト: 10）
- [ ] ポート設定の確認（Cloud Run用に8080）

---

### フェーズ2: Dockerfile作成

- [ ] API用Dockerfileの作成（`apps/api/Dockerfile`）
  - [ ] マルチステージビルドの実装
  - [ ] 非rootユーザーの設定
  - [ ] ヘルスチェックの設定
- [ ] .dockerignoreの作成（`.dockerignore`）

---

### フェーズ3: Terraform設定

#### 3.1 Terraformディレクトリ構造

- [ ] `terraform/`ディレクトリの作成
- [ ] `terraform/main.tf`の作成
  - [ ] Terraformバージョンとプロバイダーの指定（`required_version >= 1.0`, `google ~> 5.0`）
  - [ ] Cloud Storageバケットの定義
  - [ ] Cloud Runサービスの定義（FUSEマウント設定を削除）
  - [ ] Cloud Runサービスアカウントの定義
  - [ ] Cloud RunサービスアカウントへのCloud Storageアクセス権限付与
  - [ ] Secret Managerの定義
  - [ ] IAM設定
- [ ] `terraform/variables.tf`の作成
- [ ] `terraform/outputs.tf`の作成
- [ ] `terraform/terraform.tfvars.example`の作成

#### 3.2 Terraform設定の修正

- [ ] FUSEマウント設定の削除
- [ ] `GCS_BUCKET_NAME`環境変数の追加
- [ ] `container_concurrency = 1`の設定
- [ ] Cloud Storageバケットの作成設定
- [ ] Cloud Runサービスアカウントへの`roles/storage.objectAdmin`権限付与

---

### フェーズ4: CI/CDパイプライン

- [ ] GitHub Actionsワークフローの作成（`.github/workflows/deploy-production.yml`）
  - [ ] フロントエンドデプロイジョブ
    - [ ] ビルドステップ
    - [ ] 404.htmlの作成
    - [ ] GitHub Pagesへのデプロイ
  - [ ] バックエンドデプロイジョブ
    - [ ] GCP認証設定
    - [ ] Artifact Registry用のDocker認証設定（`gcloud auth configure-docker asia-northeast1-docker.pkg.dev`）
    - [ ] Dockerイメージのビルド（Artifact Registry用のタグ）
    - [ ] Artifact Registryへのプッシュ（Container RegistryではなくArtifact Registryを使用）
    - [ ] Cloud Runへのデプロイ
    - [ ] 環境変数`BATCH_SIZE`の設定

---

### フェーズ5: 環境設定とデプロイ

#### 5.1 GCPプロジェクトの準備

- [ ] GCPプロジェクトの作成
- [ ] 必要なAPIの有効化
  - [ ] Cloud Run API
  - [ ] Cloud Storage API
  - [ ] Secret Manager API
  - [ ] Artifact Registry API（Container RegistryではなくArtifact Registryを使用）
- [ ] Artifact Registryリポジトリの作成
  - [ ] リポジトリ名: `daily-report`
  - [ ] フォーマット: Docker
  - [ ] ロケーション: `asia-northeast1`
- [ ] サービスアカウントの作成
- [ ] IAMロールの設定
  - [ ] GitHub Actions用サービスアカウントへの権限付与
  - [ ] Cloud RunサービスアカウントへのCloud Storageアクセス権限付与

#### 5.2 GitHub Secrets設定

- [ ] `GCP_SA_KEY`の設定
- [ ] `GCP_PROJECT_ID`の設定
- [ ] `GCS_BUCKET_NAME`の設定
- [ ] `API_URL`の設定
- [ ] `CORS_ORIGIN`の設定
- [ ] `BASE_HREF`の設定（オプション）
- [ ] `CUSTOM_DOMAIN`の設定（オプション）
- [ ] `BATCH_SIZE`の設定（オプション、デフォルト: 10）

#### 5.3 Terraformでインフラ作成

- [ ] `terraform.tfvars`の作成
- [ ] Terraformの初期化（`terraform init`）
- [ ] 実行計画の確認（`terraform plan`）
- [ ] インフラの作成（`terraform apply`）

#### 5.4 Secret Manager設定

- [ ] JWT_SECRETの作成
- [ ] Secret Managerへの登録

#### 5.5 初回デプロイ

- [ ] masterブランチへのマージ
- [ ] GitHub Actionsの実行確認
- [ ] デプロイの確認

---

### フェーズ6: テストと検証

#### 6.1 ローカル環境でのテスト

- [ ] 環境変数テンプレート（`.env.example`）の確認
- [ ] Cloud Storage APIの動作確認
- [ ] 変更検知アップロードの動作確認
- [ ] バッチアップロードの動作確認（バッチサイズに達した場合の即座のアップロード）
- [ ] 終了時の同期処理の動作確認
- [ ] エラーハンドリングの確認（リトライロジック、権限エラーなど）
- [ ] データベースファイルが存在しない場合の初回起動処理の確認

#### 6.2 Cloud Runでのテスト

- [ ] デプロイの確認
- [ ] ヘルスチェックの確認
- [ ] APIエンドポイントの動作確認
- [ ] データ永続化の確認
- [ ] コールドスタートの動作確認

#### 6.3 パフォーマンステスト

- [ ] レスポンスタイムの測定
- [ ] コールドスタート時間の測定
- [ ] 同時書き込みのテスト

#### 6.4 コスト確認

- [ ] Cloud Storage APIのオペレーション回数の確認
- [ ] コストの監視
- [ ] 予算アラートの設定

---

## 🔄 進行中のタスク

（実装開始時に更新）

---

## ✅ 完了したタスク

（実装完了時に更新）

---

## 📝 メモ

### 実装時の注意事項

1. **getDatabase()の非同期化**: 既存のコードで同期的に呼び出されている箇所をすべて非同期対応する必要がある
2. **変更検知アップロード**: すべてのデータベース操作で`markAsChanged()`を呼び出す必要がある
3. **バッチアップロード**: バッチサイズは環境変数`BATCH_SIZE`で設定可能にする（デフォルト: 10）
4. **エラーハンドリング**: Cloud Storage APIのエラーは適切にハンドリングし、リトライロジックを実装する
5. **シグナルハンドラー**: 重複登録を防ぐため、フラグで管理する
6. **環境変数の検証**: アプリケーション起動時に必須環境変数を検証する
7. **Artifact Registry**: Container RegistryではなくArtifact Registryを使用する
8. **Cloud Runサービスアカウント**: Cloud Storageへのアクセス権限を付与する必要がある
9. **ログ出力**: デバッグ用のログを適切に出力する
10. **initializeTablesのインポート**: `storage-adapter.ts`で`initializeTables`をインポートする

### 参考資料

- [PRD](../prd.md)
- [技術仕様書](../tech_spec.md)
- [実装計画書](../implement_plan.md)
- [Engの技術的回答](../eng_response_to_pdm.md)
- [コスト分析](../eng_cost_analysis_storage_api.md)

---

**最終更新日**: 2025-01-XX

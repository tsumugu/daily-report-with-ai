# [Role: Eng] Auth機能 振り返り

## Keep（良かった点）

1. **モノレポ構成の採用**
   - npm workspaces で FE/BE/shared を統合管理
   - 型定義の共有がスムーズにできた

2. **JWT認証の実装**
   - シンプルなトークンベース認証で、セッション管理が容易になった
   - AuthInterceptorでトークン付与を一元化できた

3. **テストカバレッジ100%達成**
   - 全コードにユニットテストを書き、品質を担保した
   - Karma設定で100%閾値を強制し、今後の劣化を防止

4. **ControlValueAccessorの活用**
   - InputFieldコンポーネントをReactive Formsと統合
   - 再利用可能なフォームコンポーネントを実現

5. **ESLint Flat Config統合**
   - モノレポ全体で一貫したコード品質を担保
   - pre-commitフックで自動チェックを実現

## Problem（改善点）

1. **TDD未実践**
   - 実装を先に書いてからテストを追加した
   - Red-Green TDDのサイクルを回せていなかった
   - **反省文書**: `docs/retro/2025-12-05_eng.md` に詳細記載

2. **SSR互換性問題**
   - 最初にSSRを有効化したため、localStorageアクセスでエラー
   - isPlatformBrowser()で対応したが、本来はSSR不要だった

3. **RouterTestingModuleの設定に苦労**
   - ActivatedRouteのモック、queryParamsの設定で試行錯誤
   - 最終的にRouterTestingModule.withRoutes([])で解決

4. **ESLint設定の複雑さ**
   - Flat Config形式への移行で、extends/configの使い方に混乱
   - TypeScript/HTMLファイルへのルール適用範囲の設定に時間がかかった

## Try（次回アクション）

1. **TDD徹底**
   - テストを先に書く習慣を強制する
   - Red（失敗テスト）→ Green（最小実装）→ Refactor のサイクルを回す

2. **SSRは必要になってから**
   - 初期はCSRで開発し、SEO要件が出てからSSR対応を検討

3. **テスト設定のスニペット化**
   - RouterTestingModule、HttpTestingController等の設定をテンプレート化
   - よく使うモックパターンをドキュメント化

4. **ESLint設定のドキュメント整備**
   - Flat Configのトラブルシューティングガイドを追加

## Learnings

### 技術的な学び
- **Angular 19 Standalone Components**: NgModule不要でテストしやすい
- **ControlValueAccessor**: onChange/onTouchedの空メソッドは `// eslint-disable-next-line` で対応
- **Karma Coverage**: `karma.conf.cjs`（CommonJS形式）で100%閾値を強制可能
- **ESLint Flat Config**: TypeScript専用ルールは files: ['**/*.ts'] で限定する

### アーキテクチャの学び
- **feature-based構造**: auth/ 配下に pages/services/models を配置し、凝集度を高めた
- **shared/components**: 汎用コンポーネントを shared に切り出し、再利用性を確保
- **interceptor**: 認証トークンの付与・401エラー処理を一元化

### プロセスの学び
- **テストは後回しにすると辛い**: 実装後にテストを書くと、設計の問題に気づきにくい
- **ドキュメントの価値**: tech_spec.md があることで、API設計の迷いがなかった


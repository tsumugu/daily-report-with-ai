---
description: "QAロール定義。テスト戦略の策定、テスト設計、品質保証の責務と行動指針。TDD手順、Angular/E2Eテストの実装ガイドを含む"
alwaysApply: true
---

# Role Definition: QA (Quality Assurance)

## 1. ミッション

ユーザーが致命的な体験をする確率を継続的に下げるために、テストを設計・運用し、品質を保証する。

## 2. 基本原則

### 2.1. QAの目的

**目的**: 「ユーザーが致命的な体験をする確率を継続的に下げるために、どのようにテストを設計・運用するか」を明文化すること。

**目的ではない**:

- テスト数の最大化
- カバレッジの達成自体
- UI実装の固定
- E2Eテストの網羅

### 2.2. QAに関する基本原則

- **テストはリスクを減らすための手段である**
- **カバレッジは劣化を検知するための観測指標である**
- **E2Eテストは最後の安全網であり、主戦場ではない**
- **DOMやUI構造は仕様ではなく、守る対象はユーザー体験と意味である**

### 2.3. テストピラミッドの考え方

テストは以下の順で検討する：

1. **Unitで守れるか**
2. **Integrationで守れるか**
3. **Contractで守るべき境界か**
4. **それでも足りない場合のみE2E**

**原則**: 可能な限り下位レイヤで担保する。

## 3. 主な責務

### 3.1. テスト戦略の策定

- 機能開発の各フェーズで、適切なテストレイヤを選択する
- テストレイヤ選択の判断基準を提供する
- テスト設計のレビューを実施する

### 3.2. テスト設計のレビュー

- Eng/Desが作成したテスト設計をレビューする
- テストレイヤの選択が適切か確認する
- テストの配置が最適か確認する

### 3.3. 品質基準の監視

- カバレッジを品質劣化の兆候として監視する
- テストの安定性を確認する
- 品質ゲートの設定と監視を行う

### 3.4. テストの実装支援

- 適切なテストレイヤでのテスト実装を支援する
- テストのベストプラクティスを提供する
- テストの安定性向上を支援する
- TDD（Test-Driven Development）の実践を支援する

## 4. TDD（Test-Driven Development）の実践

本プロジェクトでは、t-wada提唱のred-green テスト駆動開発を実践します。

### 4.1. red-green TDD手順

1. **Red：失敗するテストを書く**
   - 実装前に必ず、意図通り動作するなら通るはずのテストを書く
   - テストが失敗（redになる）ことを確認する
2. **Green：実装を書く**
   - テストがpassする最小限の実装を書く
   - 書いた後、テストがGreen(passed)に変わるまで調整
3. **Refactor：リファクタ**
   - テストがGreenを維持している状態で、安心して改善・整理・最適化を行う

### 4.2. TDDの補足

- 小さな単位でRed/Green/Refactorサイクルを高速で回すことを意識
- テストが失敗しない状態で新規実装や変更は原則行わない
- 不明点や悩んだ場合はプロジェクト内で相談推奨

## 5. テストレイヤ選択ルール（判断基準）

| 判断質問                         | 該当する場合のテスト |
| -------------------------------- | -------------------- |
| ビジネスルール・計算・状態遷移か | Unit                 |
| 複数モジュール・外部依存の連携か | Integration          |
| 他チーム・外部とのI/Fか          | Contract             |
| ユーザー操作の一連の流れか       | E2E                  |

**複数該当する場合は、最も下位のレイヤを選択する。**

## 6. 各テストレイヤのルール

### 5.1. Unitテストのルール

#### 書くべき対象

- 条件分岐・例外処理
- 入力値検証
- 状態遷移・計算ロジック

#### 書かない対象

- DOM構造の詳細
- ライブラリの内部挙動
- フレームワークの動作確認

#### 基本原則

- **1テスト1意図**
- **実装ではなく仕様を検証する**

### 5.2. Integrationテストのルール

#### 目的

- 複数要素が正しく連携していることを保証する

#### 含める観点

- 正常系と異常系
- 権限・認可
- 外部依存の失敗伝播

#### 避けること

- Unitテストの再現
- UI操作の全面再現

### 5.3. Contractテストのルール

#### 対象

- API・イベント・スキーマなどの境界

#### 原則

- 互換性が壊れる変更を早期に検知する
- Contract違反は、E2Eより前に検知されるべきである

### 5.4. E2Eテスト運用方針

#### 基本スタンス

- **E2Eテストは許可制とする**
- **クリティカルパス以外の追加は原則認めない**

#### E2Eとして許可される条件

- 実ユーザーが行う操作である
- 壊れた場合の影響が大きい
- 他レイヤで十分に担保できない

#### 設計原則

- **最短経路のみを検証する**
- **複数機能を1テストに詰め込まない**
- **不安定要因（時間待ち・共有データ）を含めない**

## 7. カバレッジの扱い方

### 6.1. カバレッジの位置づけ

- **カバレッジは品質劣化の兆候を検知するための指標**として利用する
- **数値を上げること自体を目的にテストを追加してはならない**

### 6.2. カバレッジ対象外として扱ってよいもの

- DOM構造のみの記述
- CSS・アニメーション・スタイル切替
- 表示専用のラッパーコンポーネント

**重要**: カバレッジを除外する場合は、理由と代替担保を明示する。

## 8. DOM / UIテストに対する公式スタンス

### 7.1. 基本方針

- **DOM構造やclassは仕様ではない**
- **検証するのは「ユーザーが認知する意味」である**

### 7.2. 推奨

- role / aria
- label・accessible name
- 意味のある表示状態

### 7.3. 非推奨

- class名
- DOM階層依存
- nth-child

## 9. CIにおける品質ゲート

### 8.1. PR時

- Unit / Integration / Contract が失敗していないこと
- テスト戦略に反したE2E追加がないこと

### 8.2. リリース前

- 既知の不安定テストが放置されていないこと
- クリティカルパスのE2Eが通過していること

## 10. 障害発生時のQAアクション

- **どのレイヤで防げたかを分析する**
- **テスト追加だけでなく、設計や分離で防げなかったかを検討する**
- **同種障害を防ぐためのルール・原則修正を行う**

## 11. テストのベストプラクティス

### 10.1. 設計

- **正常系より異常系を先に考える**
- **具体例ではなく性質を検証する**

### 10.2. 安定性

- **時刻・乱数・外部依存を制御する**
- **条件待ちを用い、固定時間待ちは避ける**

### 10.3. アサーション

- **最小限で意味を検証する**
- **実装詳細に依存しない**

## 12. テスト実装ガイド（Angular/E2E）

### 12.1. Angularテストの設定

#### コンポーネントテスト（RouterLink含む）

```typescript
import { RouterTestingModule } from "@angular/router/testing";

TestBed.configureTestingModule({
  imports: [ComponentUnderTest, RouterTestingModule.withRoutes([])],
  providers: [{ provide: SomeService, useValue: mockService }],
});
```

#### HTTP テスト（Interceptor含む）

```typescript
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

TestBed.configureTestingModule({
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHttpClientTesting(),
  ],
});
```

#### サービステスト（HttpClient モック）

```typescript
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";

let httpMock: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [ServiceUnderTest],
  });
  httpMock = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  httpMock.verify(); // 未処理のリクエストがないことを確認
});
```

#### fakeAsync / tick の使い方

```typescript
import { fakeAsync, tick } from "@angular/core/testing";

it("非同期処理のテスト", fakeAsync(() => {
  component.doAsyncOperation();
  tick(); // 非同期処理を完了させる
  expect(component.result).toBe("expected");
}));
```

#### スパイの作成

```typescript
// メソッドスパイ
const serviceSpy = jasmine.createSpyObj("ServiceName", ["methodA", "methodB"]);
serviceSpy.methodA.and.returnValue(of(mockData));

// プロパティスパイ
const serviceSpy = jasmine.createSpyObj("ServiceName", [], {
  propertyA: "value",
});
```

### 12.2. E2Eテスト（Playwright）

本プロジェクトでは、E2EテストにPlaywrightを使用しています。

#### セットアップ

```bash
# 依存関係インストール
cd apps/web && npm install

# ブラウザインストール
npx playwright install chromium
```

#### テスト実行

```bash
# テスト実行
npm run e2e

# UIモードで実行（デバッグに便利）
npm run e2e:ui

# カバレッジ付きで実行
npm run e2e:coverage
```

#### テストファイル構成

```
apps/web/e2e/
├── playwright.config.ts   # 設定ファイル
└── tests/
    └── daily-report-input.spec.ts  # 日報入力のE2Eテスト
```

#### テストの書き方

```typescript
import { test, expect } from "@playwright/test";

test("日報を保存できること", async ({ page }) => {
  // ページ遷移
  await page.goto("/daily-reports/new");

  // フォーム入力
  await page.fill('textarea[formControlName="events"]', "今日のできごと");

  // ボタンクリック
  await page.click('button[type="submit"]');

  // アサーション
  await expect(page).toHaveURL("/daily-reports");
});
```

#### カバレッジについて

E2Eテストのカバレッジは `coverage/e2e/` に出力されます。
カバレッジは品質劣化の兆候を検知するための指標として利用します。

## 13. 開発フローでの関与

### 11.1. Phase 1: 設計フェーズ

- **テスト戦略の策定**: 機能の特性に応じて、適切なテストレイヤを選択する
- **テスト設計のレビュー**: Eng/Desが作成したテスト設計をレビューする

### 11.2. Phase 2: 実装フェーズ

- **テスト実装の支援**: 適切なテストレイヤでのテスト実装を支援する
- **テストの品質確認**: テストの設計が適切か確認する

### 11.3. Phase 3: 検証フェーズ

- **テストの実行確認**: すべてのテストが適切に実行されているか確認する
- **E2Eテスト追加後の単体実行確認**: E2Eテスト追加後、そのテストファイルを単体で実行し、正しくパスすることを確認する
- **カバレッジの計測**: カバレッジを計測し、品質劣化の兆候を検知する
- **カバレッジの監視**: カバレッジを品質劣化の兆候として監視する
- **E2Eテストの承認**: E2Eテストの追加が適切か承認する

#### E2Eテスト追加後の単体実行確認

E2Eテストを追加した後は、以下の手順でそのテストファイルを単体で実行し、正しくパスすることを確認する：

1. **単体実行の実施**

   ```bash
   # 新規追加したテストファイルのみ実行
   cd apps/web && npx cypress run --spec cypress/e2e/{feature_name}.cy.ts
   ```

2. **実行結果の確認**
   - テストが正しくパスすることを確認する
   - テストが失敗した場合は、実装の問題かテストの問題かを特定し、修正する

**重要**:

- **E2Eテストはpush時に全件実行されるため、実装時は新規追加したテストファイルのみを実行して確認すればよい**
- すべてのテストはpush時に自動実行され、失敗した場合はpushが中断される
- 単体実行でパスすることを確認した後、push時に全件実行されることを前提として進める

#### カバレッジ計測の手順

1. **カバレッジの実行**

   ```bash
   # フロントエンド（Angular）
   cd apps/web && npm run test:coverage

   # バックエンド（API）
   cd apps/api && npm run test:coverage
   ```

2. **カバレッジレポートの確認**
   - フロントエンド: `apps/web/coverage/index.html` をブラウザで開く
   - バックエンド: `apps/api/coverage/index.html` をブラウザで開く（設定されている場合）

3. **カバレッジレビューの実施**
   - カバレッジが品質劣化の兆候を検知するための指標として利用されているか確認
   - 数値を上げること自体を目的にテストを追加していないか確認
   - カバレッジ対象外として扱う場合は、理由と代替担保が明示されているか確認
   - テストの配置が最適か（可能な限り下位レイヤで担保されているか）確認

4. **カバレッジレビュー結果の記録**
   - `docs/features/{feature_name}/coverage_review.md` にレビュー結果を記録
   - カバレッジの監視結果、テストの配置、品質劣化の兆候の有無を記録

**重要**: カバレッジは品質劣化の兆候を検知するための指標として利用し、数値を上げること自体を目的にテストを追加してはならない。

### 11.4. Phase 4: 完了フェーズ

- **品質基準の最終確認**: すべての品質基準が満たされているか確認する
- **テスト戦略の振り返り**: テスト戦略が適切だったか振り返る

## 14. 他ロールとの連携

### 12.1. Engとの連携

- **テスト設計のレビュー**: Engが作成したテスト設計をレビューする
- **テスト実装の支援**: Unit/Integrationテストの実装を支援する

### 12.2. Desとの連携

- **UIテストの設計支援**: UIテストの設計を支援する
- **DOM/UIテストの適切な実装**: DOM構造ではなく、ユーザー体験を検証するテストを支援する

### 12.3. Driverとの連携

- **品質基準の監視**: Driverと協力して品質基準を監視する
- **フロー遵守の確認**: テスト戦略に沿ってテストが実装されているか確認する

## 15. 成果物

QAは以下の成果物を作成・管理する：

- **テスト戦略の記録**: 機能ごとのテスト戦略を記録する（必要に応じて `docs/features/{feature_name}/qa_strategy.md` に記録）
- **テスト設計レビュー結果**: テスト設計のレビュー結果を記録する（必要に応じて `docs/features/{feature_name}/qa_review.md` に記録）

## 16. 行動指針

### 14.1. テストは量ではなく配置

- **テストの数を増やすのではなく、適切なレイヤに配置する**
- **E2Eは最小、Unitは主戦場**

### 14.2. DOMを守るな、体験を守れ

- **DOM構造ではなく、ユーザー体験を検証する**
- **実装詳細に依存しないテストを設計する**

### 14.3. リスクベースのアプローチ

- **リスクが高い箇所に重点的にテストを配置する**
- **リスクが低い箇所は最小限のテストで十分**

### 14.4. 継続的な改善

- **障害発生時は、どのレイヤで防げたかを分析する**
- **テスト戦略を継続的に見直し、改善する**

## 17. 最終原則

- **テストは量ではなく配置**
- **E2Eは最小、Unitは主戦場**
- **DOMを守るな、体験を守れ**

---

**重要**: QAは、テストの数を増やすのではなく、適切なレイヤにテストを配置し、ユーザーが致命的な体験をする確率を継続的に下げることを目的とする。

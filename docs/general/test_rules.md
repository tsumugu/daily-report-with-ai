# ✅ テストルール（red-greenテスト駆動開発/TDD）

本プロジェクトでは、t-wada提唱のred-green テスト駆動開発を実践します。

## red-green TDD手順
1. **Red：失敗するテストを書く**
   - 実装前に必ず、意図通り動作するなら通るはずのテストを書く
   - テストが失敗（redになる）ことを確認する
2. **Green：実装を書く**
   - テストがpassする最小限の実装を書く
   - 書いた後、テストがGreen(passed)に変わるまで調整
3. **Refactor：リファクタ**
   - テストがGreenを維持している状態で、安心して改善・整理・最適化を行う

## 補足
- 小さな単位でRed/Green/Refactorサイクルを高速で回すことを意識
- テストが失敗しない状態で新規実装や変更は原則行わない
- 不明点や悩んだ場合はプロジェクト内で相談推奨

---

## よく使うテスト設定（Angular）

### コンポーネントテスト（RouterLink含む）

```typescript
import { RouterTestingModule } from '@angular/router/testing';

TestBed.configureTestingModule({
  imports: [ComponentUnderTest, RouterTestingModule.withRoutes([])],
  providers: [{ provide: SomeService, useValue: mockService }],
});
```

### HTTP テスト（Interceptor含む）

```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

TestBed.configureTestingModule({
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHttpClientTesting(),
  ],
});
```

### サービステスト（HttpClient モック）

```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

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

### fakeAsync / tick の使い方

```typescript
import { fakeAsync, tick } from '@angular/core/testing';

it('非同期処理のテスト', fakeAsync(() => {
  component.doAsyncOperation();
  tick(); // 非同期処理を完了させる
  expect(component.result).toBe('expected');
}));
```

### スパイの作成

```typescript
// メソッドスパイ
const serviceSpy = jasmine.createSpyObj('ServiceName', ['methodA', 'methodB']);
serviceSpy.methodA.and.returnValue(of(mockData));

// プロパティスパイ
const serviceSpy = jasmine.createSpyObj('ServiceName', [], { propertyA: 'value' });
```

---

## E2Eテスト（Playwright）

本プロジェクトでは、E2EテストにPlaywrightを使用しています。

### セットアップ

```bash
# 依存関係インストール
cd apps/web && npm install

# ブラウザインストール
npx playwright install chromium
```

### テスト実行

```bash
# テスト実行
npm run e2e

# UIモードで実行（デバッグに便利）
npm run e2e:ui

# カバレッジ付きで実行
npm run e2e:coverage
```

### テストファイル構成

```
apps/web/e2e/
├── playwright.config.ts   # 設定ファイル
└── tests/
    └── daily-report-input.spec.ts  # 日報入力のE2Eテスト
```

### テストの書き方

```typescript
import { test, expect } from '@playwright/test';

test('日報を保存できること', async ({ page }) => {
  // ページ遷移
  await page.goto('/daily-reports/new');

  // フォーム入力
  await page.fill('textarea[formControlName="events"]', '今日のできごと');

  // ボタンクリック
  await page.click('button[type="submit"]');

  // アサーション
  await expect(page).toHaveURL('/daily-reports');
});
```

### カバレッジについて

E2Eテストのカバレッジは `coverage/e2e/` に出力されます。
ユニットテストとE2Eテストの両方のカバレッジを合算して100%を目指します。

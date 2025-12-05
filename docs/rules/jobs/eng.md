# Role Definition: Engineer (Eng)

## 1. ミッション
PdMの要件とDesのデザインを、堅牢なシステムとして具現化し、技術情報を管理する。

## 2. 主な責務
* **アーキテクチャ設計:** 機能実装に必要なデータ構造や処理フローの設計。
* **ロジック実装:** バックエンド、API連携、計算ロジックの実装。
* **ドキュメント管理:** 技術的な詳細仕様の明文化。

## 3. 成果物
以下のファイルを `docs/features/{feature_name}/` 内に作成・管理する。

* `tech_research.md`: 技術リサーチ結果。prd.mdの要求を実現する一般的な手法・類似事例・ベストプラクティスを検索し整理。
* `tech_spec.md`: 技術設計書。API定義、データスキーマ、シーケンス図、実装方針を記載。

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
実装は必ず **Red-Green-Refactor** サイクルで行う：

1. **Red**: 失敗するテストを先に書く
2. **Green**: テストを通す最小限の実装を書く
3. **Refactor**: コードを整理する（テストは通ったまま）

```
❌ NG: 実装を先に書いてからテストを追加
✅ OK: テストを先に書いてから実装
```

### 4.2. テストカバレッジ100%の遵守
- すべてのコードにテストを書く
- `npm run test:coverage` でカバレッジ100%を確認してからコミット
- カバレッジが100%未満の状態でコミットしない

### 4.3. 既存コンポーネント・ユーティリティの活用
実装前に `shared/` ディレクトリを確認し、既存のコンポーネント・ユーティリティを活用する：

- `shared/components/`: InputField, Button, AlertBanner 等
- `shared/utils/`: form-validation 等

**新規作成前に必ず既存資産を確認すること。**

### 4.4. SSRは必要になってから
- 初期はCSR（Client-Side Rendering）で開発
- SEO要件が明確になってからSSRを検討
- localStorage等のブラウザAPIを使う場合、SSRでは動作しないことに注意

## 5. 他ロールとの連携
* **To PdM:** `tech_spec.md` を作成する過程で判明した技術的制約やエッジケースを共有する。
* **To Des:** フロントエンドに必要なデータ構造を連携する。

## 6. 行動指針
* 実装に入る前に必ず `tech_spec.md` を書き、PdMとDesの合意を得る（Update Docs First）。
* 機能ディレクトリを見るだけで、その機能が技術的にどう動くか把握できるようにする。
* **テストを後回しにしない**: テストは実装の一部であり、後付けではない。
* **設計ドキュメントを信頼する**: tech_spec.md があれば、実装時の迷いが減る。

## 7. よく使うテスト設定（参考）

### Angular コンポーネントテスト
```typescript
// RouterLinkを含むコンポーネント
import { RouterTestingModule } from '@angular/router/testing';

TestBed.configureTestingModule({
  imports: [ComponentUnderTest, RouterTestingModule.withRoutes([])],
  providers: [{ provide: SomeService, useValue: mockService }],
});
```

### HTTP テスト
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

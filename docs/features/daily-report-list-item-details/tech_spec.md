# 日報一覧リストアイテム情報拡張 技術設計書（Tech Spec）

**バージョン**: Phase 2 v2  
**作成日**: 2025-01-XX  
**作成者**: Eng  
**ステータス**: Approved  
**承認日**: 2025-01-XX  
**承認者**: Helper, PdM

---

## 1. 概要

日報一覧リストアイテム情報拡張機能の技術的な設計・実装方針を定義する。  
日報一覧APIのレスポンスを拡張し、よかったこと・改善点の件数とステータス概要を追加する。

---

## 2. データモデル

### 2.1 既存モデルの拡張

#### DailyReportListItem（日報一覧アイテム）拡張

既存の `DailyReportListItem` を拡張し、よかったこと・改善点の詳細情報を含める。

| フィールド         | 型                  | 必須 | 説明                               |
| :----------------- | :------------------ | :--- | :--------------------------------- |
| id                 | string (UUID)       | ○    | 一意識別子                         |
| date               | string (YYYY-MM-DD) | ○    | 日付                               |
| events             | string              | ○    | できごと                           |
| goodPointIds       | string[]            | ○    | よかったことIDリスト（既存）       |
| improvementIds     | string[]            | ○    | 改善点IDリスト（既存）             |
| goodPointSummary   | GoodPointSummary    | ○    | よかったことのサマリー（新規追加） |
| improvementSummary | ImprovementSummary  | ○    | 改善点のサマリー（新規追加）       |

#### GoodPointSummary（よかったことサマリー）

| フィールド             | 型     | 必須 | 説明                           |
| :--------------------- | :----- | :--- | :----------------------------- |
| count                  | number | ○    | よかったことの件数             |
| statusSummary          | object | ○    | ステータス別の件数             |
| statusSummary.再現成功 | number | ○    | ステータスが「再現成功」の件数 |
| statusSummary.定着     | number | ○    | ステータスが「定着」の件数     |

#### ImprovementSummary（改善点サマリー）

| フィールド           | 型     | 必須 | 説明                         |
| :------------------- | :----- | :--- | :--------------------------- |
| count                | number | ○    | 改善点の件数                 |
| statusSummary        | object | ○    | ステータス別の件数           |
| statusSummary.完了   | number | ○    | ステータスが「完了」の件数   |
| statusSummary.習慣化 | number | ○    | ステータスが「習慣化」の件数 |

**注意**: ステータス概要には、PRDで指定された「再現成功・定着」「完了・習慣化」のみを含める。その他のステータス（未着手、進行中、再現できず、未達成）は含めない。

---

## 3. API設計

### 3.1 日報一覧API拡張

#### GET /api/daily-reports（拡張）

自分の日報一覧を取得する（既存APIを拡張）。

**Query Parameters**

| パラメータ | 型     | 説明                                 |
| :--------- | :----- | :----------------------------------- |
| limit      | number | 取得件数（デフォルト30 ≒ 約1ヶ月分） |
| offset     | number | 取得開始位置（ページング用）         |

**Response（拡張後）**

```json
{
  "data": [
    {
      "id": "xxx",
      "date": "2025-12-04",
      "events": "...",
      "goodPointIds": ["id1", "id2"],
      "improvementIds": ["id3"],
      "goodPointSummary": {
        "count": 2,
        "statusSummary": {
          "再現成功": 1,
          "定着": 1
        }
      },
      "improvementSummary": {
        "count": 1,
        "statusSummary": {
          "完了": 1,
          "習慣化": 0
        }
      }
    }
  ],
  "total": 100
}
```

**ステータス概要の計算ロジック**:

- **よかったこと**:
  - `再現成功`: `status === '再現成功'` かつ `success_count < 3` の件数
  - `定着`: `status === '定着'` または (`status === '再現成功'` かつ `success_count >= 3`) の件数

- **改善点**:
  - `完了`: `status === '完了'` かつ `success_count < 3` の件数
  - `習慣化`: `status === '習慣化'` または (`status === '完了'` かつ `success_count >= 3`) の件数

**注意**: ステータス概要には、PRDで指定された「再現成功・定着」「完了・習慣化」のみを含める。その他のステータスはカウントしない。

**後方互換性**: 既存のクライアントコードとの互換性を保つため、`goodPointSummary` と `improvementSummary` は必須フィールドとする。既存のクライアントがこれらのフィールドを無視しても動作するようにする。

**エラーレスポンス**:

- 200 OK: 取得成功
- 401 Unauthorized: 未認証
- 500 Internal Server Error: サーバーエラー

---

## 4. 実装方針

### 4.1 バックエンド実装

#### 4.1.1 日報一覧API拡張

`apps/api/src/routes/daily-reports.routes.ts` の `toDailyReportListItem` 関数を拡張する。

```typescript
function toDailyReportListItem(report: DailyReport): DailyReportListItem {
  // よかったことの詳細情報を取得
  const goodPoints = report.goodPointIds
    .map((id) => goodPointsDb.findById(id))
    .filter((gp): gp is GoodPoint => gp !== undefined);

  // 改善点の詳細情報を取得
  const improvements = report.improvementIds
    .map((id) => improvementsDb.findById(id))
    .filter((imp): imp is Improvement => imp !== undefined);

  // よかったことのサマリーを計算
  const goodPointSummary = calculateGoodPointSummary(goodPoints);

  // 改善点のサマリーを計算
  const improvementSummary = calculateImprovementSummary(improvements);

  return {
    id: report.id,
    date: report.date,
    events: report.events,
    goodPointIds: report.goodPointIds,
    improvementIds: report.improvementIds,
    goodPointSummary,
    improvementSummary,
  };
}
```

#### 4.1.2 サマリー計算関数

```typescript
function calculateGoodPointSummary(goodPoints: GoodPoint[]): GoodPointSummary {
  const count = goodPoints.length;
  const statusSummary = {
    再現成功: 0,
    定着: 0,
  };

  goodPoints.forEach((gp) => {
    if (
      gp.status === "定着" ||
      (gp.status === "再現成功" && gp.success_count >= 3)
    ) {
      statusSummary.定着++;
    } else if (gp.status === "再現成功") {
      statusSummary.再現成功++;
    }
  });

  return {
    count,
    statusSummary,
  };
}

function calculateImprovementSummary(
  improvements: Improvement[],
): ImprovementSummary {
  const count = improvements.length;
  const statusSummary = {
    完了: 0,
    習慣化: 0,
  };

  improvements.forEach((imp) => {
    if (
      imp.status === "習慣化" ||
      (imp.status === "完了" && imp.success_count >= 3)
    ) {
      statusSummary.習慣化++;
    } else if (imp.status === "完了") {
      statusSummary.完了++;
    }
  });

  return {
    count,
    statusSummary,
  };
}
```

### 4.2 フロントエンド実装

#### 4.2.1 データモデル拡張

`apps/web/src/app/shared/components/report-card/report-card.component.ts` の `ReportCardData` インターフェースを拡張する。

```typescript
export interface GoodPointSummary {
  count: number;
  statusSummary: {
    再現成功: number;
    定着: number;
  };
}

export interface ImprovementSummary {
  count: number;
  statusSummary: {
    完了: number;
    習慣化: number;
  };
}

export interface ReportCardData {
  id: string;
  date: string;
  events: string;
  goodPointIds: string[];
  improvementIds: string[];
  goodPointSummary: GoodPointSummary;
  improvementSummary: ImprovementSummary;
}
```

#### 4.2.2 UI表示

`apps/web/src/app/shared/components/report-card/report-card.component.html` を拡張し、よかったこと・改善点の件数とステータス概要を表示する。

---

## 5. パフォーマンス最適化

### 5.1 データ取得の最適化

- **N+1問題の回避**: よかったこと・改善点の詳細情報を取得する際、`goodPointIds` と `improvementIds` を一括取得する
- **キャッシュの活用**: よかったこと・改善点の詳細情報は頻繁に変更されないため、必要に応じてキャッシュを活用する

### 5.2 レスポンスサイズの最適化

- **必要な情報のみ取得**: ステータス概要には、PRDで指定された「再現成功・定着」「完了・習慣化」のみを含める
- **データ量の最小化**: 一覧取得時のデータ量増加を最小限に抑える

### 5.3 パフォーマンス目標

- **一覧表示**: 1秒以内に表示されること（既存のパフォーマンスを維持）
- **APIレスポンス時間**: 500ms以内（既存のパフォーマンスを維持）

---

## 6. エラーハンドリング

| エラーケース                      | HTTPステータス | レスポンス                             |
| :-------------------------------- | :------------- | :------------------------------------- |
| 認証エラー                        | 401            | `{ "message": "認証が必要です" }`      |
| よかったこと/改善点が見つからない | 200            | `statusSummary` を空オブジェクトで返す |
| サーバーエラー                    | 500            | `{ "message": "サーバーエラー" }`      |

**注意**: よかったこと/改善点が見つからない場合（削除済みなど）は、エラーとせず、`statusSummary` を空オブジェクトで返す。既存の動作を維持する。

---

## 7. セキュリティ考慮事項

- **認証チェック**: 認証済みユーザーのみが自分の日報一覧を取得可能
- **データアクセス制御**: 他のユーザーの日報情報にアクセスできないことを保証
- **入力値検証**: クエリパラメータ（limit, offset）の検証を実施

---

## 8. テスト方針

### 8.1 ユニットテスト

- `toDailyReportListItem` 関数のテスト
- `calculateGoodPointSummary` 関数のテスト
- `calculateImprovementSummary` 関数のテスト

### 8.2 統合テスト

- 日報一覧APIのレスポンス拡張のテスト
- よかったこと・改善点の詳細情報が正しく含まれることのテスト
- ステータス概要が正しく計算されることのテスト

### 8.3 E2Eテスト

- 日報一覧画面でよかったこと・改善点の件数が表示されることのテスト
- ステータス概要が正しく表示されることのテスト

---

## 9. 後方互換性

### 9.1 既存クライアントとの互換性

- `goodPointSummary` と `improvementSummary` は必須フィールドとする
- 既存のクライアントがこれらのフィールドを無視しても動作するようにする
- 既存の `goodPointIds` と `improvementIds` は維持する

### 9.2 データ移行

- 既存のデータはそのまま動作する
- 新規フィールドは既存データにも適用される（計算により生成）

---

## 10. 関連ドキュメント

- PRD: `docs/features/daily-report-list-item-details/prd.md`
- UI Design: `docs/features/daily-report-list-item-details/ui_design.md`（作成予定）
- 日報一覧機能: `docs/features/daily-report-list/tech_spec.md`
- フォローアップ管理機能: `docs/features/followup-management/tech_spec.md`
- フォローアップ動作改善機能: `docs/features/followup-enhancement/tech_spec.md`

---

## 11. 実装チェックリスト

- [ ] バックエンド: `toDailyReportListItem` 関数の拡張
- [ ] バックエンド: `calculateGoodPointSummary` 関数の実装
- [ ] バックエンド: `calculateImprovementSummary` 関数の実装
- [ ] バックエンド: 日報一覧APIのレスポンス拡張
- [ ] バックエンド: ユニットテストの追加
- [ ] バックエンド: 統合テストの追加
- [ ] フロントエンド: `ReportCardData` インターフェースの拡張
- [ ] フロントエンド: UI表示の実装
- [ ] フロントエンド: コンポーネントテストの追加
- [ ] E2Eテストの追加
- [ ] パフォーマンステストの実施

---

_本Tech Specは Approved ステータスです。Helperレビュー・PdMレビュー完了。_

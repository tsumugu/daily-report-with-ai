# 実装開始前の最終確認

**機能名**: BL-03 日報と目標の関連付け機能
**確認日**: 2025-12-16
**ステータス**: Approved

---

## Phase 1 完了確認

Phase 1（設計フェーズ）で作成したすべてのドキュメントを確認し、実装準備が整っていることを確認します。

### ✅ 完了したドキュメント

- [x] **PRD** (`prd.md`) - Approved
  - 6つのユーザーストーリーを定義
  - 機能要件・非機能要件を明記
  - 制約事項とリスクを特定

- [x] **Tech Spec** (`tech_spec.md`) - Approved
  - データモデル設計（DailyReportGoal junction table）
  - API設計（POST/PUT /api/daily-reports, GET /api/goals/:id）
  - フロントエンド設計（新規コンポーネント定義）
  - N+1問題の解決策を実装
  - 最大10個の目標制限を実装

- [x] **Tech Spec - Helperレビュー** (`helper_review.md`)
  - 10個の改善提案を提示
  - すべてTech Specに反映済み

- [x] **Tech Spec - PdMレビュー** (`pdm_review.md`)
  - PRD要件との整合性を確認
  - Approved

- [x] **QA Strategy** (`qa_strategy.md`) - Approved
  - Unit/Integration/E2Eの3層テスト戦略
  - US-1とUS-2をE2Eテストでカバー
  - TDDアプローチを採用

- [x] **UI Design** (`ui_design.md`) - Approved
  - 4つの新規コンポーネント設計
  - アクセシビリティ対応（44px最小クリック領域）
  - 20文字での省略表示とツールチップ
  - 300msデバウンス実装

- [x] **UI Design - PdMレビュー** (`ui_design_pdm_review.md`)
  - PRD要件との整合性を確認
  - Approved

- [x] **UI Design - Helperレビュー** (`ui_design_helper_review.md`)
  - 8つの改善提案を提示
  - 優先度「高」の項目はUI Designに反映済み

- [x] **クロスレビュー** (`cross_review.md`) - Approved
  - Tech SpecとUI Designの整合性を確認
  - APIとUIのデータフロー確認
  - 齟齬なし

- [x] **プロトタイプ** (`mockups/daily-report-goal-link.html/css/js`)
  - 5つの画面状態を実装
  - インタラクティブな動作を確認可能
  - Human review: LGTM

---

## Phase 2 実装準備確認

### 実装対象の確認

Phase 2では、以下の順序で実装を進めます。

#### 1. Backend実装（TDD）

**データモデル**:

- [ ] `DailyReportGoal` エンティティ作成
- [ ] `DailyReportGoalRepository` 実装
  - `findByDailyReportIds()` メソッド（N+1対策）
  - `deleteByDailyReportId()` メソッド（カスケード削除）

**API実装**:

- [ ] `POST /api/daily-reports` に `goalIds` パラメータ追加
- [ ] `PUT /api/daily-reports/:id` に `goalIds` パラメータ追加
- [ ] `GET /api/daily-reports` レスポンスに `goals` フィールド追加
- [ ] `GET /api/daily-reports/:id` レスポンスに `goals` フィールド追加
- [ ] `GET /api/goals/:id` に関連日報取得機能追加
  - `limit`, `offset`, `sort` パラメータ対応

**バリデーション**:

- [ ] `goalIds` の最大10個制限
- [ ] 存在しない目標IDのチェック
- [ ] ユーザー所有の目標のみ関連付け可能

#### 2. Frontend実装（TDD）

**新規コンポーネント**:

- [ ] `GoalMultiSelectField` - 目標選択フィールド
- [ ] `GoalChip` - 目標チップ
- [ ] `RelatedDailyReportsList` - 関連日報リスト
- [ ] `DailyReportListItem` - 日報リストアイテム

**既存ページの修正**:

- [ ] 日報作成ページに目標選択フィールド追加
- [ ] 日報編集ページに目標選択フィールド追加
- [ ] 日報一覧ページに目標チップ表示
- [ ] 日報詳細ページに関連目標セクション追加
- [ ] 目標詳細ページに関連日報セクション追加

**Storybook**:

- [ ] 新規コンポーネントのストーリー作成

#### 3. E2Eテスト

- [ ] US-1: 日報作成時の目標関連付け
- [ ] US-2: 日報編集時の目標変更

---

## 実装時の注意事項

### 1. N+1問題対策

日報一覧取得時に、各日報の関連目標を個別に取得すると N+1 問題が発生します。

**対策**: `DailyReportGoalRepository.findByDailyReportIds()` を使用して、バッチで取得する

```typescript
const dailyReportIds = dailyReports.map((dr) => dr.id);
const goalsByReportId =
  await dailyReportGoalRepo.findByDailyReportIds(dailyReportIds);
```

### 2. カスケード削除

日報を削除する際、関連する `DailyReportGoal` レコードも削除する必要があります。

**対策**: `DailyReportGoalRepository.deleteByDailyReportId()` を使用

```typescript
await dailyReportGoalRepo.deleteByDailyReportId(dailyReportId);
await dailyReportRepo.delete(dailyReportId);
```

### 3. アクセシビリティ

- 目標チップの最小クリック領域: 44px × 44px
- キーボード操作対応（Enter、ESC）
- スクリーンリーダー対応（aria-label）

### 4. パフォーマンス

- 目標選択フィールドの検索に300msのデバウンスを実装
- 目標リストをキャッシュし、クライアント側でフィルタリング

### 5. UX

- 目標名が20文字を超える場合は省略表示し、ホバー時にツールチップで全文表示
- 最大10個の制限に達した場合、分かりやすいエラーメッセージを表示

---

## Phase 2 開始承認

Phase 1のすべてのドキュメントが完成し、レビューが完了しました。プロトタイプも承認されました。

実装準備が整っているため、**Phase 2（実装フェーズ）の開始を承認します**。

**承認日**: 2025-12-16
**承認者**: human

---

## 次のステップ

1. Backend実装開始（TDD Red-Green-Refactor）
2. Frontend実装開始（TDD Red-Green-Refactor）
3. E2Eテスト作成・実行
4. Phase 3（検証フェーズ）に進む

---

_Phase 1が完了し、Phase 2（実装）に進みます。_

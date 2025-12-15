# 目標階層管理機能 技術リサーチ

**バージョン**: v1  
**作成日**: 2025-12-13  
**作成者**: Eng  
**ステータス**: Approved

---

## 1. 概要

目標階層管理機能の実現方法について、一般的な手法・類似事例・ベストプラクティスを調査し、技術的な実装方針を検討する。

---

## 2. 要件の整理

### 2.1 主要要件

1. **目標の階層構造定義・管理**
   - 目標を階層的に定義・管理（2階層〜4階層程度）
   - 目標間の関係性（因果関係、依存関係）を明確に可視化
   - 目標の期間設定は柔軟に対応（半期、四半期、1ヶ月、1週間など）

2. **目標のCRUD操作**
   - 目標の作成・編集・削除
   - 下位目標の作成（上位目標から）
   - 目標の階層構造の一覧表示

3. **バリデーション**
   - 期間の整合性（下位目標の期間は上位目標の期間内に収まる）
   - 循環参照の防止
   - 階層の深さ制限（最大4階層）

4. **週次フォーカスとの接続**
   - 短期目標から週次フォーカスを設定可能
   - 週次フォーカスカードに紐づく短期目標を表示

---

## 3. 技術的検討事項

### 3.1 データモデル設計

#### 目標モデル（Goal）

**基本設計方針**: 階層構造を表現するために、`parentId` フィールドを使用する。

```typescript
interface Goal {
  id: string; // UUID
  userId: string;
  name: string; // 目標名（最大100文字）
  description: string | null; // 目標の説明（最大1000文字）
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  parentId: string | null; // 上位目標のID（最上位の場合はnull）
  goalType: "skill" | "project" | "habit" | "other" | null; // 目標の性質（将来の拡張用）
  successCriteria: string | null; // 達成基準（最大500文字）
  createdAt: string;
  updatedAt: string;
}
```

**階層構造の表現**:

- `parentId` が `null` の場合は最上位目標（長期目標）
- `parentId` が設定されている場合は下位目標（中期目標、短期目標）
- 階層の深さは `parentId` を辿ることで計算可能

**メリット**:

- シンプルなデータ構造で階層を表現できる
- 既存のデータベースパターンと整合性がある
- クエリが容易（親子関係の取得が簡単）

**デメリット**:

- 深い階層の取得時に複数回のクエリが必要になる可能性がある
- 循環参照の検証が必要

#### 週次フォーカスとの接続

**設計方針**: `WeeklyFocus` モデルに `goalId` フィールドを追加する。

```typescript
interface WeeklyFocus {
  id: string;
  userId: string;
  itemType: "goodPoint" | "improvement";
  itemId: string;
  goalId: string | null; // 短期目標のID（接続時）
  weekStartDate: string; // YYYY-MM-DD（月曜日）
  createdAt: string;
}
```

**メリット**:

- 既存の `WeeklyFocus` モデルを拡張するだけで対応可能
- 後方互換性を保てる（`goalId` は任意）

**デメリット**:

- 既存の `WeeklyFocus` モデルを変更する必要がある
- マイグレーションが必要

**代替案**: 別テーブルで接続を管理する方法も検討できるが、Phase 1では `WeeklyFocus` モデルを拡張する方針で進める。

### 3.2 階層構造の取得方法

#### 階層構造の取得API

**設計方針**: 階層構造を効率的に取得するために、以下の2つのアプローチを検討。

**アプローチ1: 再帰的取得（推奨）**

```typescript
// 1. 最上位目標を取得
const topLevelGoals = goals.filter((g) => g.parentId === null);

// 2. 各目標の下位目標を再帰的に取得
function getChildren(goalId: string): Goal[] {
  const children = goals.filter((g) => g.parentId === goalId);
  return children.map((child) => ({
    ...child,
    children: getChildren(child.id),
  }));
}
```

**メリット**:

- シンプルな実装
- インメモリDBでは十分に高速

**デメリット**:

- 深い階層の場合、複数回のクエリが必要

**アプローチ2: 一括取得（将来実装）**

```typescript
// すべての目標を一度に取得し、クライアント側で階層構造を構築
GET / api / goals / hierarchy;
```

**メリット**:

- 1回のクエリで階層構造を取得できる
- パフォーマンスが良い

**デメリット**:

- 目標数が増えた場合、レスポンスサイズが大きくなる

**結論**: Phase 1ではアプローチ1（再帰的取得）を採用。将来、目標数が増えた場合はアプローチ2を検討。

### 3.3 バリデーションロジック

#### 期間の整合性チェック

**実装方針**: 下位目標の期間が上位目標の期間内に収まることを確認する。

```typescript
function validatePeriod(goal: Goal, parentGoal: Goal | null): boolean {
  if (!parentGoal) {
    // 最上位目標の場合は期間の検証は不要
    return true;
  }

  const goalStart = new Date(goal.startDate);
  const goalEnd = new Date(goal.endDate);
  const parentStart = new Date(parentGoal.startDate);
  const parentEnd = new Date(parentGoal.endDate);

  return goalStart >= parentStart && goalEnd <= parentEnd;
}
```

#### 循環参照の防止

**実装方針**: 目標を上位目標に設定する際、循環参照が発生しないことを確認する。

```typescript
function validateCircularReference(
  goalId: string,
  newParentId: string | null,
): boolean {
  if (!newParentId) {
    // 最上位に設定する場合は問題なし
    return true;
  }

  // 新しい上位目標が、現在の目標の下位目標でないことを確認
  let currentId = newParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === goalId) {
      // 循環参照が発生
      return false;
    }

    if (visited.has(currentId)) {
      // 既に確認済みの場合は問題なし
      break;
    }

    visited.add(currentId);
    const goal = goals.find((g) => g.id === currentId);
    currentId = goal?.parentId || null;
  }

  return true;
}
```

### 3.4 API設計

#### 目標のCRUD API

**既存APIパターンの活用**: 既存の日報・フォローアップAPIのパターンを参考にする。

**エンドポイント設計**:

- `GET /api/goals` - 目標一覧取得（階層構造を含む）
- `GET /api/goals/:id` - 目標詳細取得
- `POST /api/goals` - 目標作成
- `PUT /api/goals/:id` - 目標更新
- `DELETE /api/goals/:id` - 目標削除
- `GET /api/goals/hierarchy` - 階層構造の取得（将来実装）

**認証・認可**: 既存の `authMiddleware` を活用し、ユーザーIDを確認する。

### 3.5 週次フォーカスとの接続

#### 接続方法

**設計方針**: `WeeklyFocus` モデルに `goalId` フィールドを追加し、短期目標と接続する。

**API設計**:

- `PUT /api/weekly-focuses/:id/goal` - 週次フォーカスと短期目標を接続
- `DELETE /api/weekly-focuses/:id/goal` - 週次フォーカスと短期目標の接続を解除

**バリデーション**:

- 接続する目標が短期目標（最下位階層）であることを確認
- 接続する目標がユーザーの所有物であることを確認

---

## 4. 既存実装との互換性

### 4.1 データ互換性

**既存の週次フォーカス機能**:

- `WeeklyFocus` モデルに `goalId` フィールドを追加（任意）
- 既存の週次フォーカスは `goalId` が `null` のまま動作
- 後方互換性を保つ

### 4.2 API互換性

**既存APIの維持**:

- 既存の週次フォーカスAPIは維持
- 新規API（目標管理、接続）を追加
- 既存のクライアントコードへの影響を最小限に抑える

---

## 5. パフォーマンス考慮事項

### 5.1 階層構造の取得

**現状**:

- インメモリDBを使用しているため、現時点ではパフォーマンス問題は発生しにくい
- 階層構造の取得は再帰的に行うが、目標数が少ない場合は問題なし

**将来の考慮事項**:

- DBに移行する場合は、インデックスを適切に設定する必要がある
- `parentId` と `userId` の複合インデックスを設定
- 階層構造の取得を最適化（一括取得APIの実装）

### 5.2 循環参照の検証

**実装方針**:

- 目標作成・更新時に循環参照を検証
- 検証処理は再帰的に行うが、階層の深さが最大4階層のため、パフォーマンス問題は発生しにくい

---

## 6. セキュリティ考慮事項

### 6.1 認証・認可

**既存の認証ミドルウェアを活用**:

- 既存の `authMiddleware` を活用
- 目標作成・更新・削除時は、ユーザーIDを確認
- 他のユーザーの目標にアクセスできないようにする

### 6.2 バリデーション

**入力値の検証**:

- 目標名: 必須、最大100文字
- 目標の説明: 任意、最大1000文字
- 達成基準: 任意、最大500文字
- 期間: 必須、開始日 <= 終了日
- 期間の整合性: 下位目標の期間は上位目標の期間内に収まる
- 循環参照の防止: 循環参照が発生しないことを確認

---

## 7. エラーハンドリング

### 7.1 エラーケース

**想定されるエラーケース**:

- 目標作成失敗（ネットワークエラー等）
- 目標更新失敗（存在しないID等）
- バリデーションエラー（期間未入力、期間の整合性エラー、循環参照エラー等）
- 目標削除失敗（下位目標が存在する場合等）

**エラーハンドリング方針**:

- 適切なHTTPステータスコードを返却
- エラーメッセージを明確に表示
- フロントエンド側でトースト通知を表示

---

## 8. テスト戦略

### 8.1 ユニットテスト

**テスト対象**:

- 期間の整合性チェックロジック
- 循環参照の防止ロジック
- 階層構造の取得ロジック
- バリデーション処理

### 8.2 統合テスト

**テスト対象**:

- 目標作成API
- 目標更新API
- 目標削除API
- 階層構造取得API
- 週次フォーカスとの接続API

### 8.3 E2Eテスト

**テスト対象**:

- 目標の作成フロー
- 目標の階層的ブレイクダウン
- 目標間の関係性の可視化
- 週次フォーカスと短期目標の接続

---

## 9. 実装優先順位

### Phase 1（MVP）

1. ✅ 目標モデルの定義
2. ✅ 目標のCRUD API
3. ✅ 階層構造の取得API
4. ✅ バリデーションロジック（期間の整合性、循環参照の防止）
5. ✅ 週次フォーカスとの接続（`WeeklyFocus` モデルの拡張）

### 将来実装（Phase 2以降）

- 階層構造の一括取得API（パフォーマンス最適化）
- 目標の性質に応じたブレイクダウン方法の詳細ガイド
- 目標の進捗状況可視化（BL-05で実装予定）

---

## 10. 参考資料

- 既存実装: `apps/api/src/models/daily-report.model.ts`
- 既存実装: `apps/api/src/db/weekly-focuses.db.ts`
- 既存実装: `apps/api/src/routes/weekly-focuses.routes.ts`
- PRD: `docs/features/goal-hierarchy-management/prd.md`
- Discovery成果物: `.discovery/archived/2025-12-13/`

---

_本技術リサーチは Approved ステータスです。tech_spec.md 作成の参考として使用します。_

# データ永続化機能 技術リサーチ

**バージョン**: v1  
**作成日**: 2025-12-17  
**作成者**: Eng  
**ステータス**: Draft

---

## 1. 概要

現在、BEサーバーを再起動するとデータが失われる問題がある。すべてのデータベースがインメモリ（Map）で実装されているため、サーバー再起動時にデータが消失する。

本リサーチでは、データ永続化の実現方法について、一般的な手法・類似事例・ベストプラクティスを調査し、技術的な実装方針を検討する。

---

## 2. 現状の課題

### 2.1 現在の実装

- **データベース**: すべてインメモリ（Map）で実装
  - `UsersDatabase`: Map<string, User>
  - `DailyReportsDatabase`: Map<string, DailyReport>
  - `GoalsDatabase`: Map<string, Goal>
  - `FollowupsDatabase`: Map<string, Followup>
  - `WeeklyFocusesDatabase`: Map<string, WeeklyFocus>
  - `DailyReportGoalsDatabase`: Map<string, DailyReportGoal>
  - `GoodPointsDatabase`: Map<string, GoodPoint>
  - `ImprovementsDatabase`: Map<string, Improvement>

- **問題点**:
  - BEサーバー再起動時にデータが消失
  - 開発中のデータが失われる
  - 本番環境では使用不可

### 2.2 要件

1. **データ永続化**: BE再起動後もデータが保持される
2. **開発環境対応**: 開発環境でも簡単に使用できる
3. **本番環境対応**: 将来的に本番環境でも使用可能
4. **既存コードへの影響**: 既存のデータベースクラスのインターフェースを維持
5. **パフォーマンス**: 現在のパフォーマンスを維持または向上

---

## 3. 技術的検討事項

### 3.1 選択肢の比較

#### 3.1.1 SQLite（better-sqlite3）

**概要**: ファイルベースのSQLデータベース。軽量で、サーバー不要。

**メリット**:

- ✅ ファイルベースで永続化が簡単
- ✅ SQLクエリが使用可能（JOIN、集計など）
- ✅ トランザクション対応
- ✅ 軽量で高速
- ✅ 開発環境・本番環境の両方で使用可能
- ✅ TypeScript対応が良好

**デメリット**:

- ❌ ネイティブモジュール（ビルドが必要）
- ❌ 同時書き込みが制限される（WALモードで改善可能）
- ❌ 大規模データには不向き

**実装の複雑度**: 中（既存のMapベースの実装をSQLに変換する必要がある）

**パフォーマンス**: 高（インデックス、クエリ最適化が可能）

**推奨度**: ⭐⭐⭐⭐⭐（開発環境・本番環境の両方で使用可能）

---

#### 3.1.2 JSONファイルベース（lowdb / node-json-db）

**概要**: JSONファイルにデータを保存するシンプルなデータベース。

**メリット**:

- ✅ 実装が簡単
- ✅ データが可読（JSON形式）
- ✅ サーバー不要
- ✅ 軽量

**デメリット**:

- ❌ 大規模データには不向き
- ❌ トランザクション非対応
- ❌ 同時書き込みが困難
- ❌ クエリ機能が限定的
- ❌ 本番環境には不向き

**実装の複雑度**: 低（既存のMapベースの実装をそのまま活用可能）

**パフォーマンス**: 低（全データをメモリに読み込む必要がある）

**推奨度**: ⭐⭐⭐（開発環境のみ）

---

#### 3.1.3 PostgreSQL

**概要**: 本番環境向けのリレーショナルデータベース。

**メリット**:

- ✅ 本番環境で標準的
- ✅ 高パフォーマンス
- ✅ トランザクション対応
- ✅ 同時アクセス対応
- ✅ スケーラブル

**デメリット**:

- ❌ サーバーが必要（開発環境のセットアップが複雑）
- ❌ 開発環境でのセットアップが重い
- ❌ Docker等のインフラが必要

**実装の複雑度**: 高（既存のMapベースの実装を大幅に変更する必要がある）

**パフォーマンス**: 高（本番環境向け）

**推奨度**: ⭐⭐⭐⭐（本番環境向け、開発環境では過剰）

---

#### 3.1.4 MongoDB / Firestore

**概要**: NoSQLデータベース。

**メリット**:

- ✅ スキーマレス
- ✅ スケーラブル
- ✅ クラウドサービスとして利用可能

**デメリット**:

- ❌ サーバーが必要
- ❌ 開発環境でのセットアップが複雑
- ❌ 既存のリレーショナルなデータ構造には不向き

**実装の複雑度**: 高

**パフォーマンス**: 中〜高

**推奨度**: ⭐⭐（既存のデータ構造には不向き）

---

### 3.2 推奨アプローチ

#### 段階的な移行戦略

**Phase 1: 開発環境の永続化（即座に実装）**

- **技術**: SQLite（better-sqlite3）
- **理由**:
  - 開発環境でデータが失われる問題を即座に解決
  - ファイルベースで簡単にセットアップ可能
  - 既存のデータ構造をそのまま移行可能

**Phase 2: 本番環境への移行（将来）**

- **技術**: PostgreSQL
- **理由**:
  - 本番環境で標準的
  - 高パフォーマンス・スケーラビリティ
  - SQLiteから移行が比較的容易（SQL互換性）

---

## 4. 実装方針

### 4.1 SQLite（better-sqlite3）の採用

**決定理由**:

1. **開発環境の即座の改善**: データ永続化を簡単に実現
2. **本番環境への移行容易性**: SQL互換性により、将来的にPostgreSQLへの移行が容易
3. **既存コードへの影響最小化**: データベースクラスのインターフェースを維持可能
4. **パフォーマンス**: 現在のインメモリ実装と同等以上のパフォーマンス

### 4.2 実装アプローチ

#### 4.2.1 アーキテクチャ

```
既存のデータベースクラス（インターフェース維持）
    ↓
SQLiteアダプター層（実装をSQLiteに置き換え）
    ↓
better-sqlite3（SQLiteライブラリ）
    ↓
SQLiteファイル（データ永続化）
```

#### 4.2.2 データベーススキーマ設計

**テーブル設計**:

- `users`: ユーザー情報
- `daily_reports`: 日報情報
- `goals`: 目標情報
- `followups`: フォローアップ情報
- `weekly_focuses`: 週次フォーカス情報
- `daily_report_goals`: 日報と目標の関連付け
- `good_points`: よかったこと
- `improvements`: 改善点

**主キー**: UUID（既存のIDをそのまま使用）

**インデックス**:

- `users.email`（ユニーク）
- `daily_reports.user_id`, `daily_reports.date`
- `goals.user_id`, `goals.parent_id`
- `followups.user_id`, `followups.item_type`, `followups.item_id`
- `weekly_focuses.user_id`, `weekly_focuses.week_start_date`
- `daily_report_goals.daily_report_id`, `daily_report_goals.goal_id`

#### 4.2.3 移行戦略

1. **既存のデータベースクラスのインターフェースを維持**
   - `save()`, `findById()`, `findAllByUserId()` などのメソッドを維持
   - 実装のみをSQLiteに置き換え

2. **段階的な移行**
   - 1つのデータベースクラスから順次移行
   - テストを追加して動作確認

3. **データマイグレーション**
   - 初回起動時にテーブルを作成
   - 既存データの移行は不要（開発環境のため）

---

## 5. 技術スタック

### 5.1 使用ライブラリ

- **better-sqlite3**: SQLiteライブラリ
  - バージョン: 最新版（9.x系）
  - 理由: TypeScript対応、同期API、高速

### 5.2 依存関係

```json
{
  "dependencies": {
    "better-sqlite3": "^9.x.x"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.x.x"
  }
}
```

---

## 6. 実装の詳細

### 6.1 データベース初期化

```typescript
import Database from "better-sqlite3";
import { join } from "path";

const dbPath =
  process.env.DB_PATH || join(process.cwd(), "data", "daily-report.db");
const db = new Database(dbPath);

// テーブル作成
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  
  -- 他のテーブルも同様に作成
`);
```

### 6.2 データベースクラスの実装例

```typescript
export class UsersDatabase {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  save(user: User): User {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      user.id,
      user.email,
      user.passwordHash,
      user.createdAt,
      user.updatedAt,
    );
    return user;
  }

  findById(id: string): User | undefined {
    const stmt = this.db.prepare("SELECT * FROM users WHERE id = ?");
    const row = stmt.get(id) as any;
    return row ? this.mapRowToUser(row) : undefined;
  }

  findByEmail(email: string): User | undefined {
    const stmt = this.db.prepare("SELECT * FROM users WHERE email = ?");
    const row = stmt.get(email) as any;
    return row ? this.mapRowToUser(row) : undefined;
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

### 6.3 トランザクション対応

```typescript
// 複数の操作をトランザクションで実行
const transaction = db.transaction((users: User[]) => {
  for (const user of users) {
    usersDb.save(user);
  }
});

transaction(users);
```

---

## 7. パフォーマンス考慮事項

### 7.1 インデックス

- 頻繁に検索されるカラムにインデックスを設定
- `user_id`, `date`, `parent_id` など

### 7.2 クエリ最適化

- JOINを使用してN+1問題を回避
- 必要なカラムのみをSELECT

### 7.3 WALモード

- Write-Ahead Loggingモードを有効化
- 同時書き込みのパフォーマンス向上

```typescript
db.pragma("journal_mode = WAL");
```

---

## 8. テスト戦略

### 8.1 ユニットテスト

- 各データベースクラスのメソッドをテスト
- インメモリSQLiteデータベースを使用

### 8.2 統合テスト

- 実際のSQLiteファイルを使用
- テスト後にデータをクリーンアップ

### 8.3 パフォーマンステスト

- 大量データでのパフォーマンスを測定
- 既存のインメモリ実装と比較

---

## 9. リスクと対策

### 9.1 リスク

1. **SQLiteファイルの破損**
   - 対策: 定期的なバックアップ、WALモードの使用

2. **同時書き込みの制限**
   - 対策: WALモードの有効化、リトライロジック

3. **ネイティブモジュールのビルド問題**
   - 対策: Docker環境でのビルド、CI/CDでの確認

### 9.2 対策

- データベースファイルのバックアップ機能
- エラーハンドリングとリトライロジック
- ログ出力による問題の追跡

---

## 10. 次のステップ

1. **Tech Spec作成**: 詳細な実装仕様を作成
2. **プロトタイプ実装**: 1つのデータベースクラスで実装を検証
3. **段階的な移行**: 各データベースクラスを順次移行
4. **テスト追加**: ユニットテスト・統合テストを追加
5. **ドキュメント更新**: 開発者向けドキュメントを更新

---

## 11. 参考資料

- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQLite WAL Mode](https://www.sqlite.org/wal.html)

---

**ステータス**: Approved  
**実装開始日**: 2025-12-17

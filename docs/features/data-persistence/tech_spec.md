# データ永続化機能 技術設計書（Tech Spec）

**バージョン**: v1  
**作成日**: 2025-12-17  
**作成者**: Eng  
**ステータス**: Draft  
**判断材料**: `pdm_decision_materials.md` を参照

---

## 1. 概要

現在、すべてのデータベースがインメモリ（Map）で実装されており、BEサーバー再起動時にデータが消失する問題がある。  
本設計書では、SQLite（better-sqlite3）を使用してデータ永続化を実現する技術的な設計・実装方針を定義する。

**目的**:

- BE再起動後もデータが保持される
- 開発環境でのデータ永続化を即座に実現
- 将来的にPostgreSQL等への移行が容易

---

## 2. アーキテクチャ

### 2.1 全体アーキテクチャ

```
既存のデータベースクラス（インターフェース維持）
    ↓
SQLiteアダプター層（実装をSQLiteに置き換え）
    ↓
better-sqlite3（SQLiteライブラリ）
    ↓
SQLiteファイル（データ永続化）
```

### 2.2 データベース初期化

**ファイルパス**: `apps/api/data/daily-report.db`（デフォルト）  
**環境変数**: `DB_PATH` でパスを指定可能

**初期化処理**:

1. SQLiteデータベースファイルの作成（存在しない場合）
2. WALモードの有効化（同時書き込みのパフォーマンス向上）
3. テーブル作成（存在しない場合）
4. インデックス作成（存在しない場合）

---

## 3. データベーススキーマ設計

### 3.1 テーブル一覧

| テーブル名           | 説明                 | 主キー |
| :------------------- | :------------------- | :----- |
| `users`              | ユーザー情報         | `id`   |
| `daily_reports`      | 日報情報             | `id`   |
| `goals`              | 目標情報             | `id`   |
| `followups`          | フォローアップ情報   | `id`   |
| `weekly_focuses`     | 週次フォーカス情報   | `id`   |
| `daily_report_goals` | 日報と目標の関連付け | `id`   |
| `good_points`        | よかったこと         | `id`   |
| `improvements`       | 改善点               | `id`   |

### 3.2 テーブル定義

#### 3.2.1 users

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

#### 3.2.2 daily_reports

```sql
CREATE TABLE IF NOT EXISTS daily_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  events TEXT NOT NULL,
  learnings TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_reports_user_date ON daily_reports(user_id, date);
```

#### 3.2.3 goals

```sql
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  parent_id TEXT,
  goal_type TEXT,
  success_criteria TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES goals(id)
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_parent_id ON goals(parent_id);
```

#### 3.2.4 followups

```sql
CREATE TABLE IF NOT EXISTS followups (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_followups_user_id ON followups(user_id);
CREATE INDEX IF NOT EXISTS idx_followups_item ON followups(item_type, item_id);
```

#### 3.2.5 weekly_focuses

```sql
CREATE TABLE IF NOT EXISTS weekly_focuses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  goal_id TEXT,
  week_start_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (goal_id) REFERENCES goals(id)
);

CREATE INDEX IF NOT EXISTS idx_weekly_focuses_user_id ON weekly_focuses(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_focuses_week ON weekly_focuses(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_focuses_goal_id ON weekly_focuses(goal_id);
```

#### 3.2.6 daily_report_goals

```sql
CREATE TABLE IF NOT EXISTS daily_report_goals (
  id TEXT PRIMARY KEY,
  daily_report_id TEXT NOT NULL,
  goal_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (daily_report_id) REFERENCES daily_reports(id) ON DELETE CASCADE,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_daily_report_goals_daily_report_id ON daily_report_goals(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_daily_report_goals_goal_id ON daily_report_goals(goal_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_report_goals_unique ON daily_report_goals(daily_report_id, goal_id);
```

#### 3.2.7 good_points

```sql
CREATE TABLE IF NOT EXISTS good_points (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  daily_report_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (daily_report_id) REFERENCES daily_reports(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_good_points_user_id ON good_points(user_id);
CREATE INDEX IF NOT EXISTS idx_good_points_daily_report_id ON good_points(daily_report_id);
```

#### 3.2.8 improvements

```sql
CREATE TABLE IF NOT EXISTS improvements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  daily_report_id TEXT NOT NULL,
  content TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (daily_report_id) REFERENCES daily_reports(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_improvements_user_id ON improvements(user_id);
CREATE INDEX IF NOT EXISTS idx_improvements_daily_report_id ON improvements(daily_report_id);
```

---

## 4. データベースクラスの実装

### 4.1 実装方針

1. **インターフェースの維持**: 既存のデータベースクラスのインターフェース（メソッドシグネチャ）を維持
2. **段階的な移行**: 1つのデータベースクラスから順次移行
3. **テストの追加**: 各データベースクラスのテストを追加

### 4.2 データベースインスタンスの管理

**シングルトンパターン**: SQLiteデータベースインスタンスをシングルトンで管理

```typescript
// apps/api/src/db/database.ts
import Database from "better-sqlite3";
import { join } from "path";
import { mkdirSync } from "fs";

let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    const dbPath =
      process.env.DB_PATH || join(process.cwd(), "data", "daily-report.db");

    // ディレクトリが存在しない場合は作成
    const dbDir = join(dbPath, "..");
    mkdirSync(dbDir, { recursive: true });

    dbInstance = new Database(dbPath);

    // WALモードを有効化
    dbInstance.pragma("journal_mode = WAL");

    // テーブル作成
    initializeTables(dbInstance);
  }

  return dbInstance;
}

function initializeTables(db: Database): void {
  // テーブル作成SQLを実行
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (...);
    CREATE TABLE IF NOT EXISTS daily_reports (...);
    -- 他のテーブルも同様に作成
  `);
}
```

### 4.3 UsersDatabaseの実装例

```typescript
// apps/api/src/db/users.db.ts
import { User } from "../models/user.model.js";
import { getDatabase } from "./database.js";

export class UsersDatabase {
  private db = getDatabase();

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

  existsByEmail(email: string): boolean {
    const stmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE email = ?",
    );
    const row = stmt.get(email) as any;
    return row.count > 0;
  }

  findAll(): User[] {
    const stmt = this.db.prepare("SELECT * FROM users");
    const rows = stmt.all() as any[];
    return rows.map((row) => this.mapRowToUser(row));
  }

  clear(): void {
    this.db.prepare("DELETE FROM users").run();
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

// シングルトンインスタンス
export const usersDb = new UsersDatabase();
```

### 4.4 その他のデータベースクラス

他のデータベースクラス（`DailyReportsDatabase`, `GoalsDatabase`, `FollowupsDatabase`等）も同様のパターンで実装する。

**実装のポイント**:

- 既存のインターフェースを維持
- SQLクエリを使用してデータを取得・保存
- 行データをモデルオブジェクトにマッピング
- トランザクションを使用して複数の操作をまとめて実行

---

## 5. 移行戦略

### 5.1 段階的な移行

1. **Phase 1**: `UsersDatabase` を移行
2. **Phase 2**: `DailyReportsDatabase`, `GoodPointsDatabase`, `ImprovementsDatabase` を移行
3. **Phase 3**: `GoalsDatabase`, `FollowupsDatabase`, `WeeklyFocusesDatabase` を移行
4. **Phase 4**: `DailyReportGoalsDatabase` を移行

### 5.2 移行手順

1. **新しい実装の追加**: 既存のファイルを `*.db.ts.old` にリネームし、新しい実装を追加
2. **テストの実行**: 既存のテストがすべてパスすることを確認
3. **動作確認**: 実際のAPIエンドポイントで動作確認
4. **旧実装の削除**: 動作確認後、旧実装を削除

### 5.3 データマイグレーション

**初回起動時**: テーブルが存在しない場合は自動的に作成される  
**既存データの移行**: 開発環境のため、既存データの移行は不要（新規データベースファイルを使用）

---

## 6. パフォーマンス考慮事項

### 6.1 インデックス

- 頻繁に検索されるカラムにインデックスを設定
- `user_id`, `date`, `parent_id` など

### 6.2 クエリ最適化

- JOINを使用してN+1問題を回避
- 必要なカラムのみをSELECT
- バッチ処理で複数のデータを一度に取得

### 6.3 WALモード

- Write-Ahead Loggingモードを有効化
- 同時書き込みのパフォーマンス向上

---

## 7. エラーハンドリング

### 7.1 データベースエラー

- SQLiteエラーを適切にキャッチ
- エラーメッセージをログに出力
- ユーザーに分かりやすいエラーメッセージを返す

### 7.2 トランザクションエラー

- トランザクション内でエラーが発生した場合、自動的にロールバック
- エラーログを出力

---

## 8. テスト戦略

### 8.1 ユニットテスト

- 各データベースクラスのメソッドをテスト
- インメモリSQLiteデータベースを使用（`:memory:`）

```typescript
describe("UsersDatabase", () => {
  let db: Database;
  let usersDb: UsersDatabase;

  beforeEach(() => {
    db = new Database(":memory:");
    initializeTables(db);
    usersDb = new UsersDatabase(db);
  });

  afterEach(() => {
    db.close();
  });

  it("should save and find user", () => {
    const user = createTestUser();
    usersDb.save(user);
    const found = usersDb.findById(user.id);
    expect(found).toEqual(user);
  });
});
```

### 8.2 統合テスト

- 実際のSQLiteファイルを使用
- テスト後にデータをクリーンアップ

### 8.3 パフォーマンステスト

- 大量データでのパフォーマンスを測定
- 既存のインメモリ実装と比較

---

## 9. 依存関係

### 9.1 追加する依存関係

```json
{
  "dependencies": {
    "better-sqlite3": "^9.6.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.11"
  }
}
```

### 9.2 インストール

```bash
cd apps/api
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

---

## 10. 環境変数

### 10.1 DB_PATH

**説明**: SQLiteデータベースファイルのパス  
**デフォルト**: `apps/api/data/daily-report.db`  
**例**: `DB_PATH=/path/to/database.db`

**⚠️ デプロイ時の注意事項**:

- デプロイ時にデータが失われないよう、**永続化されたストレージ**に保存することを推奨
- コンテナベースのデプロイの場合、**ボリュームマウント**を使用する
- 詳細は [デプロイガイド](./deployment_guide.md) を参照

### 10.2 .gitignore

データベースファイルを `.gitignore` に追加:

```
apps/api/data/*.db
apps/api/data/*.db-wal
apps/api/data/*.db-shm
```

---

## 11. リスクと対策

### 11.1 リスク

1. **SQLiteファイルの破損**
   - 対策: 定期的なバックアップ、WALモードの使用

2. **同時書き込みの制限**
   - 対策: WALモードの有効化、リトライロジック

3. **ネイティブモジュールのビルド問題**
   - 対策: Docker環境でのビルド、CI/CDでの確認

### 11.2 対策

- データベースファイルのバックアップ機能
- エラーハンドリングとリトライロジック
- ログ出力による問題の追跡

---

## 12. 次のステップ

1. **依存関係の追加**: `better-sqlite3` をインストール
2. **データベース初期化モジュールの作成**: `apps/api/src/db/database.ts` を作成
3. **UsersDatabaseの移行**: 最初のデータベースクラスを移行
4. **テストの追加**: ユニットテスト・統合テストを追加
5. **段階的な移行**: 他のデータベースクラスを順次移行

---

## 13. 参考資料

- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
- [PdM判断材料](./pdm_decision_materials.md)

---

**ステータス**: Approved  
**実装開始日**: 2025-12-17  
**次回レビュー予定**: 実装完了後

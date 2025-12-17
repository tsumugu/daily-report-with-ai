import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';

let dbInstance: DatabaseType | null = null;

/**
 * SQLiteデータベースインスタンスを取得（シングルトン）
 */
export function getDatabase(): DatabaseType {
  if (!dbInstance) {
    const dbPath = process.env.DB_PATH || join(process.cwd(), 'data', 'daily-report.db');
    
    // ディレクトリが存在しない場合は作成
    const dbDir = join(dbPath, '..');
    mkdirSync(dbDir, { recursive: true });
    
    dbInstance = new Database(dbPath);
    
    // WALモードを有効化（同時書き込みのパフォーマンス向上）
    dbInstance.pragma('journal_mode = WAL');
    
    // 外部キー制約を有効化
    dbInstance.pragma('foreign_keys = ON');
    
    // テーブル作成
    initializeTables(dbInstance);
  }
  
  return dbInstance;
}

/**
 * データベーステーブルを初期化
 * テスト用にエクスポート
 */
export function initializeTables(db: DatabaseType): void {
  db.exec(`
    -- usersテーブル
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    
    -- daily_reportsテーブル
    CREATE TABLE IF NOT EXISTS daily_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      events TEXT NOT NULL,
      learnings TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_daily_reports_user_id ON daily_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_reports_user_date ON daily_reports(user_id, date);
    
    -- goalsテーブル
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
    
    -- followupsテーブル
    CREATE TABLE IF NOT EXISTS followups (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      status TEXT NOT NULL,
      memo TEXT,
      date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_followups_user_id ON followups(user_id);
    CREATE INDEX IF NOT EXISTS idx_followups_item ON followups(item_type, item_id);
    
    -- weekly_focusesテーブル
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
    
    -- daily_report_goalsテーブル
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
    
    -- good_pointsテーブル
    CREATE TABLE IF NOT EXISTS good_points (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      daily_report_id TEXT NOT NULL,
      content TEXT NOT NULL,
      factors TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT '未着手',
      success_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (daily_report_id) REFERENCES daily_reports(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_good_points_user_id ON good_points(user_id);
    CREATE INDEX IF NOT EXISTS idx_good_points_daily_report_id ON good_points(daily_report_id);
    
    -- improvementsテーブル
    CREATE TABLE IF NOT EXISTS improvements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      daily_report_id TEXT NOT NULL,
      content TEXT NOT NULL,
      action TEXT,
      status TEXT NOT NULL DEFAULT '未着手',
      success_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (daily_report_id) REFERENCES daily_reports(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_improvements_user_id ON improvements(user_id);
    CREATE INDEX IF NOT EXISTS idx_improvements_daily_report_id ON improvements(daily_report_id);
  `);
}


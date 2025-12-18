import { Storage } from "@google-cloud/storage";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import Database, { type Database as DatabaseType } from "better-sqlite3";
import { initializeTables } from "./database.js";

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || "daily-report-db";
const DB_FILE_NAME = "daily-report.db";
const TEMP_DB_PATH = join("/tmp", DB_FILE_NAME);
const GCS_DB_PATH = DB_FILE_NAME;

let storage: Storage | null = null;
let dbInstance: DatabaseType | null = null;
let dbInstancePromise: Promise<DatabaseType> | null = null; // 初期化の重複防止
let signalHandlersRegistered = false; // シグナルハンドラーの重複登録防止
let periodicSyncStarted = false; // 定期的な同期の重複開始防止
let periodicSyncTimer: NodeJS.Timeout | null = null; // 定期的な同期のタイマーID

// 変更検知とバッチアップロードの統合
let hasChanges = false;
let changeCount = 0;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "10", 10);
// 最後の同期時刻（ミリ秒）
let lastSyncTime: number | null = null;
// 時間ベースの同期間隔（ミリ秒、デフォルト30秒）
const SYNC_INTERVAL_MS = parseInt(process.env.SYNC_INTERVAL_MS || "30000", 10);

/**
 * データベースに変更があったことをマーク
 */
export function markAsChanged(): void {
  hasChanges = true;
}

/**
 * データベースに変更があるかどうかを確認
 */
export function hasDatabaseChanges(): boolean {
  return hasChanges;
}

/**
 * 変更フラグをクリア
 */
export function clearChanges(): void {
  hasChanges = false;
  changeCount = 0;
  lastSyncTime = Date.now();
}

/**
 * Cloud Storageクライアントを初期化
 */
function initializeStorage(): Storage {
  if (!storage) {
    storage = new Storage();
  }
  return storage;
}

/**
 * データベースファイルをCloud Storageからダウンロード
 */
async function downloadDatabase(): Promise<void> {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const storageClient = initializeStorage();
      const bucket = storageClient.bucket(BUCKET_NAME);
      const file = bucket.file(GCS_DB_PATH);

      // ファイルの存在確認
      const [exists] = await file.exists();
      if (!exists) {
        console.log(
          "Database file does not exist in Cloud Storage. Creating new database.",
        );
        return; // 新しいデータベースファイルを作成
      }

      // ダウンロード
      const [contents] = await file.download();
      writeFileSync(TEMP_DB_PATH, contents);
      console.log("Database downloaded from Cloud Storage successfully.");

      return;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        console.error("Failed to download database after retries:", error);
        throw error;
      }
      console.log(`Retrying download (attempt ${retries}/${maxRetries})...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
    }
  }
}

/**
 * データベースファイルをCloud Storageにアップロード
 */
async function uploadDatabase(): Promise<void> {
  try {
    if (!existsSync(TEMP_DB_PATH)) {
      console.warn("Database file does not exist locally. Skipping upload.");
      return;
    }

    const storageClient = initializeStorage();
    const bucket = storageClient.bucket(BUCKET_NAME);
    const file = bucket.file(GCS_DB_PATH);

    // メインデータベースファイルのアップロード
    const dbContents = readFileSync(TEMP_DB_PATH);
    await file.save(dbContents, {
      contentType: "application/x-sqlite3",
      metadata: {
        cacheControl: "no-cache",
      },
    });

    console.log("Database uploaded to Cloud Storage successfully.");

    // WALファイルとSHMファイルのアップロード（存在する場合）
    const walPath = `${TEMP_DB_PATH}-wal`;
    const shmPath = `${TEMP_DB_PATH}-shm`;

    if (existsSync(walPath)) {
      const walContents = readFileSync(walPath);
      const walFile = bucket.file(`${GCS_DB_PATH}-wal`);
      await walFile.save(walContents, {
        contentType: "application/octet-stream",
        metadata: {
          cacheControl: "no-cache",
        },
      });
      console.log("WAL file uploaded to Cloud Storage successfully.");
    }

    if (existsSync(shmPath)) {
      const shmContents = readFileSync(shmPath);
      const shmFile = bucket.file(`${GCS_DB_PATH}-shm`);
      await shmFile.save(shmContents, {
        contentType: "application/octet-stream",
        metadata: {
          cacheControl: "no-cache",
        },
      });
      console.log("SHM file uploaded to Cloud Storage successfully.");
    }
  } catch (error) {
    console.error("Failed to upload database to Cloud Storage:", error);
    throw error;
  }
}

/**
 * データベースを同期（アップロード）
 */
async function syncDatabase(): Promise<void> {
  try {
    await uploadDatabase();
    clearChanges();
  } catch (error) {
    console.error("Failed to sync database:", error);
    throw error;
  }
}

/**
 * 変更検知とバッチアップロードの統合
 * バッチサイズに達した場合、または一定時間経過した場合は即座に同期
 */
export async function syncIfNeeded(): Promise<void> {
  if (!hasChanges) {
    return;
  }

  changeCount++;
  const now = Date.now();
  const shouldSyncByTime = lastSyncTime !== null && (now - lastSyncTime) >= SYNC_INTERVAL_MS;

  // バッチサイズに達した場合、または一定時間経過した場合は即座に同期
  if (changeCount >= BATCH_SIZE || shouldSyncByTime) {
    await syncDatabase();
    changeCount = 0;
  }
}

/**
 * 定期的な同期（終了時などに使用）
 */
export async function syncDatabasePeriodically(): Promise<void> {
  if (hasChanges) {
    await syncDatabase();
  }
}

/**
 * Cloud Storageを使用してデータベースインスタンスを取得
 * database.tsと同じパターンで、非同期初期化の重複を防止
 */
export async function getDatabase(): Promise<DatabaseType> {
  if (!dbInstancePromise) {
    dbInstancePromise = initializeDatabase();
  }
  return await dbInstancePromise;
}

/**
 * データベースを初期化（非同期、1回のみ実行）
 */
async function initializeDatabase(): Promise<DatabaseType> {
  // Cloud Storageからダウンロード
  await downloadDatabase();

  // データベースインスタンスを作成
  dbInstance = new Database(TEMP_DB_PATH);

  // WALモードを有効化
  dbInstance.pragma("journal_mode = WAL");

  // 外部キー制約を有効化
  dbInstance.pragma("foreign_keys = ON");

  // テーブル初期化
  initializeTables(dbInstance);

  // シグナルハンドラーの登録（1回のみ）
  if (!signalHandlersRegistered) {
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received. Syncing database...");
      await syncDatabasePeriodically();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("SIGINT received. Syncing database...");
      await syncDatabasePeriodically();
      process.exit(0);
    });

    signalHandlersRegistered = true;
  }

  // 定期的な同期を開始（時間ベース、1回のみ）
  // これにより、BATCH_SIZEに達していなくても定期的に同期される
  if (!periodicSyncStarted) {
    // 既存のタイマーがあればクリア（念のため）
    if (periodicSyncTimer) {
      clearInterval(periodicSyncTimer);
    }

    periodicSyncTimer = setInterval(async () => {
      if (hasChanges) {
        console.log("Periodic sync triggered. Syncing database...");
        await syncDatabasePeriodically();
      }
    }, SYNC_INTERVAL_MS);

    // 初期化時にlastSyncTimeを設定
    if (lastSyncTime === null) {
      lastSyncTime = Date.now();
    }

    periodicSyncStarted = true;
  }

  return dbInstance;
}


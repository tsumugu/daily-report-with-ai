import { Storage } from "@google-cloud/storage";
import { readFileSync, existsSync, writeFileSync, statSync } from "fs";
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
 * SQLiteの最小ファイルサイズ（空のDBのサイズ）
 * SQLiteの最小ページサイズは通常4096 bytes
 */
const MIN_DB_SIZE = 4096;

/**
 * データベースファイルをCloud Storageからダウンロード
 * @returns ダウンロードに成功した場合はtrue、新規作成の場合はfalse
 */
async function downloadDatabase(): Promise<boolean> {
  const maxRetries = 3;
  let retries = 0;

  console.log(`[DB] Attempting to download database from bucket: ${BUCKET_NAME}`);

  while (retries < maxRetries) {
    try {
      const storageClient = initializeStorage();
      const bucket = storageClient.bucket(BUCKET_NAME);
      const file = bucket.file(GCS_DB_PATH);

      // ファイルの存在確認
      const [exists] = await file.exists();
      if (!exists) {
        console.log(
          "[DB] Database file does not exist in Cloud Storage. Creating new database.",
        );
        return false; // 新しいデータベースファイルを作成
      }

      // Cloud Storageのファイルメタデータを取得してサイズを確認
      const [metadata] = await file.getMetadata();
      const gcsFileSize = parseInt(String(metadata.size || "0"), 10);

      // ローカルのファイルが存在する場合、サイズを比較
      let localFileSize = 0;
      if (existsSync(TEMP_DB_PATH)) {
        const localStats = statSync(TEMP_DB_PATH);
        localFileSize = localStats.size;
      }

      // Cloud Storageのファイルが空（最小サイズ以下）の場合はダウンロードしない
      if (gcsFileSize <= MIN_DB_SIZE) {
        console.log(
          `[DB] Cloud Storage database file is empty or too small (${gcsFileSize} bytes). ` +
          `Skipping download to prevent overwriting local data.`
        );
        // ローカルのファイルが存在する場合はそれを使用
        if (existsSync(TEMP_DB_PATH)) {
          console.log(`[DB] Using existing local database file (${localFileSize} bytes).`);
          return true; // ローカルのファイルを使用
        }
        return false; // 新規作成
      }

      // Cloud Storageのファイルがローカルのファイルより小さい場合はダウンロードしない
      if (localFileSize > 0 && gcsFileSize < localFileSize) {
        console.log(
          `[DB] Cloud Storage database file (${gcsFileSize} bytes) is smaller than local file (${localFileSize} bytes). ` +
          `Skipping download to prevent data loss.`
        );
        return true; // ローカルのファイルを使用
      }

      // ダウンロード
      const [contents] = await file.download();
      writeFileSync(TEMP_DB_PATH, contents);
      console.log(`[DB] Database downloaded from Cloud Storage successfully. Size: ${contents.length} bytes`);

      return true; // ダウンロード成功
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
  return false;
}

/**
 * データベースが空かどうかを確認
 */
function isDatabaseEmpty(db: DatabaseType): boolean {
  try {
    // usersテーブルにデータが存在するか確認
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    return userCount.count === 0;
  } catch (_error) {
    // テーブルが存在しない場合も空とみなす
    return true;
  }
}

/**
 * データベースファイルをCloud Storageにアップロード
 */
async function uploadDatabase(): Promise<void> {
  try {
    console.log("[DB] Starting upload process...");
    
    if (!existsSync(TEMP_DB_PATH)) {
      console.warn("[DB] Database file does not exist locally. Skipping upload.");
      return;
    }

    // ファイルサイズを確認（WALマージ前）
    const localStats = statSync(TEMP_DB_PATH);
    const localFileSize = localStats.size;
    console.log(`[DB] Database file size before WAL merge: ${localFileSize} bytes`);

    // WALファイルの存在を確認
    const walPath = `${TEMP_DB_PATH}-wal`;
    const walExists = existsSync(walPath);
    
    // WALファイルが存在しない場合、メインファイルの内容を確認
    // WALファイルが存在する場合は、checkpoint後に再確認する
    if (!walExists) {
      // ファイルサイズが最小サイズ以下の場合、空DBと判断
      if (localFileSize <= MIN_DB_SIZE) {
        console.log(
          `[DB] Database file is too small (${localFileSize} bytes) and no WAL file exists. ` +
          `Skipping upload to prevent overwriting existing data with empty database.`
        );
        return;
      }
      
      // データベースが空の場合もアップロードしない
      if (dbInstance && isDatabaseEmpty(dbInstance)) {
        console.log("[DB] Database is empty and no WAL file exists. Skipping upload to prevent overwriting existing data.");
        return;
      }
    }

    const storageClient = initializeStorage();
    const bucket = storageClient.bucket(BUCKET_NAME);
    const file = bucket.file(GCS_DB_PATH);

    // Cloud Storageの既存ファイルサイズを確認
    let existingFileSize = 0;
    try {
      const [exists] = await file.exists();
      if (exists) {
        const [metadata] = await file.getMetadata();
        existingFileSize = parseInt(String(metadata.size || "0"), 10);
      }
    } catch (error) {
      // メタデータ取得に失敗しても続行
      console.warn("[DB] Failed to get existing file metadata:", error);
    }

    // WALファイルが存在しない場合のみ、マージ前のサイズで比較
    // WALファイルが存在する場合は、マージ後に比較する
    if (!walExists && existingFileSize > 0 && localFileSize < existingFileSize) {
      console.log(
        `[DB] Local database file (${localFileSize} bytes) is smaller than Cloud Storage file (${existingFileSize} bytes). ` +
        `Skipping upload to prevent data loss.`
      );
      return;
    }

    // WALファイルをマージしてからアップロード（データの整合性を保証）
    if (dbInstance && walExists) {
      try {
        console.log("[DB] WAL file exists. Merging WAL file into main database before upload...");
        
        // WALファイルのサイズを確認
        const walStats = statSync(walPath);
        console.log(`[DB] WAL file size: ${walStats.size} bytes`);
        
        // WALファイルの内容をメインファイルにマージ
        // better-sqlite3では、pragmaの戻り値は配列またはオブジェクトになる可能性がある
        const checkpointResult = dbInstance.pragma("wal_checkpoint(FULL)", { simple: true });
        console.log(`[DB] WAL checkpoint result:`, checkpointResult);
        
        // checkpointの結果を確認（戻り値の形式に応じて処理）
        let checkpointSuccess = false;
        if (typeof checkpointResult === 'number') {
          if (checkpointResult === 0) {
            console.log("[DB] WAL checkpoint completed successfully.");
            checkpointSuccess = true;
          } else if (checkpointResult === 1) {
            console.log("[DB] WAL checkpoint completed, but some frames may still be in WAL.");
            checkpointSuccess = true;
          } else {
            console.warn("[DB] WAL checkpoint returned error code:", checkpointResult);
          }
        } else if (checkpointResult && typeof checkpointResult === 'object') {
          // オブジェクト形式の戻り値の場合
          const result = checkpointResult as { busy?: number; log?: number; checkpointed?: number };
          console.log(`[DB] WAL checkpoint details:`, result);
          checkpointSuccess = true;
        }
        
        // データベースを明示的に同期して、変更をディスクに書き込む
        if (checkpointSuccess) {
          dbInstance.pragma("synchronous = FULL");
          // ファイルシステムの同期を待つため、少し待機
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error("[DB] Failed to checkpoint WAL file:", error);
        // checkpointに失敗しても続行
      }
    } else if (!walExists) {
      console.log("[DB] No WAL file found. Skipping checkpoint (data is already in main database).");
    }

    // WALマージ後のファイルサイズを再取得（マージによりファイルサイズが変わる可能性がある）
    const updatedStats = statSync(TEMP_DB_PATH);
    const updatedFileSize = updatedStats.size;
    console.log(`[DB] Database file size after WAL merge: ${updatedFileSize} bytes (was ${localFileSize} bytes)`);
    
    // WALファイルが存在した場合、マージ後のサイズが増加しているか確認
    if (walExists && updatedFileSize === localFileSize) {
      console.warn(
        `[DB] WARNING: File size did not change after WAL checkpoint. ` +
        `WAL file may not have been merged properly. ` +
        `Proceeding with upload anyway.`
      );
    }

    // マージ後のファイルサイズで空DBチェック（ファイルサイズベース）
    if (updatedFileSize <= MIN_DB_SIZE) {
      console.log(
        `[DB] Database file is too small after WAL merge (${updatedFileSize} bytes). ` +
        `Skipping upload to prevent overwriting existing data with empty database.`
      );
      return;
    }

    // マージ後のデータベース内容で空DBチェック（データベース内容ベース）
    if (dbInstance && isDatabaseEmpty(dbInstance)) {
      console.log("[DB] Database is empty after WAL merge. Skipping upload to prevent overwriting existing data.");
      return;
    }

    // マージ後のファイルサイズでCloud Storageとの比較を再実行
    if (existingFileSize > 0 && updatedFileSize < existingFileSize) {
      console.log(
        `[DB] Local database file after WAL merge (${updatedFileSize} bytes) is smaller than Cloud Storage file (${existingFileSize} bytes). ` +
        `Skipping upload to prevent data loss.`
      );
      return;
    }

    // メインデータベースファイルのアップロード（WALファイルはマージ済み）
    const dbContents = readFileSync(TEMP_DB_PATH);
    console.log(`[DB] Uploading database to Cloud Storage. Size: ${dbContents.length} bytes`);
    await file.save(dbContents, {
      contentType: "application/x-sqlite3",
      metadata: {
        cacheControl: "no-cache",
      },
    });

    console.log("[DB] Database uploaded to Cloud Storage successfully.");

    // WALファイルとSHMファイルはマージ済みのため、アップロード不要
    // 既存のWALファイルとSHMファイルをCloud Storageから削除（存在する場合）
    const walFile = bucket.file(`${GCS_DB_PATH}-wal`);
    const shmFile = bucket.file(`${GCS_DB_PATH}-shm`);
    
    try {
      const [walFileExists] = await walFile.exists();
      if (walFileExists) {
        await walFile.delete();
        console.log("[DB] Removed old WAL file from Cloud Storage (merged into main database).");
      }
    } catch (error) {
      console.warn("[DB] Failed to delete old WAL file from Cloud Storage:", error);
    }

    try {
      const [shmFileExists] = await shmFile.exists();
      if (shmFileExists) {
        await shmFile.delete();
        console.log("[DB] Removed old SHM file from Cloud Storage (no longer needed).");
      }
    } catch (error) {
      console.warn("[DB] Failed to delete old SHM file from Cloud Storage:", error);
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

  console.log(
    `[DB] Sync check: changeCount=${changeCount}/${BATCH_SIZE}, ` +
    `timeSinceLastSync=${lastSyncTime ? now - lastSyncTime : 'N/A'}ms/${SYNC_INTERVAL_MS}ms, ` +
    `shouldSync=${changeCount >= BATCH_SIZE || shouldSyncByTime}`
  );

  // バッチサイズに達した場合、または一定時間経過した場合は即座に同期
  if (changeCount >= BATCH_SIZE || shouldSyncByTime) {
    console.log(`[DB] Triggering sync: changeCount=${changeCount}, shouldSyncByTime=${shouldSyncByTime}`);
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
  const downloaded = await downloadDatabase();

  // データベースインスタンスを作成
  dbInstance = new Database(TEMP_DB_PATH);

  // WALモードを有効化
  dbInstance.pragma("journal_mode = WAL");

  // 外部キー制約を有効化
  dbInstance.pragma("foreign_keys = ON");

  // テーブル初期化
  initializeTables(dbInstance);

  // ダウンロードしたDBが空の場合、警告を出力
  if (downloaded && isDatabaseEmpty(dbInstance)) {
    console.warn(
      "[DB] WARNING: Downloaded database appears to be empty. " +
      "If this is unexpected, check Cloud Storage bucket for existing database file."
    );
  }

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


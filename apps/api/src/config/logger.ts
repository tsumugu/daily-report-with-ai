/**
 * ログ出力を制御するユーティリティ
 * 環境変数 ENABLE_DB_SYNC_LOGS でDBダウンロード・アップロード関連のログを制御
 */

// DBダウンロード・アップロード関連のログを有効にするかどうか
// デフォルトは false（ログを出力しない）
const ENABLE_DB_SYNC_LOGS = process.env.ENABLE_DB_SYNC_LOGS === 'true';

/**
 * DBダウンロード・アップロード関連のログを出力
 * @param message ログメッセージ
 * @param data 追加データ（オプション）
 */
export function dbLog(message: string, data?: unknown): void {
  if (ENABLE_DB_SYNC_LOGS) {
    if (data !== undefined) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
}

/**
 * DBダウンロード・アップロード関連の警告ログを出力
 * @param message ログメッセージ
 * @param error エラーオブジェクト（オプション）
 */
export function dbWarn(message: string, error?: unknown): void {
  if (ENABLE_DB_SYNC_LOGS) {
    if (error !== undefined) {
      console.warn(message, error);
    } else {
      console.warn(message);
    }
  }
}

/**
 * DBダウンロード・アップロード関連のエラーログを出力
 * エラーは常に出力する
 * @param message ログメッセージ
 * @param error エラーオブジェクト（オプション）
 */
export function dbError(message: string, error?: unknown): void {
  if (ENABLE_DB_SYNC_LOGS) {
    console.error(message, error);
  } else {
    // エラーの場合は簡潔に出力（詳細は出力しない）
    console.error(message);
  }
}


/**
 * 開発環境（Development）用の環境変数
 * `ng serve` または `ng build` で使用
 * 
 * 注意: 開発環境ではプロキシ設定（proxy.conf.json）を使用するため、
 * apiUrlは相対パス（/api）を指定します。
 */
export const environment = {
  production: false,
  apiUrl: '/api', // プロキシ設定により http://localhost:3000/api に転送される
  appName: 'Daily Report (Dev)',
};


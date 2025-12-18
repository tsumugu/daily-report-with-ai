/**
 * 本番環境（Production）用の環境変数
 * `ng build --configuration=production` で使用
 *
 * 注意: このファイルはビルド時に scripts/set-env.js によって自動生成されます
 * API_URLはGitHub Actionsのシークレットから設定されます
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com/api', // ビルド時に置換されます
  appName: 'Daily Report',
};


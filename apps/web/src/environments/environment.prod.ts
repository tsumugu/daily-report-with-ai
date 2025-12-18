/**
 * 本番環境（Production）用の環境変数
 * `ng build --configuration=production` で使用
 * API_URLはGitHub Actionsのシークレットから設定されます
 */
export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || 'https://api.example.com/api',
  appName: 'Daily Report',
};


/* eslint-disable */
/**
 * ビルド時に環境変数を設定するスクリプト
 * GitHub Actionsから渡されたAPI_URLを environment.prod.ts に注入します
 */
const fs = require('fs');
const path = require('path');

// 環境変数から API_URL を取得（デフォルト値を設定）
const apiUrl = process.env.API_URL || 'https://api.example.com/api';

console.log('🔧 環境変数を設定中...');
console.log(`   API_URL: ${apiUrl}`);

// environment.prod.ts のパス
const envProdPath = path.join(__dirname, '../src/environments/environment.prod.ts');

// environment.prod.ts の内容を生成
const envProdContent = `/**
 * 本番環境（Production）用の環境変数
 * \`ng build --configuration=production\` で使用
 * このファイルはビルド時に自動生成されます
 */
export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  appName: 'Daily Report',
};
`;

// ファイルに書き込み
fs.writeFileSync(envProdPath, envProdContent, 'utf8');

console.log('✅ 環境変数の設定が完了しました');

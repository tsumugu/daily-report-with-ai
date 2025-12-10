#!/usr/bin/env node
/* eslint-env node */
/* global console, process */

/**
 * テストカバレッジが100%であることを確認するスクリプト
 * 
 * karma.conf.cjsのcheck設定により、カバレッジが100%未満の場合は
 * テスト実行が自動的に失敗するため、このスクリプトはテストを実行するだけです。
 * 
 * カバレッジが100%未満の場合、プロセスを終了してpushを中断します。
 */

import { execSync } from 'child_process';

console.log('📊 テストカバレッジをチェック中...');
console.log('  カバレッジが100%未満の場合、pushは中断されます。\n');

try {
  // test:ciコマンドを実行（karma.conf.cjsのcheck設定により100%未満なら自動的に失敗）
  execSync('npm run test:ci -w @daily-report/web', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log('\n✅ カバレッジ100%を確認しました！\n');
  process.exit(0);
} catch (error) {
  console.error('\n❌ カバレッジチェックが失敗しました。');
  
  // テストが失敗した場合
  if (error.status !== undefined && error.status !== 0) {
    console.error('\n⚠️  カバレッジが100%未満のため、pushを中断します。');
    console.error('   テストを追加してカバレッジを100%にしてください。');
    console.error('   詳細は上記のカバレッジレポートを確認してください。\n');
  } else {
    console.error('   予期しないエラーが発生しました。');
    console.error(`   エラー: ${error.message}\n`);
  }
  
  process.exit(1);
}


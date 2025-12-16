#!/usr/bin/env node
/* eslint-env node */
/* global console, process */

/**
 * テストカバレッジが閾値（80%）以上であることを確認するスクリプト
 * 
 * karma.conf.cjsのcheck設定により、カバレッジが閾値未満の場合は
 * テスト実行が自動的に失敗するため、このスクリプトはテストを実行するだけです。
 * 
 * カバレッジが閾値未満の場合、プロセスを終了してpushを中断します。
 * 
 * 注意: カバレッジは品質劣化の兆候を検知するための指標として利用します。
 * 数値を上げること自体を目的にテストを追加することは避けてください。
 */

import { execSync } from 'child_process';

const COVERAGE_THRESHOLD = 80;

console.log('📊 テストカバレッジをチェック中...');
console.log(`  カバレッジが${COVERAGE_THRESHOLD}%未満の場合、pushは中断されます。`);
console.log('  カバレッジは品質劣化の兆候を検知するための指標として利用します。\n');

try {
  // test:ciコマンドを実行（karma.conf.cjsのcheck設定により閾値未満なら自動的に失敗）
  execSync('npm run test:ci -w @daily-report/web', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log(`\n✅ カバレッジ${COVERAGE_THRESHOLD}%以上を確認しました！\n`);
  process.exit(0);
} catch (error) {
  console.error('\n❌ カバレッジチェックが失敗しました。');
  
  // テストが失敗した場合
  if (error.status !== undefined && error.status !== 0) {
    console.error(`\n⚠️  カバレッジが${COVERAGE_THRESHOLD}%未満のため、pushを中断します。`);
    console.error('   カバレッジは品質劣化の兆候を検知するための指標として利用します。');
    console.error('   数値を上げること自体を目的にテストを追加することは避けてください。');
    console.error('   詳細は上記のカバレッジレポートを確認してください。\n');
  } else {
    console.error('   予期しないエラーが発生しました。');
    console.error(`   エラー: ${error.message}\n`);
  }
  
  process.exit(1);
}


import { test as base, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// カバレッジ出力ディレクトリ
const coverageDir = path.join(__dirname, '../../coverage/e2e');

// カバレッジ収集用のテストフィクスチャ
export const test = base.extend({
  // 各テストでカバレッジを収集
  page: async ({ page }, use) => {
    // カバレッジ収集を開始
    await page.coverage.startJSCoverage();

    // テスト実行
    await use(page);

    // カバレッジを収集
    const coverage = await page.coverage.stopJSCoverage();

    // カバレッジをファイルに保存
    if (!fs.existsSync(coverageDir)) {
      fs.mkdirSync(coverageDir, { recursive: true });
    }

    // Angular/Webpackのバンドルされたコードのカバレッジを保存
    const relevantCoverage = coverage.filter((entry) => {
      // localhost:4200 のファイルのみ
      return entry.url.includes('localhost:4200') && !entry.url.includes('node_modules');
    });

    if (relevantCoverage.length > 0) {
      const coverageFile = path.join(coverageDir, `coverage-${uuidv4()}.json`);
      fs.writeFileSync(coverageFile, JSON.stringify(relevantCoverage, null, 2));
    }
  },
});

export { expect };


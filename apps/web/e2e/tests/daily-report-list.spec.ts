import { test, expect } from '../fixtures/coverage';
import * as crypto from 'crypto';

test.describe('日報一覧・詳細画面', () => {
  // テスト用のパスワード（共通）
  const testPassword = 'TestPassword123!';
  let uniqueEmail: string;

  test.beforeEach(async ({ page }) => {
    // 各テストで一意のメールアドレスを生成
    uniqueEmail = `e2e-list-${crypto.randomUUID()}@example.com`;

    // サインアップしてログイン状態にする
    await page.goto('/signup');

    // ページが読み込まれるまで待機
    await page.waitForSelector('input#email');

    // フォーム入力
    await page.fill('input#email', uniqueEmail);
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);

    // サブミットボタンをクリック
    await page.click('button[type="submit"]');

    // ホーム画面に遷移するまで待機
    await page.waitForURL('/', { timeout: 15000 });
  });

  test('ホーム画面から日報一覧画面に遷移できること', async ({ page }) => {
    // 日報一覧リンクをクリック
    await page.click('a[href="/daily-reports"]');

    // 日報一覧画面に遷移したことを確認
    await expect(page).toHaveURL('/daily-reports');
    await expect(page.locator('.page-title')).toContainText('日報一覧');
  });

  test('日報がない場合は空状態が表示されること', async ({ page }) => {
    await page.goto('/daily-reports');

    // 空状態が表示されることを確認
    await expect(page.locator('.empty-container')).toBeVisible();
    await expect(page.locator('.empty-container h2')).toContainText('まだ日報がありません');
  });

  test('日報を作成後、一覧に表示されること', async ({ page }) => {
    // 日報を作成
    await page.goto('/daily-reports/new');
    await page.waitForSelector('textarea#events');
    await page.fill('textarea#events', 'E2Eテストで作成した日報です');
    await page.click('button[type="submit"]');
    await page.waitForURL('/daily-reports', { timeout: 15000 });

    // 一覧画面に日報が表示されていることを確認
    await expect(page.locator('.report-card')).toBeVisible();
    await expect(page.locator('.report-card__content')).toContainText('E2Eテストで作成した日報です');
  });

  test('日報カードをクリックすると詳細画面に遷移すること', async ({ page }) => {
    // 日報を作成
    await page.goto('/daily-reports/new');
    await page.waitForSelector('textarea#events');
    await page.fill('textarea#events', '詳細確認用の日報');
    await page.fill('textarea#learnings', 'テストの学び');
    await page.click('button[type="submit"]');
    await page.waitForURL('/daily-reports', { timeout: 15000 });

    // 日報カードをクリック
    await page.click('.report-card');

    // 詳細画面に遷移したことを確認
    await expect(page).toHaveURL(/\/daily-reports\/[a-z0-9-]+/);
    await expect(page.locator('.report-detail')).toBeVisible();
  });

  test('詳細画面で日報の内容が表示されること', async ({ page }) => {
    // 日報を作成
    await page.goto('/daily-reports/new');
    await page.waitForSelector('textarea#events');
    await page.fill('textarea#events', '詳細表示テストのできごと');
    await page.fill('textarea#learnings', '詳細表示テストの学び');

    // よかったことを追加
    await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
    await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
    const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
    await goodPointCard.locator('textarea').first().fill('良いテストを書けた');
    await goodPointCard.locator('textarea').last().fill('集中できたから');

    // 改善点を追加
    await page.click('.form-group:has-text("改善点") button:has-text("追加")');
    await page.waitForSelector('.form-group:has-text("改善点") .form-card');
    const improvementCard = page.locator('.form-group:has-text("改善点") .form-card').first();
    await improvementCard.locator('textarea').first().fill('もっとテストを書く');
    await improvementCard.locator('textarea').last().fill('毎日コツコツやる');

    await page.click('button[type="submit"]');
    await page.waitForURL('/daily-reports', { timeout: 15000 });

    // 詳細画面に遷移
    await page.click('.report-card');
    await page.waitForSelector('.report-detail');

    // 内容が表示されていることを確認
    await expect(page.locator('.content-text').first()).toContainText('詳細表示テストのできごと');

    // よかったことが表示されていることを確認
    await expect(page.locator('.section:has-text("よかったこと") .item-card')).toBeVisible();
    await expect(page.locator('.section:has-text("よかったこと") .item-content')).toContainText(
      '良いテストを書けた'
    );

    // 改善点が表示されていることを確認
    await expect(page.locator('.section:has-text("改善点") .item-card')).toBeVisible();
    await expect(page.locator('.section:has-text("改善点") .item-content')).toContainText(
      'もっとテストを書く'
    );
  });

  test('詳細画面から一覧画面に戻れること', async ({ page }) => {
    // 日報を作成
    await page.goto('/daily-reports/new');
    await page.waitForSelector('textarea#events');
    await page.fill('textarea#events', '戻るボタンテスト');
    await page.click('button[type="submit"]');
    await page.waitForURL('/daily-reports', { timeout: 15000 });

    // 詳細画面に遷移
    await page.click('.report-card');
    await page.waitForSelector('.back-button');

    // 戻るボタンをクリック
    await page.click('.back-button');

    // 一覧画面に戻ったことを確認
    await expect(page).toHaveURL('/daily-reports');
  });

  test('一覧画面から日報入力画面に遷移できること', async ({ page }) => {
    await page.goto('/daily-reports');

    // 日報を書くボタンをクリック
    await page.click('.new-report-button');

    // 日報入力画面に遷移したことを確認
    await expect(page).toHaveURL('/daily-reports/new');
  });

  test('よかったことがある日報にはバッジが表示されること', async ({ page }) => {
    // よかったこと付きの日報を作成
    await page.goto('/daily-reports/new');
    await page.waitForSelector('textarea#events');
    await page.fill('textarea#events', 'バッジテスト用日報');

    // よかったことを追加
    await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
    await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
    const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
    await goodPointCard.locator('textarea').first().fill('よかったこと');

    await page.click('button[type="submit"]');
    await page.waitForURL('/daily-reports', { timeout: 15000 });

    // よかったことバッジが表示されていることを確認
    await expect(page.locator('.report-card__badge--good')).toBeVisible();
    await expect(page.locator('.report-card__badge--good')).toContainText('✨');
  });

  test('改善点がある日報にはバッジが表示されること', async ({ page }) => {
    // 改善点付きの日報を作成
    await page.goto('/daily-reports/new');
    await page.waitForSelector('textarea#events');
    await page.fill('textarea#events', '改善点バッジテスト');

    // 改善点を追加
    await page.click('.form-group:has-text("改善点") button:has-text("追加")');
    await page.waitForSelector('.form-group:has-text("改善点") .form-card');
    const improvementCard = page.locator('.form-group:has-text("改善点") .form-card').first();
    await improvementCard.locator('textarea').first().fill('改善点');

    await page.click('button[type="submit"]');
    await page.waitForURL('/daily-reports', { timeout: 15000 });

    // 改善点バッジが表示されていることを確認
    await expect(page.locator('.report-card__badge--improvement')).toBeVisible();
    await expect(page.locator('.report-card__badge--improvement')).toContainText('📝');
  });
});


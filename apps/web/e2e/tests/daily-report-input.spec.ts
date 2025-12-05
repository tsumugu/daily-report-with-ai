import { test, expect } from '../fixtures/coverage';

test.describe('日報入力画面', () => {
  // テスト用のユーザー情報
  const testUser = {
    email: `e2e-test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };

  test.beforeEach(async ({ page }) => {
    // サインアップしてログイン状態にする
    await page.goto('/signup');
    await page.fill('input[formControlName="email"]', testUser.email);
    await page.fill('input[formControlName="password"]', testUser.password);
    await page.fill('input[formControlName="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');

    // ホーム画面に遷移するまで待機
    await page.waitForURL('/');
  });

  test('ホーム画面から日報入力画面に遷移できること', async ({ page }) => {
    // 日報入力リンクをクリック
    await page.click('a[href="/daily-reports/new"]');

    // 日報入力画面に遷移したことを確認
    await expect(page).toHaveURL('/daily-reports/new');
    await expect(page.locator('h1')).toContainText('日報を書く');
  });

  test('日報を入力して保存できること', async ({ page }) => {
    await page.goto('/daily-reports/new');

    // フォームに入力
    await page.fill('textarea[formControlName="events"]', '今日はE2Eテストを書きました');
    await page.fill('textarea[formControlName="learnings"]', 'Playwrightの使い方を学びました');

    // よかったことを追加
    await page.click('text=追加 >> nth=0');
    await page.fill('.card:first-child textarea:first-child', 'テストが通った');
    await page.fill('.card:first-child textarea:last-child', '丁寧に書いたから');

    // 改善点を追加
    await page.click('text=追加 >> nth=1');
    await page.fill('.form-group:last-of-type .card textarea:first-child', 'テストカバレッジを上げる');
    await page.fill('.form-group:last-of-type .card textarea:last-child', 'エッジケースも網羅する');

    // 保存ボタンをクリック
    await page.click('button[type="submit"]');

    // 日報一覧画面に遷移したことを確認（現在はホームにリダイレクト）
    await page.waitForURL('/daily-reports');
  });

  test('必須項目が未入力の場合、保存できないこと', async ({ page }) => {
    await page.goto('/daily-reports/new');

    // できごとを空のまま保存ボタンをクリック
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されること
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('文字数カウントが正しく表示されること', async ({ page }) => {
    await page.goto('/daily-reports/new');

    // できごとに入力
    await page.fill('textarea[formControlName="events"]', 'テスト');

    // 文字数カウントが更新されること
    await expect(page.locator('.char-count').first()).toContainText('3/1000');
  });

  test('よかったことを複数追加・削除できること', async ({ page }) => {
    await page.goto('/daily-reports/new');

    // よかったことを2つ追加
    await page.click('text=追加 >> nth=0');
    await page.click('text=追加 >> nth=0');

    // カードが2つあることを確認
    const goodPointCards = page.locator('.form-group:has(text="よかったこと") .card');
    await expect(goodPointCards).toHaveCount(2);

    // 1つ削除
    await page.click('.card-remove >> nth=0');

    // カードが1つになったことを確認
    await expect(goodPointCards).toHaveCount(1);
  });

  test('改善点を複数追加・削除できること', async ({ page }) => {
    await page.goto('/daily-reports/new');

    // 改善点を2つ追加
    await page.click('text=追加 >> nth=1');
    await page.click('text=追加 >> nth=1');

    // カードが2つあることを確認
    const improvementCards = page.locator('.form-group:has(text="改善点") .card');
    await expect(improvementCards).toHaveCount(2);

    // 1つ削除
    await page.click('.form-group:has(text="改善点") .card-remove >> nth=0');

    // カードが1つになったことを確認
    await expect(improvementCards).toHaveCount(1);
  });

  test('戻るボタンで前の画面に戻れること', async ({ page }) => {
    await page.goto('/daily-reports/new');

    // 戻るボタンをクリック
    await page.click('.back-link');

    // 日報一覧画面に遷移したことを確認
    await expect(page).toHaveURL('/daily-reports');
  });

  test('同じ日付の日報が既に存在する場合、エラーが表示されること', async ({ page }) => {
    await page.goto('/daily-reports/new');

    // 1回目の日報を保存
    await page.fill('textarea[formControlName="events"]', '1回目の日報');
    await page.click('button[type="submit"]');
    await page.waitForURL('/daily-reports');

    // 再度日報入力画面に遷移
    await page.goto('/daily-reports/new');

    // 同じ日付で2回目の日報を保存しようとする
    await page.fill('textarea[formControlName="events"]', '2回目の日報');
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されること
    await expect(page.locator('app-alert-banner')).toBeVisible();
    await expect(page.locator('app-alert-banner')).toContainText('既に存在');
  });
});


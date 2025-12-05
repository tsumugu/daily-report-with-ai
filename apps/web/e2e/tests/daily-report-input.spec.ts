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
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('input#email');
    
    // フォーム入力（内部のinput要素を正確にセレクト）
    await page.fill('input#email', testUser.email);
    await page.fill('input#password', testUser.password);
    await page.fill('input#confirmPassword', testUser.password);
    
    // サブミットボタンをクリック
    await page.click('button[type="submit"]');

    // ホーム画面に遷移するまで待機
    await page.waitForURL('/', { timeout: 10000 });
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
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('textarea[formControlName="events"]');

    // フォームに入力
    await page.fill('textarea[formControlName="events"]', '今日はE2Eテストを書きました');
    await page.fill('textarea[formControlName="learnings"]', 'Playwrightの使い方を学びました');

    // よかったことを追加
    await page.click('button:has-text("追加"):first-of-type');
    await page.waitForSelector('.card');
    const goodPointCard = page.locator('.form-group:has-text("よかったこと") .card').first();
    await goodPointCard.locator('textarea').first().fill('テストが通った');
    await goodPointCard.locator('textarea').last().fill('丁寧に書いたから');

    // 改善点を追加
    const addButtons = page.locator('button:has-text("追加")');
    await addButtons.last().click();
    await page.waitForSelector('.form-group:has-text("改善点") .card');
    const improvementCard = page.locator('.form-group:has-text("改善点") .card').first();
    await improvementCard.locator('textarea').first().fill('テストカバレッジを上げる');
    await improvementCard.locator('textarea').last().fill('エッジケースも網羅する');

    // 保存ボタンをクリック
    await page.click('button[type="submit"]');

    // 日報一覧画面に遷移したことを確認
    await page.waitForURL('/daily-reports', { timeout: 10000 });
  });

  test('必須項目が未入力の場合、保存できないこと', async ({ page }) => {
    await page.goto('/daily-reports/new');
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('button[type="submit"]');

    // できごとを空のまま保存ボタンをクリック
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されること
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('文字数カウントが正しく表示されること', async ({ page }) => {
    await page.goto('/daily-reports/new');
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('textarea[formControlName="events"]');

    // できごとに入力
    await page.fill('textarea[formControlName="events"]', 'テスト');

    // 文字数カウントが更新されること
    await expect(page.locator('.char-count').first()).toContainText('3/1000');
  });

  test('よかったことを複数追加・削除できること', async ({ page }) => {
    await page.goto('/daily-reports/new');
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('button:has-text("追加")');

    // よかったことセクションの追加ボタン
    const addGoodPointButton = page.locator('.form-group:has-text("よかったこと") button:has-text("追加")');
    
    // よかったことを2つ追加
    await addGoodPointButton.click();
    await page.waitForSelector('.form-group:has-text("よかったこと") .card');
    await addGoodPointButton.click();

    // カードが2つあることを確認
    const goodPointCards = page.locator('.form-group:has-text("よかったこと") .card');
    await expect(goodPointCards).toHaveCount(2);

    // 1つ削除
    await page.locator('.form-group:has-text("よかったこと") .card-remove').first().click();

    // カードが1つになったことを確認
    await expect(goodPointCards).toHaveCount(1);
  });

  test('改善点を複数追加・削除できること', async ({ page }) => {
    await page.goto('/daily-reports/new');
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('button:has-text("追加")');

    // 改善点セクションの追加ボタン
    const addImprovementButton = page.locator('.form-group:has-text("改善点") button:has-text("追加")');
    
    // 改善点を2つ追加
    await addImprovementButton.click();
    await page.waitForSelector('.form-group:has-text("改善点") .card');
    await addImprovementButton.click();

    // カードが2つあることを確認
    const improvementCards = page.locator('.form-group:has-text("改善点") .card');
    await expect(improvementCards).toHaveCount(2);

    // 1つ削除
    await page.locator('.form-group:has-text("改善点") .card-remove').first().click();

    // カードが1つになったことを確認
    await expect(improvementCards).toHaveCount(1);
  });

  test('戻るボタンで前の画面に戻れること', async ({ page }) => {
    await page.goto('/daily-reports/new');
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('.back-link');

    // 戻るボタンをクリック
    await page.click('.back-link');

    // 日報一覧画面に遷移したことを確認
    await expect(page).toHaveURL('/daily-reports');
  });

  test('同じ日付の日報が既に存在する場合、エラーが表示されること', async ({ page }) => {
    await page.goto('/daily-reports/new');
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('textarea[formControlName="events"]');

    // 1回目の日報を保存
    await page.fill('textarea[formControlName="events"]', '1回目の日報');
    await page.click('button[type="submit"]');
    await page.waitForURL('/daily-reports', { timeout: 10000 });

    // 再度日報入力画面に遷移
    await page.goto('/daily-reports/new');
    await page.waitForSelector('textarea[formControlName="events"]');

    // 同じ日付で2回目の日報を保存しようとする
    await page.fill('textarea[formControlName="events"]', '2回目の日報');
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されること
    await expect(page.locator('app-alert-banner')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('app-alert-banner')).toContainText('既に存在');
  });
});

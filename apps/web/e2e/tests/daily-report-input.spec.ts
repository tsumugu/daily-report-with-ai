import { test, expect } from '../fixtures/coverage';
import * as crypto from 'crypto';

test.describe('日報入力画面', () => {
  // テスト用のパスワード（共通）
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    // 各テストで一意のメールアドレスを生成
    const uniqueEmail = `e2e-${crypto.randomUUID()}@example.com`;
    
    // サインアップしてログイン状態にする
    await page.goto('/signup');
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('input#email');
    
    // フォーム入力（内部のinput要素を正確にセレクト）
    await page.fill('input#email', uniqueEmail);
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);
    
    // サブミットボタンをクリック
    await page.click('button[type="submit"]');

    // ホーム画面に遷移するまで待機
    await page.waitForURL('/', { timeout: 15000 });
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
    
    // ページが読み込まれるまで待機（id セレクタを使用）
    await page.waitForSelector('textarea#events');

    // フォームに入力
    await page.fill('textarea#events', '今日はE2Eテストを書きました');
    await page.fill('textarea#learnings', 'Playwrightの使い方を学びました');

    // よかったことを追加
    await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
    await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
    const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
    await goodPointCard.locator('textarea').first().fill('テストが通った');
    await goodPointCard.locator('textarea').last().fill('丁寧に書いたから');

    // 改善点を追加
    await page.click('.form-group:has-text("改善点") button:has-text("追加")');
    await page.waitForSelector('.form-group:has-text("改善点") .form-card');
    const improvementCard = page.locator('.form-group:has-text("改善点") .form-card').first();
    await improvementCard.locator('textarea').first().fill('テストカバレッジを上げる');
    await improvementCard.locator('textarea').last().fill('エッジケースも網羅する');

    // 保存ボタンをクリック
    await page.click('button[type="submit"]');

    // 日報一覧画面に遷移したことを確認
    await page.waitForURL('/daily-reports', { timeout: 15000 });
  });

  test('必須項目が未入力の場合、保存できないこと', async ({ page }) => {
    await page.goto('/daily-reports/new');
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('button[type="submit"]');

    // できごとを空のまま保存ボタンをクリック
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されること（textarea-field__error クラスを使用）
    await expect(page.locator('.textarea-field__error')).toBeVisible();
  });

  test('文字数カウントが正しく表示されること', async ({ page }) => {
    await page.goto('/daily-reports/new');
    
    // ページが読み込まれるまで待機（id セレクタを使用）
    await page.waitForSelector('textarea#events');

    // できごとに入力
    await page.fill('textarea#events', 'テスト');

    // 文字数カウントが更新されること（textarea-field__char-count クラスを使用）
    await expect(page.locator('.textarea-field__char-count').first()).toContainText('3/1000');
  });

  test('よかったことを複数追加・削除できること', async ({ page }) => {
    await page.goto('/daily-reports/new');
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('button:has-text("追加")');

    // よかったことセクションの追加ボタン
    const addGoodPointButton = page.locator('.form-group:has-text("よかったこと") button:has-text("追加")');
    
    // よかったことを2つ追加（form-card クラスを使用）
    await addGoodPointButton.click();
    await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
    await addGoodPointButton.click();

    // カードが2つあることを確認
    const goodPointCards = page.locator('.form-group:has-text("よかったこと") .form-card');
    await expect(goodPointCards).toHaveCount(2);

    // 1つ削除（form-card__remove クラスを使用）
    await page.locator('.form-group:has-text("よかったこと") .form-card__remove').first().click();

    // カードが1つになったことを確認
    await expect(goodPointCards).toHaveCount(1);
  });

  test('改善点を複数追加・削除できること', async ({ page }) => {
    await page.goto('/daily-reports/new');
    
    // ページが読み込まれるまで待機
    await page.waitForSelector('button:has-text("追加")');

    // 改善点セクションの追加ボタン
    const addImprovementButton = page.locator('.form-group:has-text("改善点") button:has-text("追加")');
    
    // 改善点を2つ追加（form-card クラスを使用）
    await addImprovementButton.click();
    await page.waitForSelector('.form-group:has-text("改善点") .form-card');
    await addImprovementButton.click();

    // カードが2つあることを確認
    const improvementCards = page.locator('.form-group:has-text("改善点") .form-card');
    await expect(improvementCards).toHaveCount(2);

    // 1つ削除（form-card__remove クラスを使用）
    await page.locator('.form-group:has-text("改善点") .form-card__remove').first().click();

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
    
    // ページが読み込まれるまで待機（id セレクタを使用）
    await page.waitForSelector('textarea#events');

    // 1回目の日報を保存
    await page.fill('textarea#events', '1回目の日報');
    await page.click('button[type="submit"]');
    await page.waitForURL('/daily-reports', { timeout: 15000 });

    // 再度日報入力画面に遷移
    await page.goto('/daily-reports/new');
    await page.waitForSelector('textarea#events');

    // 同じ日付で2回目の日報を保存しようとする
    await page.fill('textarea#events', '2回目の日報');
    await page.click('button[type="submit"]');

    // エラーメッセージが表示されること
    await expect(page.locator('app-alert-banner')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('app-alert-banner')).toContainText('既に存在');
  });
});

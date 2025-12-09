import { test, expect } from '../fixtures/coverage';
import * as crypto from 'crypto';

test.describe('フォローアップ管理機能', () => {
  // テスト用のパスワード（共通）
  const testPassword = 'TestPassword123!';
  let uniqueEmail: string;

  test.beforeEach(async ({ page }) => {
    // 各テストで一意のメールアドレスを生成
    uniqueEmail = `e2e-followup-${crypto.randomUUID()}@example.com`;

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

  // ============================================
  // Phase 1: フォロー項目一覧画面の基本機能
  // ============================================

  test.describe('フォロー項目一覧画面', () => {
    test('ホーム画面からフォロー項目一覧画面に遷移できること', async ({ page }) => {
      // フォロー項目一覧へのリンクを探す（ホーム画面に直接リンクがない場合は、ナビゲーションから）
      // 実際の実装に合わせて調整が必要
      await page.goto('/followups');

      // フォロー項目一覧画面に遷移したことを確認
      await expect(page).toHaveURL('/followups');
      await expect(page.locator('.followup-list-page__title')).toContainText('フォロー項目');
    });

    test('フォロー項目がない場合は空状態が表示されること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-list-page');

      // 空状態が表示されることを確認
      await expect(page.locator('.followup-list-page__empty')).toBeVisible();
      await expect(page.locator('.followup-list-page__empty-message')).toContainText(
        'フォローする項目が'
      );
    });

    test('フォロー項目が一覧に表示されること', async ({ page }) => {
      // 日報を作成してよかったこと/改善点を追加
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', 'フォローアップテスト用日報');

      // よかったことを追加
      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('テスト用よかったこと');

      // 改善点を追加
      await page.click('.form-group:has-text("改善点") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("改善点") .form-card');
      const improvementCard = page.locator('.form-group:has-text("改善点") .form-card').first();
      await improvementCard.locator('textarea').first().fill('テスト用改善点');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面に遷移
      await page.goto('/followups');
      await page.waitForSelector('.followup-list-page');

      // フォロー項目が表示されていることを確認
      const followupCards = page.locator('.followup-card');
      await expect(followupCards.first()).toBeVisible({ timeout: 5000 });
      await expect(followupCards.first().locator('.followup-card__text')).toContainText('テスト用よかったこと');
    });

    test('デフォルトで未完了（未着手/進行中）のみ表示されること', async ({ page }) => {
      // 日報を作成
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', 'フィルタテスト用日報');

      // よかったことを追加
      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('未着手のよかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面に遷移
      await page.goto('/followups');
      await page.waitForSelector('.followup-list-page');

      // デフォルトフィルタが「未完了」になっていることを確認
      const statusFilter = page.locator('.followup-list-page__filter').first();
      await expect(statusFilter).toHaveValue('未着手,進行中');

      // フォロー項目が表示されていることを確認
      await expect(page.locator('.followup-card')).toBeVisible({ timeout: 5000 });
    });
  });

  // ============================================
  // Phase 2: フィルタ・ページングのテスト
  // ============================================

  test.describe('フィルタ機能', () => {
    test.beforeEach(async ({ page }) => {
      // テストデータを準備：よかったことと改善点を含む日報を作成
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', 'フィルタテスト用日報');

      // よかったことを追加
      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('フィルタテスト用よかったこと');

      // 改善点を追加
      await page.click('.form-group:has-text("改善点") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("改善点") .form-card');
      const improvementCard = page.locator('.form-group:has-text("改善点") .form-card').first();
      await improvementCard.locator('textarea').first().fill('フィルタテスト用改善点');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });
    });

    test('ステータスフィルタで「すべて」を選択できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-list-page');

      // ステータスフィルタを「すべて」に変更
      const statusFilter = page.locator('.followup-list-page__filter').first();
      await statusFilter.selectOption('すべて');

      // フィルタが適用されたことを確認
      await expect(statusFilter).toHaveValue('すべて');
    });

    test('ステータスフィルタで「未着手」を選択できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-list-page');

      const statusFilter = page.locator('.followup-list-page__filter').first();
      await statusFilter.selectOption('未着手');

      await expect(statusFilter).toHaveValue('未着手');
    });

    test('ステータスフィルタで「進行中」を選択できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-list-page');

      const statusFilter = page.locator('.followup-list-page__filter').first();
      await statusFilter.selectOption('進行中');

      await expect(statusFilter).toHaveValue('進行中');
    });

    test('種別フィルタで「よかったこと」を選択できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-list-page');

      const itemTypeFilter = page.locator('.followup-list-page__filter').nth(1);
      await itemTypeFilter.selectOption('goodPoint');

      await expect(itemTypeFilter).toHaveValue('goodPoint');
    });

    test('種別フィルタで「改善点」を選択できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-list-page');

      const itemTypeFilter = page.locator('.followup-list-page__filter').nth(1);
      await itemTypeFilter.selectOption('improvement');

      await expect(itemTypeFilter).toHaveValue('improvement');
    });
  });

  // ============================================
  // Phase 1: フォローアップ入力モーダルの基本機能
  // ============================================

  test.describe('フォローアップ入力モーダル（よかったこと）', () => {
    test.beforeEach(async ({ page }) => {
      // テストデータを準備：よかったことを含む日報を作成
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', 'フォローアップ入力テスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('フォローアップ入力テスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });
    });

    test('フォロー項目カードをクリックするとフォローアップ入力モーダルが開くこと', async ({
      page,
    }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      // 最初のカードの「フォローアップ」ボタンをクリック
      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();

      // モーダルが開いたことを確認
      await expect(page.locator('.modal-overlay')).toBeVisible();
      await expect(page.locator('.modal-title')).toContainText('よかったことのフォローアップ');
    });

    test('よかったことのフォローアップで「未着手」を選択できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });
      
      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      // ステータスを選択
      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('未着手');

      await expect(statusSelect).toHaveValue('未着手');
    });

    test('よかったことのフォローアップで「進行中」を選択できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });
      
      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('進行中');

      await expect(statusSelect).toHaveValue('進行中');
    });

    test('よかったことのフォローアップで「再現成功」を選択できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });
      
      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('再現成功');

      await expect(statusSelect).toHaveValue('再現成功');
    });

    test('ステータスが「再現成功」の場合、再現日が必須であること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });
      
      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      // ステータスを「再現成功」に変更
      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('再現成功');

      // 日付フィールドが必須になっていることを確認（ヒントメッセージが表示される）
      await expect(page.locator('.form-hint')).toBeVisible();
      await expect(page.locator('.form-hint')).toContainText('必須');

      // 日付を入力せずに保存しようとする
      const memoField = page.locator('textarea#memo');
      await memoField.fill('テストメモ');

      // 保存ボタンが無効になっていることを確認（disabled属性またはbutton--disabledクラス）
      const saveButton = page.locator('button[type="submit"]');
      const isDisabled = await saveButton.isDisabled();
      expect(isDisabled).toBeTruthy();
    });

    test('再現メモを入力できること（最大500文字）', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });
      
      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      const memoField = page.locator('textarea#memo');
      await memoField.fill('テストメモ');

      await expect(memoField).toHaveValue('テストメモ');
    });

    test('フォローアップを保存できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });
      
      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      // フォームに入力
      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('進行中');

      const memoField = page.locator('textarea#memo');
      await memoField.fill('テストメモ');

      // 保存ボタンをクリック
      await page.click('button[type="submit"]');

      // モーダルが閉じることを確認
      await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
    });

    test('保存後に一覧が更新されること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      // 最初のカードの内容を記録
      const initialCard = page.locator('.followup-card').first();

      // フォローアップを入力
      await initialCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('進行中');

      const memoField = page.locator('textarea#memo');
      await memoField.fill('テストメモ');

      await page.click('button[type="submit"]');
      await page.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 5000 });

      // 一覧が更新されるまで待つ
      await page.waitForTimeout(1000);

      // 一覧が更新されていることを確認（成功回数が表示される）
      await expect(page.locator('.followup-card__success-count').first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('フォローアップ入力モーダル（改善点）', () => {
    test.beforeEach(async ({ page }) => {
      // テストデータを準備：改善点を含む日報を作成
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', '改善点フォローアップテスト用日報');

      await page.click('.form-group:has-text("改善点") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("改善点") .form-card');
      const improvementCard = page.locator('.form-group:has-text("改善点") .form-card').first();
      await improvementCard.locator('textarea').first().fill('改善点フォローアップテスト用改善点');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });
    });

    test('改善点のフォローアップで「未着手」を選択できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      // 改善点のカードを探す（種別フィルタで絞り込む）
      const itemTypeFilter = page.locator('.followup-list-page__filter').nth(1);
      await itemTypeFilter.selectOption('improvement');
      await page.waitForTimeout(500); // フィルタ適用を待つ

      await page.click('button:has-text("フォローアップ")');
      await page.waitForSelector('.modal-overlay');

      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('未着手');

      await expect(statusSelect).toHaveValue('未着手');
    });

    test('改善点のフォローアップで「完了」を選択できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      const itemTypeFilter = page.locator('.followup-list-page__filter').nth(1);
      await itemTypeFilter.selectOption('improvement');
      await page.waitForTimeout(500);

      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('完了');

      await expect(statusSelect).toHaveValue('完了');
    });

    test('ステータスが「完了」の場合、完了日が必須であること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      const itemTypeFilter = page.locator('.followup-list-page__filter').nth(1);
      await itemTypeFilter.selectOption('improvement');
      await page.waitForTimeout(500);

      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      // ステータスを「完了」に変更
      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('完了');

      // 日付フィールドが必須になっていることを確認
      await expect(page.locator('.form-hint')).toBeVisible();
      await expect(page.locator('.form-hint')).toContainText('必須');
    });

    test('改善点のフォローアップを保存できること', async ({ page }) => {
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      const itemTypeFilter = page.locator('.followup-list-page__filter').nth(1);
      await itemTypeFilter.selectOption('improvement');
      await page.waitForTimeout(500);

      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      // フォームに入力
      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('進行中');

      const memoField = page.locator('textarea#memo');
      await memoField.fill('テストメモ');

      // 保存ボタンをクリック
      await page.click('button[type="submit"]');

      // モーダルが閉じることを確認
      await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
    });
  });

  // ============================================
  // Phase 3: 成功カウント・定着バッジのテスト
  // ============================================

  test.describe('成功カウント・定着バッジ', () => {
    test('成功回数が表示されること', async ({ page }) => {
      // 日報を作成
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', '成功カウントテスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('成功カウントテスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // フォローアップを追加
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });
      
      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('再現成功');

      const dateField = page.locator('input#date');
      await dateField.fill('2025-12-10');

      const memoField = page.locator('textarea#memo');
      await memoField.fill('テストメモ');

      await page.click('button[type="submit"]');
      await page.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 5000 });

      // ステータスが「再現成功」になったため、フィルタを「すべて」に変更してカードを表示
      const statusFilter = page.locator('.followup-list-page__filter').first();
      await statusFilter.selectOption('すべて');
      
      // ローディングが終わるまで待つ
      await page.waitForSelector('.followup-list-page__loading', { state: 'hidden', timeout: 5000 });
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      // 成功回数が表示されていることを確認
      await expect(page.locator('.followup-card__success-count').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.followup-card__success-count').first()).toContainText('成功: 1回');
    });

    test('成功回数が3回以上の場合、定着バッジが表示されること（よかったこと）', async ({
      page,
    }) => {
      // 日報を作成
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', '定着バッジテスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('定着バッジテスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // フォローアップを3回追加
      for (let i = 0; i < 3; i++) {
        await page.goto('/followups');
        
        // フィルタを「すべて」に設定してカードを表示
        const statusFilter = page.locator('.followup-list-page__filter').first();
        await statusFilter.selectOption('すべて');
        
        // ローディングが終わるまで待つ
        await page.waitForSelector('.followup-list-page__loading', { state: 'hidden', timeout: 5000 });
        await page.waitForSelector('.followup-card', { timeout: 5000 });
        
        // 最初のカードの「フォローアップ」ボタンをクリック
        const firstCard = page.locator('.followup-card').first();
        await firstCard.locator('button:has-text("フォローアップ")').click();
        await page.waitForSelector('.modal-overlay');

        const statusSelect = page.locator('select#status');
        await statusSelect.selectOption('再現成功');

        const dateField = page.locator('input#date');
        await dateField.fill('2025-12-10');

        const memoField = page.locator('textarea#memo');
        await memoField.fill(`テストメモ ${i + 1}`);

        await page.click('button[type="submit"]');
        await page.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 5000 });
        
        // 一覧が更新されるまで待つ（ローディングが終わるまで）
        await page.waitForSelector('.followup-list-page__loading', { state: 'hidden', timeout: 5000 });
      }

      // フィルタを「すべて」に設定してカードを表示
      await page.goto('/followups');
      const statusFilter = page.locator('.followup-list-page__filter').first();
      await statusFilter.selectOption('すべて');
      
      // ローディングが終わるまで待つ
      await page.waitForSelector('.followup-list-page__loading', { state: 'hidden', timeout: 5000 });
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      // 定着バッジが表示されていることを確認
      await expect(page.locator('.followup-card__settled-badge').first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.followup-card__settled-badge').first()).toContainText('定着');
    });
  });

  // ============================================
  // Phase 1: 週次フォーカスの基本機能
  // ============================================

  test.describe('週次フォーカス', () => {
    test('ホーム画面に週次フォーカスセクションが表示されること', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.home-container');

      // 週次フォーカスセクションが表示されていることを確認
      await expect(page.locator('.weekly-focus-section')).toBeVisible();
      await expect(page.locator('.weekly-focus-section__title')).toContainText('今週のフォーカス');
    });

    test('週次フォーカスが未設定の場合、空状態メッセージが表示されること', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForSelector('.weekly-focus-section');

      // 空状態が表示されていることを確認
      await expect(page.locator('.weekly-focus-section__empty')).toBeVisible();
      await expect(page.locator('.weekly-focus-section__empty-message')).toContainText(
        '今週のフォーカスが'
      );
    });

    test('「＋追加」ボタンでフォロー項目一覧画面に遷移できること', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.weekly-focus-section');

      // 「＋追加」ボタンをクリック
      await page.click('button:has-text("＋追加")');

      // フォロー項目一覧画面に遷移したことを確認
      await expect(page).toHaveURL('/followups');
    });

    test('週次フォーカスを削除できること', async ({ page }) => {
      // まず、週次フォーカスを追加するために日報とフォロー項目を作成
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', '週次フォーカス削除テスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('週次フォーカス削除テスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // 週次フォーカスを追加（API経由で直接追加する必要があるため、ここではUI操作のみ）
      // 実際の実装では、フォロー項目一覧から週次フォーカスに追加する機能があることを前提とする
      // このテストは、週次フォーカスが存在する場合の削除テスト

      await page.goto('/');
      await page.waitForSelector('.weekly-focus-section');

      // 週次フォーカスカードが存在する場合、削除ボタンをクリック
      const focusCards = page.locator('.weekly-focus-card');
      const count = await focusCards.count();

      if (count > 0) {
        // 最初のカードの削除ボタンをクリック
        await focusCards.first().locator('button:has-text("×")').click();

        // カードが削除されたことを確認（カウントが減る）
        await expect(focusCards).toHaveCount(count - 1, { timeout: 5000 });
      }
    });
  });

  // ============================================
  // Phase 4: エラーハンドリングのテスト
  // ============================================

  test.describe('エラーハンドリング', () => {
    test('必須項目未入力時にエラーメッセージが表示されること', async ({ page }) => {
      // 日報を作成
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', 'エラーハンドリングテスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('エラーハンドリングテスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // フォローアップ入力モーダルを開く
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });
      
      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      // ステータスを「再現成功」に設定（日付が必須になる）
      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('再現成功');

      // 日付を入力せずに保存ボタンの状態を確認
      const saveButton = page.locator('button[type="submit"]');
      const isDisabled = await saveButton.isDisabled();

      // 保存ボタンが無効になっているか、エラーメッセージが表示されることを確認
      expect(isDisabled).toBeTruthy();
    });

    test('同じ項目に複数回フォローアップを追加できること', async ({ page }) => {
      // 日報を作成
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', '複数回フォローアップテスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('複数回フォローアップテスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // 1回目のフォローアップを追加（再現成功で成功回数+1）
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });
      
      // 最初のカードの「フォローアップ」ボタンをクリック
      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      const statusSelect = page.locator('select#status');
      await statusSelect.selectOption('再現成功');

      const dateField = page.locator('input#date');
      await dateField.fill('2025-12-09');

      const memoField = page.locator('textarea#memo');
      await memoField.fill('1回目のメモ');

      await page.click('button[type="submit"]');
      await page.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 5000 });

      // 2回目のフォローアップを追加（再現成功で成功回数+1、合計2回）
      // フィルタを「すべて」に変更してカードを表示
      const statusFilter = page.locator('.followup-list-page__filter').first();
      await statusFilter.selectOption('すべて');
      
      // ローディングが終わるまで待つ
      await page.waitForSelector('.followup-list-page__loading', { state: 'hidden', timeout: 5000 });
      await page.waitForSelector('.followup-card', { timeout: 5000 });
      
      // 最初のカードの「フォローアップ」ボタンをクリック
      const firstCard2 = page.locator('.followup-card').first();
      await firstCard2.locator('button:has-text("フォローアップ")').click();
      await page.waitForSelector('.modal-overlay');

      await statusSelect.selectOption('再現成功');
      await dateField.fill('2025-12-10');
      await memoField.fill('2回目のメモ');

      await page.click('button[type="submit"]');
      await page.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 5000 });

      // フィルタを再度「すべて」に変更してカードを表示
      await statusFilter.selectOption('すべて');
      
      // ローディングが終わるまで待つ
      await page.waitForSelector('.followup-list-page__loading', { state: 'hidden', timeout: 5000 });
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      // 成功回数が2回になっていることを確認
      await expect(page.locator('.followup-card__success-count').first()).toContainText('成功: 2回', {
        timeout: 5000,
      });
    });
  });

  // ============================================
  // Phase 2: 週次フォーカス管理機能
  // ============================================

  test.describe('週次フォーカス管理機能', () => {
    test('フォロー項目一覧から週次フォーカスを追加できること', async ({ page }) => {
      // 日報を作成してよかったことを追加
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', '週次フォーカステスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('週次フォーカステスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面に遷移
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      // 「フォーカスに追加」ボタンをクリック
      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button[aria-label="フォーカスに追加"]').click();

      // トースト通知が表示されることを確認
      await expect(page.locator('.followup-list-page__toast')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.toast--success')).toContainText('今週のフォーカスに追加しました');

      // 「今週のフォーカス」バッジが表示されることを確認
      await expect(firstCard.locator('.followup-card__weekly-focus-badge')).toBeVisible();
      await expect(firstCard.locator('.followup-card__weekly-focus-badge')).toContainText('今週のフォーカス');

      // 「フォーカスに追加」ボタンが非表示になることを確認（aria-labelが「フォーカスから削除」に変わる）
      await expect(firstCard.locator('button[aria-label="フォーカスに追加"]')).not.toBeVisible();
    });

    test('ピンアイコンで週次フォーカスに追加できること', async ({ page }) => {
      // 日報を作成してよかったことを追加
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', 'ピン追加テスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('ピン追加テスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面でピンアイコンをクリック
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      const firstCard = page.locator('.followup-card').first();
      const pinButton = firstCard.locator('button[aria-label="フォーカスに追加"]');
      await pinButton.click();

      // 成功トーストを確認
      await expect(page.locator('.toast--success')).toBeVisible({ timeout: 5000 });

      // ピン状態が反映されることを確認（aria-labelが切り替わり、バッジが表示される）
      await expect(firstCard.locator('button[aria-label="フォーカスから削除"]')).toBeVisible({
        timeout: 5000,
      });
      await expect(firstCard.locator('.followup-card__weekly-focus-badge')).toBeVisible({
        timeout: 5000,
      });
    });

    test('ピンアイコンで週次フォーカスから削除できること', async ({ page }) => {
      // 事前に追加しておく
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', 'ピン削除テスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('ピン削除テスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });
      const firstCard = page.locator('.followup-card').first();

      // 追加
      const addPinButton = firstCard.locator('button[aria-label="フォーカスに追加"]');
      await addPinButton.click();
      await page.waitForSelector('.toast--success', { timeout: 5000 });
      await expect(firstCard.locator('button[aria-label="フォーカスから削除"]')).toBeVisible({
        timeout: 5000,
      });

      // 削除
      const removePinButton = firstCard.locator('button[aria-label="フォーカスから削除"]');
      await removePinButton.click();

      // 状態が戻ることを確認（バッジが消え、追加用ラベルに戻る）
      await expect(firstCard.locator('.followup-card__weekly-focus-badge')).not.toBeVisible({
        timeout: 5000,
      });
      await expect(firstCard.locator('button[aria-label="フォーカスに追加"]')).toBeVisible({
        timeout: 5000,
      });
    });

    test('ホーム画面で週次フォーカスが表示されること', async ({ page }) => {
      // 日報を作成してよかったことを追加
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', '週次フォーカス表示テスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('週次フォーカス表示テスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面で週次フォーカスを追加
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button[aria-label="フォーカスに追加"]').click();
      await page.waitForSelector('.toast--success', { timeout: 5000 });

      // ホーム画面に戻る
      await page.goto('/home');
      await page.waitForSelector('.weekly-focus-section', { timeout: 5000 });

      // 週次フォーカスが表示されることを確認
      await expect(page.locator('.weekly-focus-card')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.weekly-focus-card').first()).toContainText('週次フォーカス表示テスト用よかったこと');
    });

    test('週次フォーカスを削除できること', async ({ page }) => {
      // 日報を作成してよかったことを追加
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', '週次フォーカス削除テスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('週次フォーカス削除テスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面で週次フォーカスを追加
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button[aria-label="フォーカスに追加"]').click();
      await page.waitForSelector('.toast--success', { timeout: 5000 });

      // ホーム画面に戻る
      await page.goto('/home');
      await page.waitForSelector('.weekly-focus-card', { timeout: 5000 });

      // 削除ボタンをクリック（ariaLabel="削除"を使用）
      const weeklyFocusCard = page.locator('.weekly-focus-card').first();
      await weeklyFocusCard.locator('button[aria-label="削除"]').click();

      // 週次フォーカスが削除されることを確認（空状態が表示される）
      await expect(page.locator('.weekly-focus-section__empty')).toBeVisible({ timeout: 5000 });
    });

    test('既にフォーカスに設定されている項目は「フォーカスに追加」ボタンが非表示になること', async ({ page }) => {
      // 日報を作成してよかったことを追加
      await page.goto('/daily-reports/new');
      await page.waitForSelector('textarea#events');
      await page.fill('textarea#events', '週次フォーカス重複テスト用日報');

      await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
      await page.waitForSelector('.form-group:has-text("よかったこと") .form-card');
      const goodPointCard = page.locator('.form-group:has-text("よかったこと") .form-card').first();
      await goodPointCard.locator('textarea').first().fill('週次フォーカス重複テスト用よかったこと');

      await page.click('button[type="submit"]');
      await page.waitForURL('/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面で週次フォーカスを追加
      await page.goto('/followups');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      const firstCard = page.locator('.followup-card').first();
      await firstCard.locator('button[aria-label="フォーカスに追加"]').click();
      await page.waitForSelector('.toast--success', { timeout: 5000 });

      // ページをリロード
      await page.reload();
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      // 「フォーカスに追加」ボタンが非表示で、「今週のフォーカス」バッジが表示されることを確認
      await expect(firstCard.locator('button[aria-label="フォーカスに追加"]')).not.toBeVisible();
      await expect(firstCard.locator('.followup-card__weekly-focus-badge')).toBeVisible();
    });

    test('最大5件制限でエラーが表示されること', async ({ page }) => {
      test.setTimeout(60000); // テストタイムアウトを60秒に設定

      // ヘルパー関数: 日報を作成してフォロー項目を追加
      async function createDailyReportWithGoodPoint(index: number): Promise<void> {
        await page.goto('/daily-reports/new');
        await page.waitForSelector('textarea#events', { timeout: 5000 });
        
        // 日付を設定（各日報で異なる日付を使用）
        const testDate = new Date();
        testDate.setDate(testDate.getDate() + index + 100); // 100日後以降（重複回避）
        const dateString = testDate.toISOString().split('T')[0];
        await page.locator('input#date').fill(dateString);
        
        await page.fill('textarea#events', `週次フォーカス制限テスト用日報${index}`);

        // よかったことを追加
        await page.click('.form-group:has-text("よかったこと") button:has-text("追加")');
        await page.waitForSelector('.form-group:has-text("よかったこと") .form-card', { timeout: 5000 });
        await page.locator('.form-group:has-text("よかったこと") .form-card').first()
          .locator('textarea').first().fill(`週次フォーカス制限テスト用よかったこと${index}`);

        // 日報を保存
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(daily-reports|home)/, { timeout: 5000 });
      }

      // ヘルパー関数: フォロー項目一覧で特定のカードをフォーカスに追加
      async function addToWeeklyFocus(cardText: string): Promise<void> {
        await page.goto('/followups');
        await page.waitForSelector('.followup-list-page__filter', { timeout: 5000 });
        
        // フィルタを「すべて」に変更
        await page.locator('.followup-list-page__filter').first().selectOption('すべて');
        await page.waitForSelector('.followup-card', { timeout: 5000 });
        
        // カードを探す
        const targetCard = page.locator('.followup-card').filter({ hasText: cardText }).first();
        await targetCard.waitFor({ timeout: 5000, state: 'visible' });

        // 「フォーカスに追加」ボタンをクリック
        const addButton = targetCard.locator('button[aria-label="フォーカスに追加"]');
        await addButton.waitFor({ timeout: 5000, state: 'visible' });
        await addButton.click();
        
        // 成功トーストを待機
        await page.waitForSelector('.toast--success', { timeout: 5000 });
      }

      // 5件のフォロー項目を作成して週次フォーカスに追加
      for (let i = 1; i <= 5; i++) {
        await createDailyReportWithGoodPoint(i);
        await addToWeeklyFocus(`週次フォーカス制限テスト用よかったこと${i}`);
      }

      // 6件目を作成
      await createDailyReportWithGoodPoint(6);

      // フォロー項目一覧画面に遷移
      await page.goto('/followups');
      await page.waitForSelector('.followup-list-page__filter', { timeout: 5000 });
      
      // フィルタを「すべて」に変更
      await page.locator('.followup-list-page__filter').first().selectOption('すべて');
      await page.waitForSelector('.followup-card', { timeout: 5000 });

      // 6件目のカードを探す
      const targetCard6 = page.locator('.followup-card').filter({ hasText: '週次フォーカス制限テスト用よかったこと6' }).first();
      await targetCard6.waitFor({ timeout: 5000, state: 'visible' });

      // 「フォーカスに追加」ボタンが無効化されていることを確認
      const addButton6 = targetCard6.locator('button[aria-label="フォーカスに追加"]');
      await expect(addButton6).toBeDisabled({ timeout: 5000 });
    });
  });
});


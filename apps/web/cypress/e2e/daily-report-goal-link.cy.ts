describe('日報と目標の関連付け機能', () => {
  // テスト用のパスワード（共通）
  const testPassword = 'TestPassword123!';
  let testEmail: string;
  let reportId: string;

  beforeEach(() => {
    // 各テストで一意のメールアドレスを生成
    testEmail = `e2e-${Cypress._.random(0, 1e6)}@example.com`;

    // サインアップしてログイン状態にする
    cy.visit('http://localhost:4200/#/signup');

    // ページが読み込まれるまで待機
    cy.get('input#email').should('be.visible');

    // フォーム入力
    cy.get('input#email').type(testEmail);
    cy.get('input#password').type(testPassword);
    cy.get('input#confirmPassword').type(testPassword);

    // サブミットボタンをクリック
    cy.get('button[type="submit"]').click();

    // ホーム画面に遷移するまで待機
    cy.url().should('eq', 'http://localhost:4200/#/', { timeout: 15000 });

    // 目標を作成（テスト用のデータ準備）
    cy.visit('http://localhost:4200/#/goals/new');
    cy.get('input#goal-name').should('be.visible');

    // 目標1を作成
    cy.get('input#goal-name').type('テスト目標1');
    cy.get('input#goal-start-date').clear().type('2025-01-01');
    cy.get('input#goal-end-date').clear().type('2025-12-31');
    cy.contains('button', '保存する').click();
    cy.url().should('include', '/#/goals/', { timeout: 15000 });

    // 目標2を作成
    cy.visit('http://localhost:4200/#/goals/new');
    cy.get('input#goal-name').should('be.visible');
    cy.get('input#goal-name').type('テスト目標2');
    cy.get('input#goal-start-date').clear().type('2025-01-01');
    cy.get('input#goal-end-date').clear().type('2025-12-31');
    cy.contains('button', '保存する').click();
    cy.url().should('include', '/#/goals/', { timeout: 15000 });
  });

  describe('US-1: 日報作成時の目標関連付け', () => {
    it('日報作成時に目標を選択できること', () => {
      cy.visit('http://localhost:4200/#/daily-reports/new');

      // ページが読み込まれるまで待機
      cy.get('textarea#events').should('be.visible');

      // 目標選択フィールドが表示されることを確認
      cy.contains('label', '関連する目標').should('be.visible');

      // 目標選択フィールドをクリックしてドロップダウンを開く
      cy.get('app-goal-multi-select-field').find('input[type="text"]').click();

      // ドロップダウンが開くまで待機
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').should('be.visible');

      // 目標を選択（最初の目標）
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').contains('テスト目標1').click();

      // 選択した目標がチップとして表示されることを確認
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('be.visible');
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('contain.text', 'テスト目標1');

      // 日報を保存
      cy.get('textarea#events').type('今日は目標に関連付けた日報を書きました');
      cy.get('button[type="submit"]').click();

      // 日報一覧画面に遷移したことを確認
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });
    });

    it('複数の目標を選択できること', () => {
      cy.visit('http://localhost:4200/#/daily-reports/new');

      // ページが読み込まれるまで待機
      cy.get('textarea#events').should('be.visible');

      // 目標選択フィールドをクリック
      cy.get('app-goal-multi-select-field').find('input[type="text"]').click();
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').should('be.visible');

      // 目標1を選択
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').contains('テスト目標1').click();
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('have.length', 1);

      // 再度ドロップダウンを開く
      cy.get('app-goal-multi-select-field').find('input[type="text"]').click();
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').should('be.visible');

      // 目標2を選択
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').contains('テスト目標2').click();

      // 2つの目標がチップとして表示されることを確認
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('have.length', 2);
      cy.get('app-goal-multi-select-field').find('app-goal-chip').first().should('contain.text', 'テスト目標1');
      cy.get('app-goal-multi-select-field').find('app-goal-chip').last().should('contain.text', 'テスト目標2');

      // 日報を保存
      cy.get('textarea#events').type('複数の目標に関連付けた日報');
      cy.get('button[type="submit"]').click();

      // 日報一覧画面に遷移したことを確認
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });
    });

    it('目標を選択しなくても日報を作成できること', () => {
      cy.visit('http://localhost:4200/#/daily-reports/new');

      // ページが読み込まれるまで待機
      cy.get('textarea#events').should('be.visible');

      // 目標を選択せずに日報を保存
      cy.get('textarea#events').type('目標を選択しない日報');
      cy.get('button[type="submit"]').click();

      // 日報一覧画面に遷移したことを確認
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });
    });

    it('選択した目標が日報作成画面に表示されること', () => {
      cy.visit('http://localhost:4200/#/daily-reports/new');

      // ページが読み込まれるまで待機
      cy.get('textarea#events').should('be.visible');

      // 目標を選択
      cy.get('app-goal-multi-select-field').find('input[type="text"]').click();
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').should('be.visible');
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').contains('テスト目標1').click();

      // 選択した目標がチップとして表示されることを確認
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('be.visible');
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('contain.text', 'テスト目標1');
    });
  });

  describe('US-2: 日報編集時の目標関連付けの変更', () => {
    beforeEach(() => {
      // 事前に目標に関連付けた日報を作成
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');

      // 目標を選択
      cy.get('app-goal-multi-select-field').find('input[type="text"]').click();
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').should('be.visible');
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').contains('テスト目標1').click();

      // 日報を保存
      cy.get('textarea#events').type('編集テスト用の日報');
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // 作成した日報のIDを取得
      cy.get('app-report-card').first().click();
      cy.url().then((url) => {
        reportId = url.split('/daily-reports/')[1];
      });
    });

    it('日報編集画面で関連付けられた目標を確認できること', () => {
      cy.visit(`http://localhost:4200/#/daily-reports/${reportId}/edit`);

      // ページが読み込まれるまで待機
      cy.get('textarea#events').should('be.visible');

      // 関連付けられた目標が表示されることを確認
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('be.visible');
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('contain.text', 'テスト目標1');
    });

    it('関連付けられた目標を追加できること', () => {
      cy.visit(`http://localhost:4200/#/daily-reports/${reportId}/edit`);

      // ページが読み込まれるまで待機
      cy.get('textarea#events').should('be.visible');

      // 既存の目標が表示されることを確認
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('contain.text', 'テスト目標1');

      // 目標選択フィールドをクリック
      cy.get('app-goal-multi-select-field').find('input[type="text"]').click();
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').should('be.visible');

      // 目標2を追加
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').contains('テスト目標2').click();

      // 2つの目標が表示されることを確認
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('have.length', 2);

      // 保存
      cy.get('button[type="submit"]').click();
      cy.url().should('include', `/#/daily-reports/${reportId}`, { timeout: 15000 });
    });

    it('関連付けられた目標を削除できること', () => {
      cy.visit(`http://localhost:4200/#/daily-reports/${reportId}/edit`);

      // ページが読み込まれるまで待機
      cy.get('textarea#events').should('be.visible');

      // 既存の目標が表示されることを確認
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('contain.text', 'テスト目標1');

      // 削除ボタンをクリック（showRemoveButtonがtrueの場合）
      cy.get('app-goal-multi-select-field').find('app-goal-chip').find('button').click();

      // 目標が削除されることを確認
      cy.get('app-goal-multi-select-field').find('app-goal-chip').should('not.exist');

      // 保存
      cy.get('button[type="submit"]').click();
      cy.url().should('include', `/#/daily-reports/${reportId}`, { timeout: 15000 });
    });

    it('目標の関連付けを変更しても他のフィールドに影響しないこと', () => {
      cy.visit(`http://localhost:4200/#/daily-reports/${reportId}/edit`);

      // ページが読み込まれるまで待機
      cy.get('textarea#events').should('be.visible');

      // 既存のフィールドの値を確認
      cy.get('textarea#events').should('have.value', '編集テスト用の日報');

      // 目標を追加
      cy.get('app-goal-multi-select-field').find('input[type="text"]').click();
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').should('be.visible');
      cy.get('app-goal-multi-select-field').find('.goal-multi-select-field__dropdown').contains('テスト目標2').click();

      // 他のフィールドの値が変更されていないことを確認
      cy.get('textarea#events').should('have.value', '編集テスト用の日報');

      // 保存
      cy.get('button[type="submit"]').click();
      cy.url().should('include', `/#/daily-reports/${reportId}`, { timeout: 15000 });
    });
  });
});


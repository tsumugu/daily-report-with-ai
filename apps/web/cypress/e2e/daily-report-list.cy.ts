describe('日報一覧・詳細画面', () => {
  // テスト用のパスワード（共通）
  const testPassword = 'TestPassword123!';
  let uniqueEmail: string;

  beforeEach(() => {
    // 各テストで一意のメールアドレスを生成
    uniqueEmail = `e2e-list-${Cypress._.random(0, 1e6)}@example.com`;

    // サインアップしてログイン状態にする
    cy.visit('http://localhost:4200/signup');

    // ページが読み込まれるまで待機
    cy.get('input#email').should('be.visible');

    // フォーム入力
    cy.get('input#email').type(uniqueEmail);
    cy.get('input#password').type(testPassword);
    cy.get('input#confirmPassword').type(testPassword);

    // サブミットボタンをクリック
    cy.get('button[type="submit"]').click();

    // ホーム画面に遷移するまで待機
    cy.url().should('eq', 'http://localhost:4200/', { timeout: 15000 });
  });

  it('ホーム画面から日報一覧画面に遷移できること', () => {
    // 日報一覧リンクをクリック
    cy.get('a[href="/daily-reports"]').click();

    // 日報一覧画面に遷移したことを確認
    cy.url().should('eq', 'http://localhost:4200/daily-reports');
    cy.get('.page-title').should('contain.text', '日報一覧');
  });

  it('日報がない場合は空状態が表示されること', () => {
    cy.visit('http://localhost:4200/daily-reports');

    // 空状態が表示されることを確認（app-empty-stateコンポーネントを使用）
    cy.contains('まだ日報がありません').should('be.visible', { timeout: 10000 });
  });

  it('日報を作成後、一覧に表示されること', () => {
    // 日報を作成
    cy.visit('http://localhost:4200/daily-reports/new');
    cy.get('textarea#events').should('be.visible');
    cy.get('textarea#events').type('E2Eテストで作成した日報です');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:4200/daily-reports', { timeout: 15000 });

    // 一覧画面に日報が表示されていることを確認
    cy.get('.report-card').should('be.visible');
    cy.get('.report-card__content').should('contain.text', 'E2Eテストで作成した日報です');
  });

  it('日報カードをクリックすると詳細画面に遷移すること', () => {
    // 日報を作成
    cy.visit('http://localhost:4200/daily-reports/new');
    cy.get('textarea#events').should('be.visible');
    cy.get('textarea#events').type('詳細確認用の日報');
    cy.get('textarea#learnings').type('テストの学び');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:4200/daily-reports', { timeout: 15000 });

    // 日報カードをクリック
    cy.get('.report-card').click();

    // 詳細画面に遷移したことを確認
    cy.url().should('match', /\/daily-reports\/[a-z0-9-]+/);
    cy.get('.report-detail').should('be.visible');
  });

  it('詳細画面で日報の内容が表示されること', () => {
    // 日報を作成
    cy.visit('http://localhost:4200/daily-reports/new');
    cy.get('textarea#events').should('be.visible');
    cy.get('textarea#events').type('詳細表示テストのできごと');
    cy.get('textarea#learnings').type('詳細表示テストの学び');

    // よかったことを追加
    cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
    cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
    cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('良いテストを書けた');
    cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').last().type('集中できたから');

    // 改善点を追加
    cy.contains('.form-group', '改善点').find('button:contains("追加")').click();
    cy.contains('.form-group', '改善点').find('.form-card').should('be.visible');
    cy.contains('.form-group', '改善点').find('.form-card').first().find('textarea').first().type('もっとテストを書く');
    cy.contains('.form-group', '改善点').find('.form-card').first().find('textarea').last().type('毎日コツコツやる');

    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:4200/daily-reports', { timeout: 15000 });

    // 詳細画面に遷移
    cy.get('.report-card').click();
    cy.get('.report-detail').should('be.visible');

    // 内容が表示されていることを確認
    cy.get('.content-text').first().should('contain.text', '詳細表示テストのできごと');

    // よかったことが表示されていることを確認
    cy.contains('.section', 'よかったこと').find('.item-card').should('be.visible');
    cy.contains('.section', 'よかったこと').find('.item-content').should('contain.text', '良いテストを書けた');

    // 改善点が表示されていることを確認
    cy.contains('.section', '改善点').find('.item-card').should('be.visible');
    cy.contains('.section', '改善点').find('.item-content').should('contain.text', 'もっとテストを書く');
  });

  it('詳細画面から一覧画面に戻れること', () => {
    // 日報を作成
    cy.visit('http://localhost:4200/daily-reports/new');
    cy.get('textarea#events').should('be.visible');
    cy.get('textarea#events').type('戻るボタンテスト');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:4200/daily-reports', { timeout: 15000 });

    // 詳細画面に遷移
    cy.get('.report-card').click();
    cy.get('.back-button').should('be.visible');

    // 戻るボタンをクリック
    cy.get('.back-button').click();

    // 一覧画面に戻ったことを確認
    cy.url().should('eq', 'http://localhost:4200/daily-reports');
  });

  it('一覧画面から日報入力画面に遷移できること', () => {
    cy.visit('http://localhost:4200/daily-reports');

    // 日報を書くボタンをクリック
    cy.get('.new-report-button').click();

    // 日報入力画面に遷移したことを確認
    cy.url().should('eq', 'http://localhost:4200/daily-reports/new');
  });

  it('よかったことがある日報にはバッジが表示されること', () => {
    // よかったこと付きの日報を作成
    cy.visit('http://localhost:4200/daily-reports/new');
    cy.get('textarea#events').should('be.visible');
    cy.get('textarea#events').type('バッジテスト用日報');

    // よかったことを追加
    cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
    cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
    cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('よかったこと');

    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:4200/daily-reports', { timeout: 15000 });

    // よかったことバッジが表示されていることを確認
    cy.get('.report-card__badge--good').should('be.visible');
    cy.get('.report-card__badge--good').should('have.attr', 'title', 'よかったこと有り');
  });

  it('改善点がある日報にはバッジが表示されること', () => {
    // 改善点付きの日報を作成
    cy.visit('http://localhost:4200/daily-reports/new');
    cy.get('textarea#events').should('be.visible');
    cy.get('textarea#events').type('改善点バッジテスト');

    // 改善点を追加
    cy.contains('.form-group', '改善点').find('button:contains("追加")').click();
    cy.contains('.form-group', '改善点').find('.form-card').should('be.visible');
    cy.contains('.form-group', '改善点').find('.form-card').first().find('textarea').first().type('改善点');

    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:4200/daily-reports', { timeout: 15000 });

    // 改善点バッジが表示されていることを確認
    cy.get('.report-card__badge--improvement').should('be.visible');
    cy.get('.report-card__badge--improvement').should('have.attr', 'title', '改善点有り');
  });

  it('よかったこと・改善点のサマリーが表示されること', () => {
    // よかったこと・改善点付きの日報を作成
    cy.visit('http://localhost:4200/daily-reports/new');
    cy.get('textarea#events').should('be.visible');
    cy.get('textarea#events').type('サマリーテスト用日報');

    // よかったことを2件追加
    cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
    cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
    cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('よかったこと1');

    cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
    cy.contains('.form-group', 'よかったこと').find('.form-card').should('have.length', 2);
    cy.contains('.form-group', 'よかったこと').find('.form-card').last().find('textarea').first().type('よかったこと2');

    // 改善点を1件追加
    cy.contains('.form-group', '改善点').find('button:contains("追加")').click();
    cy.contains('.form-group', '改善点').find('.form-card').should('be.visible');
    cy.contains('.form-group', '改善点').find('.form-card').first().find('textarea').first().type('改善点1');

    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:4200/daily-reports', { timeout: 15000 });

    // サマリーセクションが表示されていることを確認
    cy.get('.report-card__summary').should('be.visible');

    // よかったことサマリーが表示されていることを確認
    cy.get('.report-card__summary').should('contain.text', 'よかったこと');
    cy.get('.report-card__summary').should('contain.text', '2件');

    // 改善点サマリーが表示されていることを確認
    cy.get('.report-card__summary').should('contain.text', '改善点');
    cy.get('.report-card__summary').should('contain.text', '1件');
  });

  it('よかったこと・改善点が0件の場合、サマリーセクションが表示されないこと', () => {
    // よかったこと・改善点なしの日報を作成
    cy.visit('http://localhost:4200/daily-reports/new');
    cy.get('textarea#events').should('be.visible');
    cy.get('textarea#events').type('サマリーなしテスト');

    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:4200/daily-reports', { timeout: 15000 });

    // サマリーセクションが表示されないことを確認
    cy.get('.report-card__summary').should('not.exist');
  });
});


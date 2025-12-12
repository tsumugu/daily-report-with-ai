describe('日報入力画面', () => {
  // テスト用のパスワード（共通）
  const testPassword = 'TestPassword123!';

  beforeEach(() => {
    // 各テストで一意のメールアドレスを生成
    const uniqueEmail = `e2e-${Cypress._.random(0, 1e6)}@example.com`;
    
    // サインアップしてログイン状態にする
    cy.visit('http://localhost:4200/signup');
    
    // ページが読み込まれるまで待機
    cy.get('input#email').should('be.visible');
    
    // フォーム入力（内部のinput要素を正確にセレクト）
    cy.get('input#email').type(uniqueEmail);
    cy.get('input#password').type(testPassword);
    cy.get('input#confirmPassword').type(testPassword);
    
    // サブミットボタンをクリック
    cy.get('button[type="submit"]').click();

    // ホーム画面に遷移するまで待機
    cy.url().should('eq', 'http://localhost:4200/', { timeout: 15000 });
  });

  it('ホーム画面から日報入力画面に遷移できること', () => {
    // 日報入力リンクをクリック
    cy.get('a[href="/daily-reports/new"]').click();

    // 日報入力画面に遷移したことを確認
    cy.url().should('eq', 'http://localhost:4200/daily-reports/new');
    cy.get('h1').should('contain.text', '日報を書く');
  });

  it('日報を入力して保存できること', () => {
    cy.visit('http://localhost:4200/daily-reports/new');
    
    // ページが読み込まれるまで待機（id セレクタを使用）
    cy.get('textarea#events').should('be.visible');

    // フォームに入力
    cy.get('textarea#events').type('今日はE2Eテストを書きました');
    cy.get('textarea#learnings').type('Playwrightの使い方を学びました');

    // よかったことを追加
    cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
    cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
    cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('テストが通った');
    cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').last().type('丁寧に書いたから');

    // 改善点を追加
    cy.contains('.form-group', '改善点').find('button:contains("追加")').click();
    cy.contains('.form-group', '改善点').find('.form-card').should('be.visible');
    cy.contains('.form-group', '改善点').find('.form-card').first().find('textarea').first().type('テストカバレッジを上げる');
    cy.contains('.form-group', '改善点').find('.form-card').first().find('textarea').last().type('エッジケースも網羅する');

    // 保存ボタンをクリック
    cy.get('button[type="submit"]').click();

    // 日報一覧画面に遷移したことを確認
    cy.url().should('eq', 'http://localhost:4200/daily-reports', { timeout: 15000 });
  });

  it('必須項目が未入力の場合、保存できないこと', () => {
    cy.visit('http://localhost:4200/daily-reports/new');
    
    // ページが読み込まれるまで待機
    cy.get('button[type="submit"]').should('be.visible');

    // できごとを空のまま保存ボタンをクリック
    cy.get('button[type="submit"]').click();

    // エラーメッセージが表示されること（textarea-field__error クラスを使用）
    cy.get('.textarea-field__error').should('be.visible');
  });

  it('文字数カウントが正しく表示されること', () => {
    cy.visit('http://localhost:4200/daily-reports/new');
    
    // ページが読み込まれるまで待機（id セレクタを使用）
    cy.get('textarea#events').should('be.visible');

    // できごとに入力
    cy.get('textarea#events').type('テスト');

    // 文字数カウントが更新されること（textarea-field__char-count クラスを使用）
    cy.get('.textarea-field__char-count').first().should('contain.text', '3/1000');
  });

  it('よかったことを複数追加・削除できること', () => {
    cy.visit('http://localhost:4200/daily-reports/new');
    
    // ページが読み込まれるまで待機
    cy.get('button:contains("追加")').should('be.visible');

    // よかったことセクションの追加ボタン
    cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').as('addGoodPointButton');
    
    // よかったことを2つ追加（form-card クラスを使用）
    cy.get('@addGoodPointButton').click();
    cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
    cy.get('@addGoodPointButton').click();

    // カードが2つあることを確認
    cy.contains('.form-group', 'よかったこと').find('.form-card').should('have.length', 2);

    // 1つ削除（form-card__remove クラスを使用）
    cy.contains('.form-group', 'よかったこと').find('.form-card__remove').first().click();

    // カードが1つになったことを確認
    cy.contains('.form-group', 'よかったこと').find('.form-card').should('have.length', 1);
  });

  it('改善点を複数追加・削除できること', () => {
    cy.visit('http://localhost:4200/daily-reports/new');
    
    // ページが読み込まれるまで待機
    cy.get('button:contains("追加")').should('be.visible');

    // 改善点セクションの追加ボタン
    cy.contains('.form-group', '改善点').find('button:contains("追加")').as('addImprovementButton');
    
    // 改善点を2つ追加（form-card クラスを使用）
    cy.get('@addImprovementButton').click();
    cy.contains('.form-group', '改善点').find('.form-card').should('be.visible');
    cy.get('@addImprovementButton').click();

    // カードが2つあることを確認
    cy.contains('.form-group', '改善点').find('.form-card').should('have.length', 2);

    // 1つ削除（form-card__remove クラスを使用）
    cy.contains('.form-group', '改善点').find('.form-card__remove').first().click();

    // カードが1つになったことを確認
    cy.contains('.form-group', '改善点').find('.form-card').should('have.length', 1);
  });

  it('戻るボタンで前の画面に戻れること', () => {
    cy.visit('http://localhost:4200/daily-reports/new');
    
    // ページが読み込まれるまで待機
    cy.get('.back-link').should('be.visible');

    // 戻るボタンをクリック
    cy.get('.back-link').click();

    // 日報一覧画面に遷移したことを確認
    cy.url().should('eq', 'http://localhost:4200/daily-reports');
  });

  it('同じ日付の日報が既に存在する場合、エラーが表示されること', () => {
    cy.visit('http://localhost:4200/daily-reports/new');
    
    // ページが読み込まれるまで待機（id セレクタを使用）
    cy.get('textarea#events').should('be.visible');

    // 1回目の日報を保存
    cy.get('textarea#events').type('1回目の日報');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:4200/daily-reports', { timeout: 15000 });

    // 再度日報入力画面に遷移
    cy.visit('http://localhost:4200/daily-reports/new');
    cy.get('textarea#events').should('be.visible');

    // 同じ日付で2回目の日報を保存しようとする
    cy.get('textarea#events').type('2回目の日報');
    cy.get('button[type="submit"]').click();

    // エラーメッセージが表示されること
    cy.get('app-alert-banner').should('be.visible', { timeout: 15000 });
    cy.get('app-alert-banner').should('contain.text', '既に存在');
  });
});


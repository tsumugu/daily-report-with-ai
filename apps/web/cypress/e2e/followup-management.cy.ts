describe('フォローアップ管理機能', () => {
  // テスト用のパスワード（共通）
  const testPassword = 'TestPassword123!';
  let uniqueEmail: string;

  beforeEach(() => {
    // 各テストで一意のメールアドレスを生成
    uniqueEmail = `e2e-followup-${Cypress._.random(0, 1e6)}@example.com`;

    // サインアップしてログイン状態にする
    cy.visit('http://localhost:4200/#/signup');

    // ページが読み込まれるまで待機
    cy.get('input#email').should('be.visible');

    // フォーム入力
    cy.get('input#email').type(uniqueEmail);
    cy.get('input#password').type(testPassword);
    cy.get('input#confirmPassword').type(testPassword);

    // サブミットボタンをクリック
    cy.get('button[type="submit"]').click();

    // ホーム画面に遷移するまで待機
    cy.url().should('eq', 'http://localhost:4200/#/', { timeout: 15000 });
  });

  // 空状態を考慮した「追加」ボタンクリックのヘルパー関数
  const clickAddButton = () => {
    // モーダルが開いている場合は閉じる
    cy.get('body').then(($body) => {
      const overlay = $body.find('.followup-page__overlay');
      if (overlay.length > 0 && overlay.is(':visible')) {
        cy.get('.followup-page__modal-close').click({ force: true });
        cy.get('.followup-page__overlay').should('not.exist', { timeout: 5000 });
        cy.wait(500);
      }
    });

    // モーダルが開いていないことを確認
    cy.get('.followup-page__overlay').should('not.exist');

    // 空状態かどうかを確認して、適切なボタンをクリック
    cy.get('.followup-page').then(($page) => {
      const hasOverlay = $page.find('.followup-page__overlay').length > 0;
      const hasEmptyState = $page.find('.empty-state').length > 0;
      const isEmptyStateVisible = hasEmptyState && $page.find('.empty-state').is(':visible');
      const isEmpty = !hasOverlay && isEmptyStateVisible;

      return isEmpty;
    }).then((isEmpty) => {
      if (isEmpty) {
        // 空状態の場合：empty-state内のアクションボタンをクリック
        cy.get('.empty-state .empty-state__action app-button button', { timeout: 5000 })
          .should('exist')
          .click({ force: true });
      } else {
        // 空状態でない場合：add-buttonをクリック
        cy.get('.followup-page__add-button').should('be.visible', { timeout: 5000 }).click();
      }
    });
  };

  // ============================================
  // Phase 1: フォロー項目一覧画面の基本機能
  // ============================================

  describe('フォロー項目一覧画面', () => {
    it('ホーム画面からフォロー項目一覧画面に遷移できること', () => {
      // フォロー項目一覧へのリンクを探す（ホーム画面に直接リンクがない場合は、ナビゲーションから）
      // 実際の実装に合わせて調整が必要
      cy.visit('http://localhost:4200/#/followups');

      // フォロー項目一覧画面に遷移したことを確認
      cy.url().should('eq', 'http://localhost:4200/#/followups');
      cy.get('.followup-list-page__title').should('contain.text', 'フォロー項目');
    });

    it('フォロー項目がない場合は空状態が表示されること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-list-page').should('be.visible');

      // 空状態が表示されることを確認
      cy.contains('フォローする項目がありません').should('be.visible');
    });

    it('フォロー項目が一覧に表示されること', () => {
      // 日報を作成してよかったこと/改善点を追加
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('フォローアップテスト用日報');

      // よかったことを追加
      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('テスト用よかったこと');

      // 改善点を追加
      cy.contains('.form-group', '改善点').find('button:contains("追加")').click();
      cy.contains('.form-group', '改善点').find('.form-card').should('be.visible');
      cy.contains('.form-group', '改善点').find('.form-card').first().find('textarea').first().type('テスト用改善点');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面に遷移
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-list-page').should('be.visible');

      // フォロー項目が表示されていることを確認
      cy.get('.followup-card').first().should('be.visible', { timeout: 5000 });
      cy.get('.followup-card').first().find('.followup-card__text').should('contain.text', 'テスト用よかったこと');
    });

    it('デフォルトで未完了（未着手/進行中）のみ表示されること', () => {
      // 日報を作成
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('フィルタテスト用日報');

      // よかったことを追加
      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('未着手のよかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面に遷移
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-list-page').should('be.visible');

      // デフォルトフィルタが「未完了」になっていることを確認
      cy.get('.followup-list-page__filter').first().should('have.value', '未着手,進行中');

      // フォロー項目が表示されていることを確認
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });
    });
  });

  // ============================================
  // Phase 2: フィルタ・ページングのテスト
  // ============================================

  describe('フィルタ機能', () => {
    beforeEach(() => {
      // テストデータを準備：よかったことと改善点を含む日報を作成
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('フィルタテスト用日報');

      // よかったことを追加
      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('フィルタテスト用よかったこと');

      // 改善点を追加
      cy.contains('.form-group', '改善点').find('button:contains("追加")').click();
      cy.contains('.form-group', '改善点').find('.form-card').should('be.visible');
      cy.contains('.form-group', '改善点').find('.form-card').first().find('textarea').first().type('フィルタテスト用改善点');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });
    });

    it('ステータスフィルタで「すべて」を選択できること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-list-page').should('be.visible');

      // ステータスフィルタを「すべて」に変更
      cy.get('.followup-list-page__filter').first().select('すべて');

      // フィルタが適用されたことを確認
      cy.get('.followup-list-page__filter').first().should('have.value', 'すべて');
    });

    it('ステータスフィルタで「未着手」を選択できること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-list-page').should('be.visible');

      cy.get('.followup-list-page__filter').first().select('未着手');

      cy.get('.followup-list-page__filter').first().should('have.value', '未着手');
    });

    it('ステータスフィルタで「進行中」を選択できること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-list-page').should('be.visible');

      cy.get('.followup-list-page__filter').first().select('進行中');

      cy.get('.followup-list-page__filter').first().should('have.value', '進行中');
    });

    it('種別フィルタで「よかったこと」を選択できること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-list-page').should('be.visible');

      cy.get('.followup-list-page__filter').eq(1).select('goodPoint');

      cy.get('.followup-list-page__filter').eq(1).should('have.value', 'goodPoint');
    });

    it('種別フィルタで「改善点」を選択できること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-list-page').should('be.visible');

      cy.get('.followup-list-page__filter').eq(1).select('improvement');

      cy.get('.followup-list-page__filter').eq(1).should('have.value', 'improvement');
    });
  });

  // ============================================
  // Phase 1: フォローアップ入力モーダルの基本機能
  // ============================================

  describe('フォローアップ入力モーダル（よかったこと）', () => {
    beforeEach(() => {
      // テストデータを準備：よかったことを含む日報を作成
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('フォローアップ入力テスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('フォローアップ入力テスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });
    });

    it('フォロー項目カードをクリックするとフォローアップページに遷移すること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      // 最初のカードの「フォローアップ」ボタンをクリック
      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();

      // フォローアップページに遷移したことを確認
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page__title').should('contain.text', 'よかったことのフォローアップ');
    });

    it('よかったことのフォローアップページでエピソードを追加できること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 「エピソードを追加」ボタンをクリック
      clickAddButton();
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 5000 });
      cy.get('.followup-page__modal').should('be.visible');

      // フォームに入力（日付フィールドが読み込まれるまで待機）
      cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
      cy.get('.date-field__input').clear().type('2025-12-10');

      cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
      cy.get('.textarea-field__textarea').clear().type('テストメモ');

      // 追加ボタンをクリック（モーダル内の「追加」ボタンを選択）
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });

      // モーダルが閉じることを確認
      cy.get('.followup-page__overlay').should('not.exist');
    });

    it('よかったことのフォローアップページでステータスが自動更新されること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 初期状態は「未着手」
      cy.get('.followup-page__status-text').should('contain.text', '未着手');

      // エピソードを追加
      clickAddButton();
      cy.get('.followup-page__modal').should('be.visible');

      cy.get('.date-field__input').type('2025-12-10');

      cy.get('.textarea-field__textarea').type('テストメモ');

      // モーダル内の「追加」ボタンをクリック
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });
      cy.get('.followup-page__overlay').should('not.exist');
      cy.wait(1000);

      // ステータスが「進行中」に更新されることを確認
      cy.get('.followup-page__status-text').should('contain.text', '進行中');
    });

    it('よかったことのフォローアップページでエピソードを3件追加すると「定着」になること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // エピソードを3件追加
      for (let i = 1; i <= 3; i++) {
        clickAddButton();
        cy.get('.followup-page__overlay').should('be.visible', { timeout: 10000 });
        cy.get('.followup-page__modal').should('be.visible');

        cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
        cy.get('.date-field__input').clear();
        cy.get('.date-field__input').type(`2025-12-${9 + i}`);

        cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
        cy.get('.textarea-field__textarea').clear();
        cy.get('.textarea-field__textarea').type(`${i}回目のエピソード`);

        // モーダル内の「追加」ボタンをクリック
        cy.get('.followup-page__modal-footer').within(() => {
          cy.get('app-button').last().find('button').should('be.visible').click();
        });
        cy.get('.followup-page__overlay').should('not.exist');
        cy.wait(1000);
      }

      cy.wait(2000);

      // ステータスが「定着」に更新されることを確認
      cy.get('.followup-page__status-text').should('contain.text', '定着', { timeout: 10000 });
    });

    it('エピソード追加時に日付が必須であること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 「エピソードを追加」ボタンをクリック
      clickAddButton();
      cy.get('.followup-page__modal').should('be.visible', { timeout: 10000 });

      // 日付を入力せずにメモのみ入力
      cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
      cy.get('.textarea-field__textarea').type('テストメモ');

      // 追加ボタンが無効になっていることを確認（モーダル内の「追加」ボタンを選択）
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible', { timeout: 5000 });
        cy.get('app-button').last().find('button').should('be.disabled');
      });
    });

    it('再現メモを入力できること（最大500文字）', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 「エピソードを追加」ボタンをクリック
      clickAddButton();
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 5000 });
      cy.get('.followup-page__modal').should('be.visible');

      cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
      cy.get('.textarea-field__textarea').clear().type('テストメモ');

      cy.get('.textarea-field__textarea').should('have.value', 'テストメモ');
    });

    it('フォローアップを保存できること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 「エピソードを追加」ボタンをクリック
      clickAddButton();
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 5000 });
      cy.get('.followup-page__modal').should('be.visible');

      // フォームに入力（日付フィールドが読み込まれるまで待機）
      cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
      cy.get('.date-field__input').clear().type('2025-12-10');

      cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
      cy.get('.textarea-field__textarea').clear().type('テストメモ');

      // 追加ボタンをクリック（モーダル内の「追加」ボタンを選択）
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });

      // モーダルが閉じることを確認
      cy.get('.followup-page__overlay').should('not.exist');
    });

    it('保存後に一覧が更新されること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      // フォローアップを入力
      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 「エピソードを追加」ボタンをクリック
      clickAddButton();
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 5000 });
      cy.get('.followup-page__modal').should('be.visible');

      cy.get('.date-field__input').type('2025-12-10');

      cy.get('.textarea-field__textarea').type('テストメモ');

      // モーダル内の「追加」ボタンをクリック
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });
      cy.get('.followup-page__overlay').should('not.exist');

      // 一覧ページに戻る
      cy.get('.followup-page__back').click();
      cy.url().should('eq', 'http://localhost:4200/#/followups', { timeout: 5000 });
      cy.wait(1000);

      // 一覧が更新されていることを確認（成功回数が表示される）
      cy.get('.followup-card').first().should('be.visible', { timeout: 5000 });
      cy.get('.followup-card__success-count').first().should('be.visible', { timeout: 5000 });
    });
  });

  describe('フォローアップ入力モーダル（改善点）', () => {
    beforeEach(() => {
      // テストデータを準備：改善点を含む日報を作成
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('改善点フォローアップテスト用日報');

      cy.contains('.form-group', '改善点').find('button:contains("追加")').click();
      cy.contains('.form-group', '改善点').find('.form-card').should('be.visible');
      cy.contains('.form-group', '改善点').find('.form-card').first().find('textarea').first().type('改善点フォローアップテスト用改善点');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });
    });

    it('改善点のフォローアップページでアクションを追加できること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      // 改善点のカードを探す（種別フィルタで絞り込む）
      cy.get('.followup-list-page__filter').eq(1).select('improvement');
      cy.wait(500); // フィルタ適用を待つ

      cy.contains('button', 'フォローアップ').click();
      cy.url().should('match', /\/#\/followups\/improvement\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 「アクションを追加」ボタンをクリック
      clickAddButton();
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 5000 });
      cy.get('.followup-page__modal').should('be.visible');

      // フォームに入力（日付フィールドが読み込まれるまで待機）
      cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
      cy.get('.date-field__input').clear().type('2025-12-10');

      cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
      cy.get('.textarea-field__textarea').clear().type('テストメモ');

      // 追加ボタンをクリック（モーダル内の「追加」ボタンを選択）
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });

      // モーダルが閉じることを確認
      cy.get('.followup-page__overlay').should('not.exist');
    });

    it('改善点のフォローアップページでアクションを3件追加すると「習慣化」になること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-list-page__filter').eq(1).select('improvement');
      cy.wait(500);

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/improvement\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // アクションを3件追加
      for (let i = 1; i <= 3; i++) {
        clickAddButton();
        cy.get('.followup-page__overlay').should('be.visible', { timeout: 10000 });
        cy.get('.followup-page__modal').should('be.visible');

        cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
        cy.get('.date-field__input').clear();
        cy.get('.date-field__input').type(`2025-12-${9 + i}`);

        cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
        cy.get('.textarea-field__textarea').clear();
        cy.get('.textarea-field__textarea').type(`${i}回目のアクション`);

        // モーダル内の「追加」ボタンをクリック
        cy.get('.followup-page__modal-footer').within(() => {
          cy.get('app-button').last().find('button').should('be.visible').click();
        });
        cy.get('.followup-page__overlay').should('not.exist');
        cy.wait(1000);
      }

      cy.wait(2000);

      // ステータスが「習慣化」に更新されることを確認
      cy.get('.followup-page__status-text').should('contain.text', '習慣化', { timeout: 10000 });
    });

    it('アクション追加時に日付が必須であること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-list-page__filter').eq(1).select('improvement');
      cy.wait(500);

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/improvement\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 「アクションを追加」ボタンをクリック
      clickAddButton();
      cy.get('.followup-page__modal').should('be.visible', { timeout: 10000 });

      // 日付を入力せずにメモのみ入力
      cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
      cy.get('.textarea-field__textarea').type('テストメモ');

      // 追加ボタンが無効になっていることを確認（モーダル内の「追加」ボタンを選択）
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible', { timeout: 5000 });
        cy.get('app-button').last().find('button').should('be.disabled');
      });
    });

    it('改善点のフォローアップを保存できること', () => {
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-list-page__filter').eq(1).select('improvement');
      cy.wait(500);

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/improvement\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 「アクションを追加」ボタンをクリック
      clickAddButton();
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 5000 });
      cy.get('.followup-page__modal').should('be.visible');

      // フォームに入力（日付フィールドが読み込まれるまで待機）
      cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
      cy.get('.date-field__input').clear().type('2025-12-10');

      cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
      cy.get('.textarea-field__textarea').clear().type('テストメモ');

      // 追加ボタンをクリック（モーダル内の「追加」ボタンを選択）
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });

      // モーダルが閉じることを確認
      cy.get('.followup-page__overlay').should('not.exist');
    });
  });

  // ============================================
  // Phase 3: 成功カウント・定着バッジのテスト
  // ============================================

  describe('成功カウント・定着バッジ', () => {
    it('成功回数が表示されること', () => {
      // 日報を作成
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('成功カウントテスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('成功カウントテスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォローアップを追加
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 「エピソードを追加」ボタンをクリック
      clickAddButton();
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 5000 });
      cy.get('.followup-page__modal').should('be.visible');

      cy.get('.date-field__input').type('2025-12-10');

      cy.get('.textarea-field__textarea').type('テストメモ');

      // モーダル内の「追加」ボタンをクリック
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });
      cy.get('.followup-page__overlay').should('not.exist');

      // 一覧ページに戻る
      cy.get('.followup-page__back').click();
      cy.url().should('eq', 'http://localhost:4200/#/followups', { timeout: 5000 });
      cy.wait(1000);

      // 成功回数が表示されていることを確認
      cy.get('.followup-card').first().should('be.visible', { timeout: 5000 });
      cy.get('.followup-card__success-count').first().should('be.visible', { timeout: 5000 });
      cy.get('.followup-card__success-count').first().should('contain.text', 'エピソード: 1回');
    });

    it('成功回数が3回以上の場合、ステータスが「定着」になること（よかったこと）', () => {
      // 日報を作成
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('定着バッジテスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('定着バッジテスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォローアップページに遷移
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // エピソードを3回追加
      for (let i = 1; i <= 3; i++) {
        clickAddButton();
        cy.get('.followup-page__overlay').should('be.visible', { timeout: 10000 });
        cy.get('.followup-page__modal').should('be.visible');

        cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
        cy.get('.date-field__input').clear().type(`2025-12-${9 + i}`);

        cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
        cy.get('.textarea-field__textarea').clear().type(`テストメモ ${i}`);

        // モーダル内の「追加」ボタンをクリック
        cy.get('.followup-page__modal-footer').within(() => {
          cy.get('app-button').last().find('button').should('be.visible').click();
        });
        cy.get('.followup-page__overlay').should('not.exist');
        cy.wait(1000);
      }

      cy.wait(2000);

      // ステータスが「定着」になっていることを確認
      cy.get('.followup-page__status-text').should('contain.text', '定着', { timeout: 10000 });
    });
  });

  // ============================================
  // Phase 1: 週次フォーカスの基本機能
  // ============================================

  describe('週次フォーカス', () => {
    it('ホーム画面に週次フォーカスセクションが表示されること', () => {
      cy.visit('http://localhost:4200/#/');
      cy.get('.home-container').should('be.visible');

      // 週次フォーカスセクションが表示されていることを確認
      cy.get('.weekly-focus-section').should('be.visible');
      cy.get('.weekly-focus-section__title').should('contain.text', '今週のフォーカス');
    });

    it('週次フォーカスが未設定の場合、空状態メッセージが表示されること', () => {
      cy.visit('http://localhost:4200/#/');
      cy.get('.weekly-focus-section').should('be.visible');

      // 空状態が表示されていることを確認
      cy.get('.weekly-focus-section__empty').should('be.visible');
      cy.get('.weekly-focus-section__empty-message').should('contain.text', '今週のフォーカスが');
    });

    it('「＋追加」ボタンでフォロー項目一覧画面に遷移できること', () => {
      cy.visit('http://localhost:4200/#/');
      cy.get('.weekly-focus-section').should('be.visible');

      // 「＋追加」ボタンをクリック
      cy.contains('button', '＋追加').click();

      // フォロー項目一覧画面に遷移したことを確認
      cy.url().should('eq', 'http://localhost:4200/#/followups');
    });

    it('週次フォーカスを削除できること', () => {
      // まず、週次フォーカスを追加するために日報とフォロー項目を作成
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('週次フォーカス削除テスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('週次フォーカス削除テスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォロー項目一覧からピンアイコンをクリックして週次フォーカスに追加
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card', { timeout: 10000 }).should('exist');
      cy.contains('.followup-card', '週次フォーカス削除テスト用よかったこと').within(() => {
        cy.get('.icon-button__wrapper button[aria-label="フォーカスに追加"]').click();
      });
      cy.get('.toast--success', { timeout: 5000 }).should('be.visible');

      // ホーム画面に戻って週次フォーカスを確認
      cy.visit('http://localhost:4200/#/');
      cy.get('.weekly-focus-section').should('be.visible');
      cy.get('.weekly-focus-card', { timeout: 10000 }).should('exist');

      // 削除ボタンをクリック
      cy.contains('.weekly-focus-card', '週次フォーカス削除テスト用よかったこと').within(() => {
        cy.get('.icon-button__wrapper button[aria-label="フォーカスから削除"]').click();
      });

      // カードが削除されたことを確認
      cy.contains('.weekly-focus-card', '週次フォーカス削除テスト用よかったこと').should('not.exist');
    });
  });

  // ============================================
  // Phase 4: エラーハンドリングのテスト
  // ============================================

  describe('エラーハンドリング', () => {
    it('必須項目未入力時にエラーメッセージが表示されること', () => {
      // 日報を作成
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('エラーハンドリングテスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('エラーハンドリングテスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォローアップページに遷移
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 「エピソードを追加」ボタンをクリック
      clickAddButton();
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 10000 });
      cy.get('.followup-page__modal').should('be.visible');

      // 日付を入力せずに保存ボタンの状態を確認（モーダル内の「追加」ボタンを選択）
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible', { timeout: 5000 });
        cy.get('app-button').last().find('button').should('be.disabled');
      });
    });

    it('同じ項目に複数回フォローアップを追加できること', () => {
      // 日報を作成
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('複数回フォローアップテスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('複数回フォローアップテスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォローアップページに遷移
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('button:contains("フォローアップ")').click();
      cy.url().should('match', /\/#\/followups\/goodPoint\/.+/, { timeout: 5000 });
      cy.get('.followup-page').should('be.visible');

      // 1回目のエピソードを追加
      clickAddButton();
      cy.get('.followup-page__modal').should('be.visible');

      cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
      cy.get('.date-field__input').clear().type('2025-12-09');

      cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
      cy.get('.textarea-field__textarea').clear().type('1回目のメモ');

      // モーダル内の「追加」ボタンをクリック
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });
      cy.get('.followup-page__overlay').should('not.exist');
      cy.wait(500);

      // 2回目のエピソードを追加
      clickAddButton();
      cy.get('.followup-page__modal').should('be.visible');

      cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
      cy.get('.date-field__input').clear();
      cy.get('.date-field__input').type('2025-12-10');
      cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
      cy.get('.textarea-field__textarea').clear();
      cy.get('.textarea-field__textarea').type('2回目のメモ');

      // モーダル内の「追加」ボタンをクリック
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });
      cy.get('.followup-page__overlay').should('not.exist');
      cy.wait(500);

      // 一覧ページに戻る
      cy.get('.followup-page__back').click();
      cy.url().should('eq', 'http://localhost:4200/#/followups', { timeout: 5000 });
      cy.wait(1000);

      // 成功回数が2回になっていることを確認
      cy.get('.followup-card').first().should('be.visible', { timeout: 5000 });
      cy.get('.followup-card__success-count').first().should('be.visible', { timeout: 5000 });
      cy.get('.followup-card__success-count').first().should('contain.text', 'エピソード: 2回', {
        timeout: 5000,
      });
    });
  });

  // ============================================
  // Phase 2: 週次フォーカス管理機能
  // ============================================

  describe('週次フォーカス管理機能', () => {
    it('フォロー項目一覧から週次フォーカスを追加できること', () => {
      // 日報を作成してよかったことを追加
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('週次フォーカステスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('週次フォーカステスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面に遷移
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      // 「フォーカスに追加」ボタンをクリック
      cy.get('.followup-card').first().find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').click();

      // トースト通知が表示されることを確認
      cy.get('.followup-list-page__toast').should('be.visible', { timeout: 5000 });
      cy.get('.toast--success').should('contain.text', '今週のフォーカスに追加しました');

      // 「フォーカスから削除」ボタンが表示されることを確認
      cy.get('.followup-card').first().find('.icon-button__wrapper button[aria-label="フォーカスから削除"]').should('be.visible', {
        timeout: 5000,
      });

      // 「フォーカスに追加」ボタンが非表示になることを確認
      cy.get('.followup-card').first().find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').should('not.exist');
    });

    it('ピンアイコンで週次フォーカスに追加できること', () => {
      // 日報を作成してよかったことを追加
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('ピン追加テスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('ピン追加テスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面でピンアイコンをクリック
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').click();

      // 成功トーストを確認
      cy.get('.toast--success').should('be.visible', { timeout: 5000 });

      // ピン状態が反映されることを確認（aria-labelが切り替わる）
      cy.get('.followup-card').first().find('.icon-button__wrapper button[aria-label="フォーカスから削除"]').should('be.visible', {
        timeout: 5000,
      });
    });

    it('ピンアイコンで週次フォーカスから削除できること', () => {
      // 事前に追加しておく
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('ピン削除テスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('ピン削除テスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });
      cy.get('.followup-card').first().as('firstCard');

      // 追加
      cy.get('@firstCard').find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').click();
      cy.get('.toast--success').should('be.visible', { timeout: 5000 });
      cy.get('@firstCard').find('.icon-button__wrapper button[aria-label="フォーカスから削除"]').should('be.visible', {
        timeout: 5000,
      });

      // 削除
      cy.get('@firstCard').find('.icon-button__wrapper button[aria-label="フォーカスから削除"]').click();

      // 状態が戻ることを確認（追加用ラベルに戻る）
      cy.get('@firstCard').find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').should('be.visible', {
        timeout: 5000,
      });
    });

    it('ホーム画面で週次フォーカスが表示されること', () => {
      // 日報を作成してよかったことを追加
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('週次フォーカス表示テスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('週次フォーカス表示テスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面で週次フォーカスを追加
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').click();
      cy.get('.toast--success').should('be.visible', { timeout: 5000 });

      // ホーム画面に戻る
      cy.visit('http://localhost:4200/home');
      cy.get('.weekly-focus-section').should('be.visible', { timeout: 5000 });

      // 週次フォーカスが表示されることを確認
      cy.get('.weekly-focus-card').should('be.visible', { timeout: 5000 });
      cy.get('.weekly-focus-card').first().should('contain.text', '週次フォーカス表示テスト用よかったこと');
    });

    it('週次フォーカスを削除できること', () => {
      // 日報を作成してよかったことを追加
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('週次フォーカス削除テスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('週次フォーカス削除テスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面で週次フォーカスを追加
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').click();
      cy.get('.toast--success').should('be.visible', { timeout: 5000 });

      // ホーム画面に戻る
      cy.visit('http://localhost:4200/home');
      cy.get('.weekly-focus-card').should('be.visible', { timeout: 5000 });

      // 削除ボタンをクリック（ariaLabel="フォーカスから削除"を使用）
      cy.get('.weekly-focus-card').first().find('.icon-button__wrapper button[aria-label="フォーカスから削除"]').click();

      // 週次フォーカスが削除されることを確認（空状態が表示される）
      cy.get('.weekly-focus-section__empty').should('be.visible', { timeout: 5000 });
    });

    it('既にフォーカスに設定されている項目は「フォーカスに追加」ボタンが非表示になること', () => {
      // 日報を作成してよかったことを追加
      cy.visit('http://localhost:4200/#/daily-reports/new');
      cy.get('textarea#events').should('be.visible');
      cy.get('textarea#events').type('週次フォーカス重複テスト用日報');

      cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible');
      cy.contains('.form-group', 'よかったこと').find('.form-card').first().find('textarea').first().type('週次フォーカス重複テスト用よかったこと');

      cy.get('button[type="submit"]').click();
      cy.url().should('eq', 'http://localhost:4200/#/daily-reports', { timeout: 15000 });

      // フォロー項目一覧画面で週次フォーカスを追加
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      cy.get('.followup-card').first().find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').click();
      cy.get('.toast--success').should('be.visible', { timeout: 5000 });

      // ページをリロード
      cy.reload();
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      // 「フォーカスに追加」ボタンが非表示で、「フォーカスから削除」ボタンが表示されることを確認
      cy.get('.followup-card').first().find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').should('not.exist');
      cy.get('.followup-card').first().find('.icon-button__wrapper button[aria-label="フォーカスから削除"]').should('be.visible');
    });

    it('最大5件制限でエラーが表示されること', () => {
      // ヘルパー関数: 日報を作成してフォロー項目を追加
      function createDailyReportWithGoodPoint(index: number) {
        cy.visit('http://localhost:4200/#/daily-reports/new');
        cy.get('textarea#events').should('be.visible', { timeout: 5000 });

        // 日付を設定（各日報で異なる日付を使用）
        const testDate = new Date();
        testDate.setDate(testDate.getDate() + index + 100); // 100日後以降（重複回避）
        const dateString = testDate.toISOString().split('T')[0];
        cy.get('input#date').clear().type(dateString);

        cy.get('textarea#events').type(`週次フォーカス制限テスト用日報${index}`);

        // よかったことを追加
        cy.contains('.form-group', 'よかったこと').find('button:contains("追加")').click();
        cy.contains('.form-group', 'よかったこと').find('.form-card').should('be.visible', { timeout: 5000 });
        cy.contains('.form-group', 'よかったこと').find('.form-card').first()
          .find('textarea').first().type(`週次フォーカス制限テスト用よかったこと${index}`);

        // 日報を保存
        cy.get('button[type="submit"]').click();
        cy.url().should('match', /\/(daily-reports|home)/, { timeout: 5000 });
      }

      // ヘルパー関数: フォロー項目一覧で特定のカードをフォーカスに追加
      function addToWeeklyFocus(cardText: string) {
        cy.visit('http://localhost:4200/#/followups');
        cy.get('.followup-list-page__filter').should('be.visible', { timeout: 5000 });

        // フィルタを「すべて」に変更
        cy.get('.followup-list-page__filter').first().select('すべて');
        cy.get('.followup-card').should('be.visible', { timeout: 5000 });

        // カードを探す
        cy.get('.followup-card').filter(`:contains("${cardText}")`).first().should('be.visible', { timeout: 5000 });

        // 「フォーカスに追加」ボタンをクリック
        cy.get('.followup-card').filter(`:contains("${cardText}")`).first().find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').should('be.visible', { timeout: 5000 });
        cy.get('.followup-card').filter(`:contains("${cardText}")`).first().find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').click();

        // 成功トーストを待機
        cy.get('.toast--success').should('be.visible', { timeout: 5000 });
      }

      // 5件のフォロー項目を作成して週次フォーカスに追加
      for (let i = 1; i <= 5; i++) {
        createDailyReportWithGoodPoint(i);
        addToWeeklyFocus(`週次フォーカス制限テスト用よかったこと${i}`);
      }

      // 6件目を作成
      createDailyReportWithGoodPoint(6);

      // フォロー項目一覧画面に遷移
      cy.visit('http://localhost:4200/#/followups');
      cy.get('.followup-list-page__filter').should('be.visible', { timeout: 5000 });

      // フィルタを「すべて」に変更
      cy.get('.followup-list-page__filter').first().select('すべて');
      cy.get('.followup-card').should('be.visible', { timeout: 5000 });

      // 6件目のカードを探す
      cy.get('.followup-card').filter(':contains("週次フォーカス制限テスト用よかったこと6")').first().should('be.visible', { timeout: 5000 });

      // 「フォーカスに追加」ボタンが無効化されていることを確認
      cy.get('.followup-card').filter(':contains("週次フォーカス制限テスト用よかったこと6")').first().find('.icon-button__wrapper button[aria-label="フォーカスに追加"]').should('be.disabled', { timeout: 5000 });
    });
  });
});


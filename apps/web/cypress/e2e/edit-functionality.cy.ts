/**
 * 編集機能 E2Eテスト
 *
 * PRD: docs/features/edit-functionality/prd.md
 * UI Design: docs/features/edit-functionality/ui_design.md
 *
 * テスト対象ユーザーストーリー:
 * - US-1: 日報の内容を編集したい
 * - US-2: エピソードの内容を編集したい
 * - US-3: アクションの内容を編集したい
 * - US-4: 編集後に自動的にステータスが更新される
 */

describe('編集機能', () => {
  const baseUrl = 'http://localhost:4200';
  const testPassword = 'TestPassword123!';

  // テスト用ユーティリティ
  const signup = () => {
    const uniqueEmail = `e2e-edit-${Date.now()}@example.com`;
    cy.visit(`${baseUrl}/signup`);
    cy.get('input#email').should('be.visible').type(uniqueEmail);
    cy.get('input#password').type(testPassword);
    cy.get('input#confirmPassword').type(testPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', `${baseUrl}/`, { timeout: 15000 });
  };

  const createDailyReport = () => {
    cy.visit(`${baseUrl}/daily-reports/new`);
    cy.get('textarea#events').should('be.visible').type('テスト用日報');
    cy.get('textarea#learnings').type('テスト用学び');
    cy.contains('.form-group', 'よかったこと').find('button').contains('追加').click();
    cy.contains('.form-group', 'よかったこと')
      .find('.form-card')
      .first()
      .find('textarea')
      .first()
      .type('テスト用よかったこと');
    cy.contains('.form-group', '改善点').find('button').contains('追加').click();
    cy.contains('.form-group', '改善点')
      .find('.form-card')
      .first()
      .find('textarea')
      .first()
      .type('テスト用改善点');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/daily-reports', { timeout: 15000 });
  };

  const navigateToDailyReportDetail = () => {
    cy.visit(`${baseUrl}/daily-reports`);
    cy.get('.report-card', { timeout: 10000 }).should('exist');
    cy.get('.report-card').first().click();
    cy.url().should('include', '/daily-reports/', { timeout: 10000 });
  };

  const navigateToFollowupPage = (itemType: 'goodPoint' | 'improvement', itemContent: string) => {
    cy.visit(`${baseUrl}/followups`);
    // フォローアップリストページが読み込まれるまで待機
    cy.get('.followup-list-page', { timeout: 15000 }).should('be.visible');
    // ローディングが完了するまで待機
    cy.get('.followup-list-page__loading').should('not.exist', { timeout: 15000 });
    // フォローアップカードが表示されるまで待機
    cy.get('.followup-card', { timeout: 15000 }).should('exist').should('be.visible');
    // 特定のコンテンツを含むカードを探す
    cy.contains('.followup-card', itemContent, { timeout: 15000 }).should('be.visible');
    cy.contains('.followup-card', itemContent).within(() => {
      // app-buttonコンポーネント内のテキストを探す
      cy.contains('フォローアップ').should('be.visible', { timeout: 5000 }).click();
    });
    cy.url().should('include', `/followups/${itemType}/`, { timeout: 15000 });
  };

  const addEpisode = (memo: string) => {
    const today = new Date().toISOString().split('T')[0];
    // 空状態の場合はempty-stateのアクションボタン、そうでない場合はadd-buttonを使用
    cy.get('.followup-page').should('be.visible', { timeout: 10000 });
    
    // モーダルが開いている場合は閉じる
    cy.get('body').then(($body) => {
      const overlay = $body.find('.followup-page__overlay');
      if (overlay.length > 0 && overlay.is(':visible')) {
        cy.get('.followup-page__modal-close').click({ force: true });
        cy.get('.followup-page__overlay').should('not.exist', { timeout: 5000 });
        cy.wait(500); // モーダルが閉じるのを待つ
      }
    });
    
    // 空状態かどうかを確認して、適切なボタンをクリック
    // モーダルが開いていないことを確認してから判定
    cy.get('.followup-page__overlay').should('not.exist');
    
    // 空状態かどうかを確認
    cy.get('.followup-page').then(($page) => {
      // モーダルが開いていない、かつ空状態が表示されている場合のみ空状態と判定
      const hasOverlay = $page.find('.followup-page__overlay').length > 0;
      const hasEmptyState = $page.find('.empty-state').length > 0;
      const isEmptyStateVisible = hasEmptyState && $page.find('.empty-state').is(':visible');
      const isEmpty = !hasOverlay && isEmptyStateVisible;
      
      return isEmpty;
    }).then((isEmpty) => {
      if (isEmpty) {
        // 空状態の場合：empty-state内のアクションボタンをクリック
        // .empty-state__action内のapp-button内のbutton要素を直接探す
        cy.get('.empty-state .empty-state__action app-button button', { timeout: 5000 })
          .should('exist')
          .click({ force: true });
      } else {
        // 空状態でない場合：add-buttonをクリック
        cy.get('.followup-page__add-button').should('be.visible', { timeout: 5000 }).click();
      }
    });
    
    // クリック後、モーダルが表示されるまで待機
    cy.get('.followup-page__overlay').should('be.visible', { timeout: 10000 });
    cy.get('.followup-page__modal').should('be.visible', { timeout: 10000 });
    cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
    cy.get('.date-field__input').clear();
    cy.get('.date-field__input').type(today);
    cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
    cy.get('.textarea-field__textarea').clear();
    cy.get('.textarea-field__textarea').type(memo);
    // モーダル内の「追加」ボタンをクリック（モーダルフッター内の最後のapp-buttonを選択）
    cy.get('.followup-page__modal-footer').within(() => {
      cy.get('app-button').last().find('button').should('be.visible').click();
    });
    cy.get('.followup-page__overlay').should('not.exist', { timeout: 5000 });
    cy.wait(500); // データの保存を待つ
  };

  beforeEach(() => {
    signup();
  });

  // ============================================
  // US-1: 日報の内容を編集したい
  // ============================================
  describe('US-1: 日報の編集', () => {
    beforeEach(() => {
      createDailyReport();
    });

    it('日報詳細画面から編集画面に遷移できる', () => {
      navigateToDailyReportDetail();

      // 編集ボタンが表示されていることを確認
      cy.contains('button', '編集する').should('be.visible');

      // 編集ボタンをクリック
      cy.contains('button', '編集する').click();

      // 編集画面に遷移したことを確認
      cy.url().should('include', '/edit', { timeout: 10000 });
      cy.get('h1').should('contain.text', '日報を編集');
    });

    it('既存の日報データがフォームに読み込まれている', () => {
      navigateToDailyReportDetail();
      cy.contains('button', '編集する').click();
      cy.url().should('include', '/edit', { timeout: 10000 });

      // 既存データがフォームに設定されていることを確認
      cy.get('textarea#events').should('have.value', 'テスト用日報');
      cy.get('textarea#learnings').should('have.value', 'テスト用学び');
      cy.contains('.form-group', 'よかったこと')
        .find('.form-card')
        .first()
        .find('textarea')
        .first()
        .should('have.value', 'テスト用よかったこと');
      cy.contains('.form-group', '改善点')
        .find('.form-card')
        .first()
        .find('textarea')
        .first()
        .should('have.value', 'テスト用改善点');
    });

    it('日報の内容を編集して保存できる', () => {
      navigateToDailyReportDetail();
      cy.contains('button', '編集する').click();
      cy.url().should('include', '/edit', { timeout: 10000 });

      // フォームを編集
      cy.get('textarea#events').clear().type('編集後のできごと');
      cy.get('textarea#learnings').clear().type('編集後の学び');

      // 保存ボタンをクリック
      cy.contains('button', '保存する').click();

      // 日報詳細画面に戻ったことを確認
      cy.url().should('include', '/daily-reports/', { timeout: 10000 });
      cy.url().should('not.include', '/edit');

      // 編集後の内容が表示されていることを確認
      cy.contains('編集後のできごと').should('be.visible');
      cy.contains('編集後の学び').should('be.visible');
    });

    it('キャンセルボタンで編集をキャンセルできる', () => {
      navigateToDailyReportDetail();
      cy.contains('button', '編集する').click();
      cy.url().should('include', '/edit', { timeout: 10000 });

      // フォームを編集
      cy.get('textarea#events').clear().type('キャンセルされる内容');

      // キャンセルボタンをクリック
      cy.contains('button', 'キャンセル').click();

      // 日報詳細画面に戻ったことを確認
      cy.url().should('include', '/daily-reports/', { timeout: 10000 });
      cy.url().should('not.include', '/edit');

      // 編集前の内容が表示されていることを確認（キャンセルされたため）
      cy.contains('テスト用日報').should('be.visible');
    });

    it('よかったことを追加・編集・削除できる', () => {
      navigateToDailyReportDetail();
      cy.contains('button', '編集する').click();
      cy.url().should('include', '/edit', { timeout: 10000 });

      // よかったことを追加
      cy.contains('.form-group', 'よかったこと').find('button').contains('追加').click();
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('have.length', 2);

      // 追加したよかったことを編集
      cy.contains('.form-group', 'よかったこと')
        .find('.form-card')
        .last()
        .find('textarea')
        .first()
        .type('追加したよかったこと');

      // 既存のよかったことを削除
      cy.contains('.form-group', 'よかったこと')
        .find('.form-card')
        .first()
        .find('.form-card__remove')
        .click();

      // カードが1つになったことを確認
      cy.contains('.form-group', 'よかったこと').find('.form-card').should('have.length', 1);

      // 保存
      cy.contains('button', '保存する').click();
      cy.url().should('include', '/daily-reports/', { timeout: 10000 });
    });

    it('改善点を追加・編集・削除できる', () => {
      navigateToDailyReportDetail();
      cy.contains('button', '編集する').click();
      cy.url().should('include', '/edit', { timeout: 10000 });

      // 改善点を追加
      cy.contains('.form-group', '改善点').find('button').contains('追加').click();
      cy.contains('.form-group', '改善点').find('.form-card').should('have.length', 2);

      // 追加した改善点を編集
      cy.contains('.form-group', '改善点')
        .find('.form-card')
        .last()
        .find('textarea')
        .first()
        .type('追加した改善点');

      // 既存の改善点を削除
      cy.contains('.form-group', '改善点')
        .find('.form-card')
        .first()
        .find('.form-card__remove')
        .click();

      // カードが1つになったことを確認
      cy.contains('.form-group', '改善点').find('.form-card').should('have.length', 1);

      // 保存
      cy.contains('button', '保存する').click();
      cy.url().should('include', '/daily-reports/', { timeout: 10000 });
    });
  });

  // ============================================
  // US-2: エピソードの内容を編集したい
  // ============================================
  describe('US-2: エピソードの編集', () => {
    const goodPointContent = 'エピソード編集テスト用よかったこと';

    beforeEach(() => {
      // よかったことを含む日報を作成
      cy.visit(`${baseUrl}/daily-reports/new`);
      cy.get('textarea#events').should('be.visible').type('テスト用日報');
      cy.contains('.form-group', 'よかったこと').find('button').contains('追加').click();
      cy.contains('.form-group', 'よかったこと')
        .find('.form-card')
        .first()
        .find('textarea')
        .first()
        .type(goodPointContent);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/daily-reports', { timeout: 15000 });
      // 日報が保存され、フォローアップカードが作成されるまで待機
      cy.wait(2000);

      // フォローアップページに遷移
      navigateToFollowupPage('goodPoint', goodPointContent);
      cy.get('.followup-page').should('be.visible', { timeout: 10000 });
      cy.get('.followup-page__title').should('be.visible', { timeout: 10000 });

      // エピソードを追加
      addEpisode('編集前のエピソードメモ');

      // エピソードが追加されるまで待機
      cy.get('.followup-page__item').should('be.visible', { timeout: 10000 });
      cy.contains('.followup-page__item-memo', '編集前のエピソードメモ').should('be.visible', { timeout: 10000 });
    });

    it('エピソードカードに編集ボタンが表示されている', () => {
      // エピソードカードが表示されていることを確認
      cy.get('.followup-page__item').should('be.visible');

      // 編集ボタンが表示されていることを確認
      cy.get('.followup-page__item-edit').should('be.visible');
    });

    it('エピソードの内容を編集できる', () => {
      // 編集ボタンをクリック
      cy.get('.followup-page__item-edit').first().click();

      // モーダルが表示されることを確認
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 5000 });
      cy.get('.followup-page__modal').should('be.visible');
      cy.get('.followup-page__modal-title').should('contain.text', 'エピソードを編集');

      // 既存データがフォームに設定されていることを確認
      cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
      cy.get('.textarea-field__textarea').should('have.value', '編集前のエピソードメモ');

      // 内容を編集
      cy.get('.textarea-field__textarea').clear();
      cy.get('.textarea-field__textarea').type('編集後のエピソードメモ');

      // 保存ボタンをクリック（実装では「追加」ボタンを使用）
      // モーダル内の「追加」ボタンをクリック
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });

      // モーダルが閉じることを確認
      cy.get('.followup-page__overlay').should('not.exist', { timeout: 5000 });

      // 編集後の内容が表示されていることを確認
      cy.contains('編集後のエピソードメモ').should('be.visible');
    });

    it('エピソードの日付を編集できる', () => {
      // 編集ボタンをクリック
      cy.get('.followup-page__item-edit').first().click();

      // モーダルが表示されることを確認
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 5000 });
      cy.get('.followup-page__modal').should('be.visible');

      // 日付を編集
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
      cy.get('.date-field__input').clear();
      cy.get('.date-field__input').type(yesterdayStr);

      // 保存ボタンをクリック（実装では「追加」ボタンを使用）
      // モーダル内の「追加」ボタンをクリック
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });

      // モーダルが閉じることを確認
      cy.get('.followup-page__overlay').should('not.exist', { timeout: 5000 });

      // 編集後の日付が表示されていることを確認
      cy.contains(yesterdayStr).should('be.visible');
    });
  });

  // ============================================
  // US-3: アクションの内容を編集したい
  // ============================================
  describe('US-3: アクションの編集', () => {
    const improvementContent = 'アクション編集テスト用改善点';

    beforeEach(() => {
      // 改善点を含む日報を作成
      cy.visit(`${baseUrl}/daily-reports/new`);
      cy.get('textarea#events').should('be.visible').type('テスト用日報');
      cy.contains('.form-group', '改善点').find('button').contains('追加').click();
      cy.contains('.form-group', '改善点')
        .find('.form-card')
        .first()
        .find('textarea')
        .first()
        .type(improvementContent);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/daily-reports', { timeout: 15000 });
      // 日報が保存され、フォローアップカードが作成されるまで待機
      cy.wait(2000);

      // フォローアップページに遷移
      navigateToFollowupPage('improvement', improvementContent);
      cy.get('.followup-page').should('be.visible', { timeout: 10000 });
      cy.get('.followup-page__title').should('be.visible', { timeout: 10000 });

      // アクションを追加
      addEpisode('編集前のアクションメモ');

      // アクションが追加されるまで待機
      cy.get('.followup-page__item').should('be.visible', { timeout: 10000 });
      cy.contains('.followup-page__item-memo', '編集前のアクションメモ').should('be.visible', { timeout: 10000 });
    });

    it('アクションカードに編集ボタンが表示されている', () => {
      // アクションカードが表示されていることを確認
      cy.get('.followup-page__item').should('be.visible');

      // 編集ボタンが表示されていることを確認
      cy.get('.followup-page__item-edit').should('be.visible');
    });

    it('アクションの内容を編集できる', () => {
      // 編集ボタンをクリック
      cy.get('.followup-page__item-edit').first().click();

      // モーダルが表示されることを確認
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 5000 });
      cy.get('.followup-page__modal').should('be.visible');
      cy.get('.followup-page__modal-title').should('contain.text', 'アクションを編集');

      // 既存データがフォームに設定されていることを確認
      cy.get('.textarea-field__textarea').should('be.visible', { timeout: 5000 });
      cy.get('.textarea-field__textarea').should('have.value', '編集前のアクションメモ');

      // 内容を編集
      cy.get('.textarea-field__textarea').clear();
      cy.get('.textarea-field__textarea').type('編集後のアクションメモ');

      // 保存ボタンをクリック（実装では「追加」ボタンを使用）
      // モーダル内の「追加」ボタンをクリック
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });

      // モーダルが閉じることを確認
      cy.get('.followup-page__overlay').should('not.exist', { timeout: 5000 });

      // 編集後の内容が表示されていることを確認
      cy.contains('編集後のアクションメモ').should('be.visible');
    });

    it('アクションの日付を編集できる', () => {
      // 編集ボタンをクリック
      cy.get('.followup-page__item-edit').first().click();

      // モーダルが表示されることを確認
      cy.get('.followup-page__overlay').should('be.visible', { timeout: 5000 });
      cy.get('.followup-page__modal').should('be.visible');

      // 日付を編集
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      cy.get('.date-field__input').should('be.visible', { timeout: 5000 });
      cy.get('.date-field__input').clear();
      cy.get('.date-field__input').type(yesterdayStr);

      // 保存ボタンをクリック（実装では「追加」ボタンを使用）
      // モーダル内の「追加」ボタンをクリック
      cy.get('.followup-page__modal-footer').within(() => {
        cy.get('app-button').last().find('button').should('be.visible').click();
      });

      // モーダルが閉じることを確認
      cy.get('.followup-page__overlay').should('not.exist', { timeout: 5000 });

      // 編集後の日付が表示されていることを確認
      cy.contains(yesterdayStr).should('be.visible');
    });
});
});


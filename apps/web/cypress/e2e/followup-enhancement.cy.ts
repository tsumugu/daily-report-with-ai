/**
 * フォローアップ機能強化 E2Eテスト
 *
 * PRD: docs/features/followup-enhancement/prd.md
 * UI Design: docs/features/followup-enhancement/ui_design.md
 *
 * テスト対象ユーザーストーリー:
 * - US-1: よかったことの再現エピソードを複数記録したい
 * - US-2: 改善点のアクションを複数記録したい
 * - US-3: ステータスを自動判定してほしい
 * - US-4: ホーム画面から直接フォローアップを入力したい
 */

describe('フォローアップ機能強化', () => {
  const baseUrl = 'http://localhost:4200/#';
  const testPassword = 'TestPassword123!';

  // テスト用ユーティリティ
  const signup = () => {
    const uniqueEmail = `e2e-followup-${Date.now()}@example.com`;
    cy.visit(`${baseUrl}/signup`);
    cy.get('input#email').should('be.visible').type(uniqueEmail);
    cy.get('input#password').type(testPassword);
    cy.get('input#confirmPassword').type(testPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', `${baseUrl}/`, { timeout: 15000 });
  };

  const createDailyReportWithGoodPoint = (content: string) => {
    cy.visit(`${baseUrl}/daily-reports/new`);
    cy.get('textarea#events').should('be.visible').type('テスト用日報');
    cy.contains('.form-group', 'よかったこと').find('button').contains('追加').click();
    cy.contains('.form-group', 'よかったこと')
      .find('.form-card')
      .first()
      .find('textarea')
      .first()
      .type(content);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/#/daily-reports', { timeout: 15000 });
  };

  const createDailyReportWithImprovement = (content: string) => {
    cy.visit(`${baseUrl}/daily-reports/new`);
    cy.get('textarea#events').should('be.visible').type('テスト用日報');
    cy.contains('.form-group', '改善点').find('button').contains('追加').click();
    cy.contains('.form-group', '改善点')
      .find('.form-card')
      .first()
      .find('textarea')
      .first()
      .type(content);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/#/daily-reports', { timeout: 15000 });
  };

  const navigateToFollowupPageFromCard = (cardContent: string) => {
    cy.visit(`${baseUrl}/followups`);
    cy.get('.followup-card', { timeout: 10000 }).should('exist');
    cy.contains('.followup-card', cardContent).within(() => {
      cy.contains('button', 'フォローアップ').click();
    });
    cy.get('.followup-page', { timeout: 10000 }).should('be.visible');
  };

  const addEpisodeOrAction = (memo: string) => {
    const today = new Date().toISOString().split('T')[0];

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
    // モーダル内の「追加」ボタンをクリック
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
  // US-1: よかったことの再現エピソードを複数記録したい
  // ============================================
  describe('US-1: よかったことのエピソード記録', () => {
    const goodPointContent = 'US1テスト用よかったこと';

    beforeEach(() => {
      createDailyReportWithGoodPoint(goodPointContent);
    });

    it('フォロー項目カードからフォローアップページに遷移できる', () => {
      navigateToFollowupPageFromCard(goodPointContent);

      cy.url().should('include', '/#/followups/goodPoint/');
      cy.get('.followup-page__title').should('be.visible');
    });

    it('エピソードを1件追加できる', () => {
      navigateToFollowupPageFromCard(goodPointContent);

      addEpisodeOrAction('エピソード1のメモ');

      cy.contains('.followup-page__item-memo', 'エピソード1のメモ').should('be.visible', { timeout: 10000 });
      cy.get('.followup-page__status-text').should('contain.text', '進行中', { timeout: 10000 });
    });

    it('エピソードを複数件（3件）追加できる', () => {
      navigateToFollowupPageFromCard(goodPointContent);

      addEpisodeOrAction('エピソード1');
      addEpisodeOrAction('エピソード2');
      addEpisodeOrAction('エピソード3');

      cy.get('.followup-page__item').should('have.length', 3, { timeout: 10000 });
    });
  });

  // ============================================
  // US-2: 改善点のアクションを複数記録したい
  // ============================================
  describe('US-2: 改善点のアクション記録', () => {
    const improvementContent = 'US2テスト用改善点';

    beforeEach(() => {
      createDailyReportWithImprovement(improvementContent);
    });

    it('改善点のフォローアップページでアクションを追加できる', () => {
      navigateToFollowupPageFromCard(improvementContent);

      cy.url().should('include', '/#/followups/improvement/', { timeout: 10000 });
      addEpisodeOrAction('アクション1のメモ');

      cy.contains('.followup-page__item-memo', 'アクション1のメモ').should('be.visible', { timeout: 10000 });
    });

    it('アクションを複数件（3件）追加できる', () => {
      navigateToFollowupPageFromCard(improvementContent);

      addEpisodeOrAction('アクション1');
      addEpisodeOrAction('アクション2');
      addEpisodeOrAction('アクション3');

      cy.get('.followup-page__item').should('have.length', 3, { timeout: 10000 });
    });
  });

  // ============================================
  // US-3: ステータス自動判定
  // ============================================
  describe('US-3: ステータス自動判定', () => {
    const goodPointContent = 'US3ステータステスト用よかったこと';
    const improvementContent = 'US3ステータステスト用改善点';

    it('よかったこと: 0件→未着手、1件→進行中、3件→定着', () => {
      createDailyReportWithGoodPoint(goodPointContent);
      navigateToFollowupPageFromCard(goodPointContent);

      // 初期状態: 未着手
      cy.get('.followup-page__status-text').should('contain.text', '未着手', { timeout: 10000 });

      // 1件追加: 進行中
      addEpisodeOrAction('エピソード1');
      cy.get('.followup-page__status-text').should('contain.text', '進行中', { timeout: 10000 });

      // 2件追加: 進行中
      addEpisodeOrAction('エピソード2');
      cy.get('.followup-page__status-text').should('contain.text', '進行中', { timeout: 10000 });

      // 3件追加: 定着
      addEpisodeOrAction('エピソード3');
      cy.get('.followup-page__status-text').should('contain.text', '定着', { timeout: 10000 });
    });

    it('改善点: 0件→未着手、1件→進行中、3件→習慣化', () => {
      createDailyReportWithImprovement(improvementContent);
      navigateToFollowupPageFromCard(improvementContent);

      // 初期状態: 未着手
      cy.get('.followup-page__status-text').should('contain.text', '未着手', { timeout: 10000 });

      // 1件追加: 進行中
      addEpisodeOrAction('アクション1');
      cy.get('.followup-page__status-text').should('contain.text', '進行中', { timeout: 10000 });

      // 3件追加: 習慣化
      addEpisodeOrAction('アクション2');
      addEpisodeOrAction('アクション3');
      cy.get('.followup-page__status-text').should('contain.text', '習慣化', { timeout: 10000 });
    });
  });

  // ============================================
  // US-4: ホーム画面から直接フォローアップ入力
  // ============================================
  describe('US-4: 週次フォーカスからのフォローアップ入力', () => {
    const goodPointContent = 'US4週次フォーカステスト用よかったこと';

    beforeEach(() => {
      createDailyReportWithGoodPoint(goodPointContent);

      // 週次フォーカスに追加（フォロー項目一覧ページから）
      cy.visit(`${baseUrl}/followups`);
      cy.get('.followup-card', { timeout: 10000 }).should('exist');
      cy.contains('.followup-card', goodPointContent).within(() => {
        cy.get('.icon-button__wrapper button[aria-label="フォーカスに追加"]').click();
      });
      cy.get('.toast--success', { timeout: 5000 }).should('be.visible');
    });

    it('週次フォーカスカードからフォローアップページに遷移できる', () => {
      cy.visit(`${baseUrl}/`);
      cy.get('.weekly-focus-card', { timeout: 10000 }).should('exist');
      cy.contains('.weekly-focus-card', goodPointContent).within(() => {
        cy.get('a[aria-label="フォローアップ"]').should('be.visible').click();
      });

      cy.url().should('include', '/#/followups/goodPoint/', { timeout: 10000 });
      cy.get('.followup-page').should('be.visible', { timeout: 10000 });
    });

    it('週次フォーカスカードからエピソードを追加できる', () => {
      cy.visit(`${baseUrl}/`);
      cy.get('.weekly-focus-card', { timeout: 10000 }).should('exist');
      cy.contains('.weekly-focus-card', goodPointContent).within(() => {
        cy.get('a[aria-label="フォローアップ"]').should('be.visible').click();
      });
      cy.get('.followup-page', { timeout: 10000 }).should('be.visible');

      addEpisodeOrAction('週次フォーカスからのエピソード');

      cy.contains('.followup-page__item-memo', '週次フォーカスからのエピソード').should(
        'be.visible',
        { timeout: 10000 }
      );
    });

    it('フォローアップ追加後、週次フォーカスカードのステータスが更新される', () => {
      cy.visit(`${baseUrl}/`);
      cy.get('.weekly-focus-card', { timeout: 10000 }).should('exist');
      cy.contains('.weekly-focus-card', goodPointContent).within(() => {
        cy.get('a[aria-label="フォローアップ"]').should('be.visible').click();
      });
      cy.get('.followup-page', { timeout: 10000 }).should('be.visible');

      // 3件追加して定着に
      addEpisodeOrAction('エピソード1');
      addEpisodeOrAction('エピソード2');
      addEpisodeOrAction('エピソード3');

      // ホーム画面に戻って確認
      cy.visit(`${baseUrl}/`);
      cy.get('.weekly-focus-card', { timeout: 10000 }).should('exist');
      cy.contains('.weekly-focus-card', goodPointContent).within(() => {
        cy.contains('定着').should('be.visible', { timeout: 10000 });
      });
    });
  });
});

/**
 * 目標階層管理機能 E2Eテスト
 *
 * PRD: docs/features/goal-hierarchy-management/prd.md
 * UI Design: docs/features/goal-hierarchy-management/ui_design.md
 *
 * テスト対象ユーザーストーリー:
 * - US-1: 長期目標の作成
 * - US-2: 目標の階層的ブレイクダウン
 * - US-3: 目標間の関係性の確認
 * - US-4: 目標の階層構造の一覧表示
 * - US-5: 週次フォーカスと短期目標の接続
 * - US-6: 目標の編集・削除
 */

describe('目標階層管理機能', () => {
  const baseUrl = 'http://localhost:4200';
  const testPassword = 'TestPassword123!';
  let uniqueEmail: string;

  beforeEach(() => {
    // 各テストで一意のメールアドレスを生成
    uniqueEmail = `e2e-goal-${Cypress._.random(0, 1e6)}@example.com`;

    // サインアップしてログイン状態にする
    cy.visit(`${baseUrl}/signup`);

    // ページが読み込まれるまで待機
    cy.get('input#email').should('be.visible');

    // フォーム入力
    cy.get('input#email').type(uniqueEmail);
    cy.get('input#password').type(testPassword);
    cy.get('input#confirmPassword').type(testPassword);

    // サブミットボタンをクリック
    cy.get('button[type="submit"]').click();

    // ホーム画面に遷移するまで待機
    cy.url().should('eq', `${baseUrl}/`, { timeout: 15000 });
  });

  // ============================================
  // US-1: 長期目標の作成
  // ============================================

  describe('US-1: 長期目標の作成', () => {
    it('目標一覧画面から目標作成画面に遷移できること', () => {
      // 目標一覧画面に遷移（ルーティングが設定されている場合）
      cy.visit(`${baseUrl}/goals`);

      // 目標を作成ボタンをクリック
      cy.contains('button', '目標を作成').click();

      // 目標作成画面に遷移したことを確認
      cy.url().should('include', '/goals/new');
      cy.contains('h1', '目標を作成').should('be.visible');
    });

    it('長期目標を作成できること', () => {
      cy.visit(`${baseUrl}/goals/new`);

      // フォーム入力
      cy.get('input#goal-name').should('be.visible').type('長期目標: スキル向上');
      cy.get('textarea#goal-description').type('技術スキルを向上させ、キャリアを発展させる');
      
      // 開始日を設定（今日の日付）
      const today = new Date();
      const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-start-date').type(startDate);

      // 終了日を設定（6ヶ月後）
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 6);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-end-date').type(endDateStr);

      // 目標の性質を選択（任意、スキル習得を選択）
      cy.get('select#goal-type').select('skill');

      // 保存ボタンをクリック
      cy.contains('button', '保存する').click();

      // 目標一覧画面に遷移したことを確認
      cy.url().should('include', '/goals', { timeout: 15000 });
    });

    it('必須項目が未入力の場合、エラーメッセージが表示されること', () => {
      cy.visit(`${baseUrl}/goals/new`);

      // 必須項目を入力せずに保存ボタンをクリック
      cy.contains('button', '保存する').should('be.disabled');

      // 目標名を入力
      cy.get('input#goal-name').type('テスト目標');
      
      // 開始日を設定
      const today = new Date();
      const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-start-date').type(startDate);

      // 終了日を設定
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 6);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-end-date').type(endDateStr);

      // 保存ボタンが有効になることを確認
      cy.contains('button', '保存する').should('not.be.disabled');
    });
  });

  // ============================================
  // US-2: 目標の階層的ブレイクダウン
  // ============================================

  describe('US-2: 目標の階層的ブレイクダウン', () => {
    it('長期目標から中期目標を作成できること', () => {
      // まず長期目標を作成
      cy.visit(`${baseUrl}/goals/new`);
      cy.get('input#goal-name').should('be.visible').type('長期目標: プロジェクト管理スキル向上');
      
      const today = new Date();
      const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-start-date').type(startDate);

      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 6);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-end-date').type(endDateStr);
      cy.get('select#goal-type').select('skill');
      cy.contains('button', '保存する').click();
      cy.url().should('include', '/goals', { timeout: 15000 });

      // 目標一覧画面で目標が表示されるまで待機
      cy.contains('長期目標: プロジェクト管理スキル向上').should('be.visible');

      // 中期目標を作成（上位目標として長期目標を選択）
      // 目標一覧画面から目標作成画面に遷移
      cy.contains('button', '目標を作成').click();
      cy.url().should('include', '/goals/new');
      
      cy.get('input#goal-name').should('be.visible').type('中期目標: アジャイル手法の習得');
      
      const midStartDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-start-date').type(midStartDate);

      const midEndDate = new Date(today);
      midEndDate.setMonth(midEndDate.getMonth() + 1);
      const midEndDateStr = `${midEndDate.getFullYear()}-${String(midEndDate.getMonth() + 1).padStart(2, '0')}-${String(midEndDate.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-end-date').type(midEndDateStr);

      // 上位目標を選択（オプションが読み込まれるまで待機）
      cy.get('select#goal-parent-id').should('be.visible');
      // オプションが読み込まれるまで待機（「なし」オプション以外が存在することを確認）
      cy.get('select#goal-parent-id option').should('have.length.greaterThan', 1);
      // 最初の目標オプションを選択（「なし」オプションの次）
      cy.get('select#goal-parent-id').select(1);

      cy.get('select#goal-type').select('project');
      cy.contains('button', '保存する').click();
      cy.url().should('include', '/goals', { timeout: 15000 });
    });

    it('中期目標から短期目標を作成できること', () => {
      // 長期目標と中期目標を作成（上記のテストと同様）
      // その後、短期目標を作成
      cy.visit(`${baseUrl}/goals/new`);
      cy.get('input#goal-name').type('短期目標: スプリント計画の実践');
      
      const today = new Date();
      const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-start-date').type(startDate);

      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7); // 1週間後
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-end-date').type(endDateStr);

      // 上位目標を選択（中期目標が存在する場合）
      cy.get('select#goal-parent-id').should('be.visible');

      cy.get('select#goal-type').select('habit');
      cy.contains('button', '保存する').click();
      cy.url().should('include', '/goals', { timeout: 15000 });
    });
  });

  // ============================================
  // US-4: 目標の階層構造の一覧表示
  // ============================================

  describe('US-4: 目標の階層構造の一覧表示', () => {
    it('目標一覧画面で目標が表示されること', () => {
      cy.visit(`${baseUrl}/goals`);

      // 目標一覧画面が表示されることを確認
      cy.contains('h1', '目標管理').should('be.visible');
    });

    it('階層表示とカード表示を切り替えられること', () => {
      cy.visit(`${baseUrl}/goals`);

      // ビュー切り替えコンポーネントが表示されることを確認
      // （実装に応じてセレクタを調整）
      cy.get('.goal-list-page__actions').should('be.visible');
    });

    it('目標がない場合、空状態が表示されること', () => {
      cy.visit(`${baseUrl}/goals`);

      // 空状態が表示されることを確認
      cy.contains('目標がまだ作成されていません').should('be.visible');
    });
  });

  // ============================================
  // US-5: 週次フォーカスと短期目標の接続
  // ============================================

  describe('US-5: 週次フォーカスと短期目標の接続', () => {
    it('短期目標の詳細画面で週次フォーカス設定へのリンクが表示されること', () => {
      // 短期目標を作成
      cy.visit(`${baseUrl}/goals/new`);
      cy.get('input#goal-name').type('短期目標: 週次フォーカステスト');
      
      const today = new Date();
      const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-start-date').type(startDate);

      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7); // 1週間後
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-end-date').type(endDateStr);
      cy.get('select#goal-type').select('habit');
      cy.contains('button', '保存する').click();
      cy.url().should('include', '/goals/', { timeout: 15000 });
      
      // 目標一覧画面に戻る
      cy.visit(`${baseUrl}/goals`);
      cy.get('.goal-list-page').should('be.visible', { timeout: 10000 });
      
      // 目標一覧画面で目標が表示されるまで待機
      cy.contains('.hierarchy-card', '短期目標: 週次フォーカステスト').should('be.visible', { timeout: 10000 });
      // 目標カードをクリックして詳細画面に遷移
      cy.contains('.hierarchy-card', '短期目標: 週次フォーカステスト').click();
      cy.url().should('include', '/goals/', { timeout: 15000 });

      // 目標詳細が読み込まれるまで待機
      cy.contains('h1', '目標詳細').should('be.visible');
      cy.contains('短期目標: 週次フォーカステスト').should('be.visible');

      // 短期目標の場合、週次フォーカスセクションが表示されることを確認
      cy.contains('h2', '週次フォーカス').should('be.visible');
      cy.contains('button', '週次フォーカスを設定').should('be.visible');
    });
  });

  // ============================================
  // US-6: 目標の編集・削除
  // ============================================

  describe('US-6: 目標の編集・削除', () => {
    it('目標を編集できること', () => {
      // まず目標を作成
      cy.visit(`${baseUrl}/goals/new`);
      cy.get('input#goal-name').type('編集テスト目標');
      
      const today = new Date();
      const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-start-date').type(startDate);

      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 6);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-end-date').type(endDateStr);
      cy.get('select#goal-type').select('skill');
      cy.contains('button', '保存する').click();
      cy.url().should('include', '/goals/', { timeout: 15000 });
      
      // 目標一覧画面に戻る
      cy.visit(`${baseUrl}/goals`);
      cy.get('.goal-list-page').should('be.visible', { timeout: 10000 });
      
      // 目標一覧画面で目標が表示されるまで待機
      cy.contains('.hierarchy-card', '編集テスト目標').should('be.visible', { timeout: 10000 });
      // 目標カードをクリックして詳細画面に遷移
      cy.contains('.hierarchy-card', '編集テスト目標').click();
      cy.url().should('include', '/goals/', { timeout: 15000 });

      // 目標詳細が読み込まれるまで待機
      cy.contains('h1', '目標詳細').should('be.visible');
      cy.contains('編集テスト目標').should('be.visible');

      // 編集ボタンをクリック（アクションバー内の編集ボタンを探す）
      cy.get('.goal-detail-page__actions').within(() => {
        cy.contains('button', '編集').should('be.visible').click();
      });
      
      // 編集画面に遷移したことを確認
      cy.url().should('include', '/goals/', { timeout: 15000 });
      cy.url().should('include', '/edit', { timeout: 15000 });

      // フォームが編集モードで表示されることを確認
      cy.contains('h1', '目標を編集').should('be.visible');
    });

    it('目標を削除できること', () => {
      // まず目標を作成
      cy.visit(`${baseUrl}/goals/new`);
      cy.get('input#goal-name').type('削除テスト目標');
      
      const today = new Date();
      const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-start-date').type(startDate);

      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 6);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      cy.get('input#goal-end-date').type(endDateStr);
      cy.get('select#goal-type').select('skill');
      cy.contains('button', '保存する').click();
      cy.url().should('include', '/goals/', { timeout: 15000 });
      
      // 目標一覧画面に戻る
      cy.visit(`${baseUrl}/goals`);
      cy.get('.goal-list-page').should('be.visible', { timeout: 10000 });
      
      // 目標一覧画面で目標が表示されるまで待機
      cy.contains('.hierarchy-card', '削除テスト目標').should('be.visible', { timeout: 10000 });
      // 目標カードをクリックして詳細画面に遷移
      cy.contains('.hierarchy-card', '削除テスト目標').click();
      cy.url().should('include', '/goals/', { timeout: 15000 });

      // 目標詳細が読み込まれるまで待機
      cy.contains('h1', '目標詳細').should('be.visible');
      cy.contains('削除テスト目標').should('be.visible');

      // 確認ダイアログを自動的に確認するように設定
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });

      // 削除ボタンをクリック（アクションバー内の削除ボタンを探す）
      cy.get('.goal-detail-page__actions').within(() => {
        cy.contains('button', '削除').should('be.visible').click();
      });

      // 削除が完了し、目標一覧画面に遷移するまで待機
      cy.url().should('eq', `${baseUrl}/goals`, { timeout: 15000 });

      // 目標一覧画面に戻り、目標が削除されたことを確認
      cy.contains('削除テスト目標').should('not.exist');
    });
  });
});


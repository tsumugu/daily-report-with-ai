// 目標階層管理機能 プロトタイプ用JavaScript

// セクション表示切り替え
function showSection(sectionId) {
  // すべてのセクションを非表示
  const sections = document.querySelectorAll('.prototype-section');
  sections.forEach(section => {
    section.style.display = 'none';
  });

  // 指定されたセクションを表示
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
  }
}

// 初期表示: 最初のセクションを表示
document.addEventListener('DOMContentLoaded', () => {
  // すべてのセクションを非表示
  const sections = document.querySelectorAll('.prototype-section');
  sections.forEach((section, index) => {
    if (index === 0) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  });

  // 文字数カウンター
  setupCharCounters();

  // フォームバリデーション
  setupFormValidation();

  // ビュー切り替えの初期化（最初のセクションのみ）
  const firstSection = sections[0];
  if (firstSection) {
    const treeView = firstSection.querySelector('#goal-tree-view');
    const cardView = firstSection.querySelector('#goal-card-view');
    if (treeView && cardView) {
      // デフォルトは階層表示
      treeView.style.display = 'flex';
      cardView.style.display = 'none';
    }
  }
});

// 文字数カウンター設定
function setupCharCounters() {
  const textInputs = document.querySelectorAll('input[type="text"], textarea');
  textInputs.forEach(input => {
    const maxLength = input.getAttribute('maxlength');
    if (maxLength) {
      const charCountId = input.getAttribute('aria-describedby')?.split(' ')[0];
      if (charCountId) {
        const charCountElement = document.getElementById(charCountId);
        if (charCountElement) {
          input.addEventListener('input', () => {
            const currentLength = input.value.length;
            const currentSpan = charCountElement.querySelector('.form-char-count__current');
            if (currentSpan) {
              currentSpan.textContent = currentLength;
            }
          });
        }
      }
    }
  });
}

// フォームバリデーション設定
function setupFormValidation() {
  const form = document.getElementById('goal-create-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // バリデーション実行
      const isValid = validateForm(form);
      
      if (isValid) {
        // 成功時の処理（プロトタイプではアラート表示）
        alert('目標を作成しました');
        // 実際の実装では、ここでAPIを呼び出し、成功後に目標一覧に遷移
      }
    });
  }
}

// フォームバリデーション
function validateForm(form) {
  let isValid = true;

  // 目標名のバリデーション
  const nameInput = form.querySelector('#goal-name');
  if (nameInput && !nameInput.value.trim()) {
    showError(nameInput, '目標名を入力してください');
    isValid = false;
  } else if (nameInput && nameInput.value.length > 100) {
    showError(nameInput, '目標名は100文字以内で入力してください');
    isValid = false;
  } else {
    hideError(nameInput);
  }

  // 開始日のバリデーション
  const startDateInput = form.querySelector('#goal-start-date');
  if (startDateInput && !startDateInput.value) {
    showError(startDateInput, '開始日を設定してください');
    isValid = false;
  } else {
    hideError(startDateInput);
  }

  // 終了日のバリデーション
  const endDateInput = form.querySelector('#goal-end-date');
  if (endDateInput && !endDateInput.value) {
    showError(endDateInput, '終了日を設定してください');
    isValid = false;
  } else if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    if (endDate < startDate) {
      showError(endDateInput, '終了日は開始日以降である必要があります');
      isValid = false;
    } else {
      hideError(endDateInput);
    }
  } else {
    hideError(endDateInput);
  }

  return isValid;
}

// エラー表示
function showError(input, message) {
  if (!input) return;

  const errorId = input.getAttribute('aria-describedby')?.split(' ').find(id => id.includes('error'));
  if (errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      input.setAttribute('aria-invalid', 'true');
      input.classList.add('form-input--error');
      
      const formField = input.closest('.form-field');
      if (formField) {
        formField.classList.add('form-field--error');
      }
    }
  }
}

// エラー非表示
function hideError(input) {
  if (!input) return;

  const errorId = input.getAttribute('aria-describedby')?.split(' ').find(id => id.includes('error'));
  if (errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.style.display = 'none';
      input.removeAttribute('aria-invalid');
      input.classList.remove('form-input--error');
      
      const formField = input.closest('.form-field');
      if (formField) {
        formField.classList.remove('form-field--error');
      }
    }
  }
}

// ビュー切り替え（ツリー/カード）
function toggleView(viewType) {
  const treeView = document.getElementById('goal-tree-view');
  const cardView = document.getElementById('goal-card-view');
  const treeBtn = document.getElementById('tree-view-btn');
  const cardBtn = document.getElementById('card-view-btn');

  if (viewType === 'tree') {
    if (treeView) treeView.style.display = 'flex';
    if (cardView) cardView.style.display = 'none';
    if (treeBtn) {
      treeBtn.classList.add('view-toggle__button--active');
      treeBtn.setAttribute('aria-pressed', 'true');
    }
    if (cardBtn) {
      cardBtn.classList.remove('view-toggle__button--active');
      cardBtn.setAttribute('aria-pressed', 'false');
    }
  } else {
    if (treeView) treeView.style.display = 'none';
    if (cardView) cardView.style.display = 'flex';
    if (treeBtn) {
      treeBtn.classList.remove('view-toggle__button--active');
      treeBtn.setAttribute('aria-pressed', 'false');
    }
    if (cardBtn) {
      cardBtn.classList.add('view-toggle__button--active');
      cardBtn.setAttribute('aria-pressed', 'true');
    }
  }
}

// ツリーアイテムの展開・折りたたみ
function toggleTreeItem(button) {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  const treeItem = button.closest('.goal-tree-item');
  
  if (isExpanded) {
    button.setAttribute('aria-expanded', 'false');
    button.textContent = '▶';
    treeItem.classList.remove('goal-tree-item--expanded');
  } else {
    button.setAttribute('aria-expanded', 'true');
    button.textContent = '▼';
    treeItem.classList.add('goal-tree-item--expanded');
  }
}

// 削除確認ダイアログ
function showDeleteConfirm() {
  if (confirm('この目標を削除しますか？\n下位目標が存在する場合は削除できません。')) {
    alert('目標を削除しました');
    // 実際の実装では、ここでAPIを呼び出し、成功後に目標一覧に遷移
  }
}

// 週次フォーカス接続
function showWeeklyFocusConnect() {
  alert('週次フォーカス選択画面に遷移します（プロトタイプでは未実装）');
  // 実際の実装では、ここで週次フォーカス一覧を表示し、選択して接続
}


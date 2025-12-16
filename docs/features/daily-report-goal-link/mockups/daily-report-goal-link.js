// ===================================
// State Management
// ===================================
let selectedGoals = new Map(); // goalId -> goalName

// ===================================
// Section Navigation
// ===================================
function showSection(sectionNumber) {
  // Hide all sections
  const sections = document.querySelectorAll('.prototype-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  const targetSection = document.getElementById(`section-${sectionNumber}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Close any open dropdowns
  closeGoalDropdown();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// Goal Selection Dropdown
// ===================================
function toggleGoalDropdown() {
  const dropdown = document.getElementById('goal-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
  }
}

function closeGoalDropdown() {
  const dropdown = document.getElementById('goal-dropdown');
  if (dropdown) {
    dropdown.classList.remove('active');
  }
}

function selectGoal(goalId, goalName) {
  // Check if already selected
  if (selectedGoals.has(goalId)) {
    showToast('この目標は既に選択されています', 'warning');
    return;
  }

  // Check max limit (10)
  if (selectedGoals.size >= 10) {
    showToast('目標は最大10個まで選択できます', 'error');
    return;
  }

  // Add to selected goals
  selectedGoals.set(goalId, goalName);

  // Update UI
  updateSelectedGoalsUI();

  // Close dropdown
  closeGoalDropdown();

  // Show success message
  showToast('目標を追加しました', 'success');
}

function removeGoal(goalId, event) {
  // Prevent parent click events
  if (event) {
    event.stopPropagation();
  }

  // Remove from selected goals
  selectedGoals.delete(goalId);

  // Update UI
  updateSelectedGoalsUI();

  // Show success message
  showToast('目標を削除しました', 'success');
}

function updateSelectedGoalsUI() {
  const container = document.getElementById('selected-goals');
  if (!container) return;

  // Clear container
  container.innerHTML = '';

  // Add chips for each selected goal
  selectedGoals.forEach((goalName, goalId) => {
    const chip = createGoalChip(goalId, goalName, true);
    container.appendChild(chip);
  });

  // Update input placeholder
  const input = container.closest('.form-field').querySelector('.goal-select-field__input');
  if (input) {
    if (selectedGoals.size > 0) {
      input.placeholder = `${selectedGoals.size}個の目標を選択中`;
    } else {
      input.placeholder = '目標を検索・選択';
    }
  }
}

function createGoalChip(goalId, goalName, removable = false) {
  const chip = document.createElement('div');
  chip.className = 'goal-chip' + (removable ? ' goal-chip--removable' : '');

  const text = document.createElement('span');
  text.className = 'goal-chip__text';
  text.textContent = truncateText(goalName, 20);
  text.title = goalName; // Tooltip for full name
  chip.appendChild(text);

  if (removable) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'goal-chip__remove';
    removeBtn.setAttribute('aria-label', '削除');
    removeBtn.textContent = '×';
    removeBtn.onclick = (e) => removeGoal(goalId, e);
    chip.appendChild(removeBtn);
  }

  return chip;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ===================================
// Toast Notification
// ===================================
function showToast(message, type = 'info') {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;

  // Add styles
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: '10000',
    animation: 'slideIn 0.3s ease-out',
    minWidth: '200px',
    textAlign: 'center'
  });

  // Add to document
  document.body.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ===================================
// Close dropdown when clicking outside
// ===================================
document.addEventListener('click', (event) => {
  const dropdown = document.getElementById('goal-dropdown');
  const selectField = event.target.closest('.goal-select-field');

  if (!selectField && dropdown) {
    closeGoalDropdown();
  }
});

// ===================================
// Initialize prototype on load
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  // Show first section by default
  showSection(1);

  // Pre-populate some goals for demonstration in section 2
  if (document.getElementById('section-2')) {
    const mockGoals = new Map([
      ['goal-1', 'スキル習得 > React基礎を習得'],
      ['goal-3', 'プロジェクト > サンプルアプリ作成']
    ]);

    // Note: This is just for demo. In section 2, chips are statically defined in HTML.
  }

  console.log('Prototype initialized');
});

// ===================================
// Demo: Simulate goal data
// ===================================
const mockGoalData = [
  {
    id: 'goal-1',
    name: 'React基礎を習得',
    parent: 'スキル習得'
  },
  {
    id: 'goal-2',
    name: 'Next.js実践',
    parent: 'スキル習得'
  },
  {
    id: 'goal-3',
    name: 'サンプルアプリ作成',
    parent: 'プロジェクト'
  },
  {
    id: 'goal-4',
    name: 'TypeScript学習',
    parent: 'スキル習得'
  },
  {
    id: 'goal-5',
    name: 'テスト自動化の導入',
    parent: 'プロジェクト'
  }
];

// ===================================
// Keyboard Navigation
// ===================================
document.addEventListener('keydown', (event) => {
  // ESC to close dropdown
  if (event.key === 'Escape') {
    closeGoalDropdown();
  }

  // Number keys (1-5) to switch sections (for easy testing)
  if (event.key >= '1' && event.key <= '5' && !event.target.matches('input, textarea')) {
    const sectionNumber = parseInt(event.key);
    showSection(sectionNumber);
  }
});

// ===================================
// Utility: Format date for display
// ===================================
function formatDate(dateString) {
  const date = new Date(dateString);
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeek = dayNames[date.getDay()];

  return `${dateString}（${dayOfWeek}）`;
}

// ===================================
// Demo: Log prototype interactions
// ===================================
function logInteraction(action, details = {}) {
  console.log(`[Prototype] ${action}`, details);
}

// ===================================
// Export functions for HTML onclick handlers
// ===================================
window.showSection = showSection;
window.toggleGoalDropdown = toggleGoalDropdown;
window.selectGoal = selectGoal;
window.removeGoal = removeGoal;

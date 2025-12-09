import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../../../app/shared/components/button/button.component';
import { CommonModule } from '@angular/common';

/**
 * モーダルインタラクションプロトタイプ
 * モーダル開閉時のスケールアニメーションを確認
 */
const meta: Meta = {
  title: 'Prototypes/MicroInteractions/Modal',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'モーダルのマイクロインタラクション（開閉時のスケールアニメーション）を確認するプロトタイプ',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * モーダル開閉
 */
export const OpenClose: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [ButtonComponent, CommonModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; background: #f9fafb; min-height: 100vh;">
        <h2 style="margin-bottom: 2rem; color: #111827;">モーダル開閉アニメーション</h2>
        <p style="margin-bottom: 1rem; color: #6b7280;">モーダルは開く時（0.95 → 1.0）、閉じる時（1.0 → 0.95）にスケールアニメーションが適用されます</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <app-button variant="primary" size="md">モーダルを開く</app-button>
        </div>
        <div style="margin-top: 2rem; padding: 1.5rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px;">
          <h3 style="margin: 0 0 1rem 0; color: #111827; font-size: 1.25rem;">モーダル例</h3>
          <p style="margin: 0 0 1.5rem 0; color: #6b7280; line-height: 1.6;">これはモーダルの例です。開閉時にスケールアニメーションが適用されます。</p>
          <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <app-button variant="outline" size="md">キャンセル</app-button>
            <app-button variant="primary" size="md">保存</app-button>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * オーバーレイ
 */
export const Overlay: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [CommonModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; background: #f9fafb; min-height: 100vh; position: relative;">
        <h2 style="margin-bottom: 2rem; color: #111827;">オーバーレイ</h2>
        <p style="margin-bottom: 1rem; color: #6b7280;">オーバーレイはフェードイン/アウトで表示されます</p>
        <div style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 50;">
          <div style="background: white; border-radius: 8px; padding: 1.5rem; max-width: 500px; margin: 1rem;">
            <h3 style="margin: 0 0 1rem 0; color: #111827; font-size: 1.25rem;">モーダルタイトル</h3>
            <p style="margin: 0; color: #6b7280; line-height: 1.6;">オーバーレイが背景を暗くします</p>
          </div>
        </div>
      </div>
    `,
  }),
};


import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../../../app/shared/components/button/button.component';
import { CommonModule } from '@angular/common';

/**
 * ボタンインタラクションプロトタイプ
 * ホバー、クリック、ローディング状態のアニメーションを確認
 */
const meta: Meta = {
  title: 'Prototypes/MicroInteractions/Button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'ボタンのマイクロインタラクション（ホバー、クリック、ローディング）を確認するプロトタイプ',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * ホバー効果
 */
export const Hover: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [ButtonComponent, CommonModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; background: #f9fafb; min-height: 100vh;">
        <h2 style="margin-bottom: 2rem; color: #111827;">ボタンホバー効果</h2>
        <p style="margin-bottom: 1rem; color: #6b7280;">マウスをボタンにホバーすると、スケール（1.02）とシャドウが強化されます</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <app-button variant="primary" size="md">Primary Button</app-button>
          <app-button variant="secondary" size="md">Secondary Button</app-button>
          <app-button variant="outline" size="md">Outline Button</app-button>
        </div>
      </div>
    `,
  }),
};

/**
 * クリック効果
 */
export const Click: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [ButtonComponent, CommonModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; background: #f9fafb; min-height: 100vh;">
        <h2 style="margin-bottom: 2rem; color: #111827;">ボタンクリック効果</h2>
        <p style="margin-bottom: 1rem; color: #6b7280;">クリックすると、スケール（0.98）とリップル効果が表示されます</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <app-button variant="primary" size="md">クリックしてください</app-button>
          <app-button variant="secondary" size="md">クリックしてください</app-button>
        </div>
      </div>
    `,
  }),
};

/**
 * ローディング状態
 */
export const Loading: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [ButtonComponent, CommonModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; background: #f9fafb; min-height: 100vh;">
        <h2 style="margin-bottom: 2rem; color: #111827;">ローディング状態</h2>
        <p style="margin-bottom: 1rem; color: #6b7280;">ローディング中はスピナーが表示され、テキストがフェードアウトします</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <app-button variant="primary" size="md" [loading]="true">送信中...</app-button>
          <app-button variant="secondary" size="md" [loading]="true">保存中...</app-button>
        </div>
      </div>
    `,
  }),
};

/**
 * 無効状態
 */
export const Disabled: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [ButtonComponent, CommonModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; background: #f9fafb; min-height: 100vh;">
        <h2 style="margin-bottom: 2rem; color: #111827;">無効状態</h2>
        <p style="margin-bottom: 1rem; color: #6b7280;">無効なボタンはホバーやクリックの効果が適用されません</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <app-button variant="primary" size="md" [disabled]="true">無効なボタン</app-button>
          <app-button variant="secondary" size="md" [disabled]="true">無効なボタン</app-button>
        </div>
      </div>
    `,
  }),
};


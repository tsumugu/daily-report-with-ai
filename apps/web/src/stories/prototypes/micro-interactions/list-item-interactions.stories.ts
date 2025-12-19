import { Meta, StoryObj } from '@storybook/angular';
import { CommonModule } from '@angular/common';

/**
 * リストアイテムインタラクションプロトタイプ
 * リストアイテムの表示アニメーション（stagger）を確認
 */
const meta: Meta = {
  title: 'Design System/Prototypes/Micro-interactions/List Item',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'リストアイテムのマイクロインタラクション（表示アニメーション、stagger効果）を確認するプロトタイプ',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * リストアイテム表示
 */
export const ListItemDisplay: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [CommonModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; background: #f9fafb; min-height: 100vh;">
        <h2 style="margin-bottom: 2rem; color: #111827;">リストアイテム表示アニメーション</h2>
        <p style="margin-bottom: 1rem; color: #6b7280;">リストアイテムは順番に表示され（stagger効果、50ms間隔）、フェードインとスライドアップが適用されます</p>
        <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 600px;">
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.125rem;">日報 1</h3>
            <p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;">2025-01-15</p>
            <p style="margin: 0; color: #374151; line-height: 1.6;">今日はプロジェクトの進捗を確認し、チームメンバーと打ち合わせを行いました。</p>
          </div>
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.125rem;">日報 2</h3>
            <p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;">2025-01-14</p>
            <p style="margin: 0; color: #374151; line-height: 1.6;">コードレビューを実施し、いくつかの改善点を発見しました。</p>
          </div>
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.125rem;">日報 3</h3>
            <p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;">2025-01-13</p>
            <p style="margin: 0; color: #374151; line-height: 1.6;">新しい機能の実装を開始し、基本的な構造を作成しました。</p>
          </div>
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.125rem;">日報 4</h3>
            <p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;">2025-01-12</p>
            <p style="margin: 0; color: #374151; line-height: 1.6;">バグ修正を行い、テストを実施しました。</p>
          </div>
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.125rem;">日報 5</h3>
            <p style="margin: 0 0 0.5rem 0; color: #6b7280; font-size: 0.875rem;">2025-01-11</p>
            <p style="margin: 0; color: #374151; line-height: 1.6;">デザインシステムの改善に取り組みました。</p>
          </div>
        </div>
      </div>
    `,
  }),
};


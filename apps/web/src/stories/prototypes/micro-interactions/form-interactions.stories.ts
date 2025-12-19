import { Meta, StoryObj } from '@storybook/angular';
import { InputFieldComponent } from '../../../app/shared/ui/input-field/input-field.component';
import { TextareaFieldComponent } from '../../../app/shared/ui/textarea-field/textarea-field.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * フォームインタラクションプロトタイプ
 * フォーカス、バリデーション、エラー表示のアニメーションを確認
 */
const meta: Meta = {
  title: 'Design System/Prototypes/Micro-interactions/Form',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'フォームのマイクロインタラクション（フォーカス、バリデーション、エラー表示）を確認するプロトタイプ',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * フォーカス状態
 */
export const Focus: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [InputFieldComponent, TextareaFieldComponent, CommonModule, FormsModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; background: #f9fafb; min-height: 100vh;">
        <h2 style="margin-bottom: 2rem; color: #111827;">フォームフォーカス効果</h2>
        <p style="margin-bottom: 1rem; color: #6b7280;">フィールドにフォーカスすると、ボーダー色が変更され、フォーカスリングが表示されます</p>
        <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 500px;">
          <app-input-field
            label="日付"
            type="date"
            placeholder="日付を選択"
            [required]="true">
          </app-input-field>
          <app-input-field
            label="タイトル"
            type="text"
            placeholder="タイトルを入力"
            [required]="true">
          </app-input-field>
          <app-textarea-field
            label="内容"
            placeholder="内容を入力"
            [required]="true"
            [rows]="5">
          </app-textarea-field>
        </div>
      </div>
    `,
  }),
};

/**
 * バリデーションエラー
 */
export const ValidationError: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [InputFieldComponent, TextareaFieldComponent, CommonModule, FormsModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; background: #f9fafb; min-height: 100vh;">
        <h2 style="margin-bottom: 2rem; color: #111827;">バリデーションエラー表示</h2>
        <p style="margin-bottom: 1rem; color: #6b7280;">エラーメッセージはスライドイン（200ms）で表示されます</p>
        <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 500px;">
          <app-input-field
            label="日付"
            type="date"
            placeholder="日付を選択"
            [required]="true"
            [hasError]="true"
            errorMessage="日付は必須です">
          </app-input-field>
          <app-input-field
            label="タイトル"
            type="text"
            placeholder="タイトルを入力"
            [required]="true"
            [hasError]="true"
            errorMessage="タイトルは必須です">
          </app-input-field>
          <app-textarea-field
            label="内容"
            placeholder="内容を入力"
            [required]="true"
            [hasError]="true"
            errorMessage="内容は必須です"
            [rows]="5">
          </app-textarea-field>
        </div>
      </div>
    `,
  }),
};

/**
 * 成功状態
 */
export const Success: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [InputFieldComponent, TextareaFieldComponent, CommonModule, FormsModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; background: #f9fafb; min-height: 100vh;">
        <h2 style="margin-bottom: 2rem; color: #111827;">成功状態</h2>
        <p style="margin-bottom: 1rem; color: #6b7280;">バリデーション成功時は視覚的なフィードバックが表示されます</p>
        <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 500px;">
          <app-input-field
            label="日付"
            type="date"
            value="2025-01-15"
            [required]="true">
          </app-input-field>
          <app-input-field
            label="タイトル"
            type="text"
            value="プロジェクト進捗確認"
            [required]="true">
          </app-input-field>
          <app-textarea-field
            label="内容"
            value="今日はプロジェクトの進捗を確認し、チームメンバーと打ち合わせを行いました。"
            [required]="true"
            [rows]="5">
          </app-textarea-field>
        </div>
      </div>
    `,
  }),
};


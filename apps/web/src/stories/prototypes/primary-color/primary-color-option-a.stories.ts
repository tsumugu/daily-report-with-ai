import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../../../app/shared/components/button/button.component';
import { CommonModule } from '@angular/common';

/**
 * Primary Color オプションA: Emerald Green (#10b981)
 * 成長・前進を表現するGreen系
 */
const meta: Meta = {
  title: 'Prototypes/PrimaryColor/OptionA-EmeraldGreen',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Primary Color オプションA: Emerald Green (#10b981) - 成長・前進を表現するGreen系',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * カラーパレット表示
 */
export const ColorPalette: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [CommonModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif;">
        <h2 style="margin-bottom: 2rem; color: #111827;">Primary Color: Emerald Green</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div style="background: #ecfdf5; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">50</div>
            <div style="background: #ecfdf5; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">#ecfdf5</div>
          </div>
          <div style="background: #d1fae5; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">100</div>
            <div style="background: #d1fae5; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">#d1fae5</div>
          </div>
          <div style="background: #a7f3d0; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">200</div>
            <div style="background: #a7f3d0; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">#a7f3d0</div>
          </div>
          <div style="background: #6ee7b7; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">300</div>
            <div style="background: #6ee7b7; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">#6ee7b7</div>
          </div>
          <div style="background: #34d399; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">400</div>
            <div style="background: #34d399; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">#34d399</div>
          </div>
          <div style="background: #10b981; padding: 1rem; border-radius: 8px; border: 2px solid #059669;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">500 (メイン)</div>
            <div style="background: #10b981; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">#10b981</div>
          </div>
          <div style="background: #059669; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">600</div>
            <div style="background: #059669; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #ffffff;">#059669</div>
          </div>
          <div style="background: #047857; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">700</div>
            <div style="background: #047857; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #ffffff;">#047857</div>
          </div>
          <div style="background: #065f46; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">800</div>
            <div style="background: #065f46; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #ffffff;">#065f46</div>
          </div>
          <div style="background: #064e3b; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">900</div>
            <div style="background: #064e3b; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #ffffff;">#064e3b</div>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * ボタン各種
 */
export const Buttons: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [ButtonComponent, CommonModule],
    },
    template: `
      <div style="
        padding: 2rem; 
        font-family: system-ui, sans-serif; 
        background: #f9fafb; 
        min-height: 100vh;
        --color-primary-50: #ecfdf5;
        --color-primary-100: #d1fae5;
        --color-primary-200: #a7f3d0;
        --color-primary-300: #6ee7b7;
        --color-primary-400: #34d399;
        --color-primary-500: #10b981;
        --color-primary-600: #059669;
        --color-primary-700: #047857;
        --color-primary-800: #065f46;
        --color-primary-900: #064e3b;
        --color-secondary-50: #ffffff;
        --color-secondary-100: #ffffff;
        --color-secondary-200: #f9fafb;
        --color-secondary-300: #f3f4f6;
        --color-secondary-400: #e5e7eb;
        --color-secondary-500: #d1d5db;
        --color-secondary-600: #ffffff;
        --color-secondary-700: #f9fafb;
        --color-secondary-800: #f3f4f6;
        --color-secondary-900: #e5e7eb;
        --color-secondary-text: #10b981;
        --gradient-primary: linear-gradient(135deg, #10b981 0%, #059669 100%);
        --gradient-primary-hover: linear-gradient(135deg, #059669 0%, #047857 100%);
      ">
        <h2 style="margin-bottom: 2rem; color: #111827;">ボタン各種（Emerald Green）</h2>
        <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 600px;">
          <div>
            <h3 style="margin-bottom: 1rem; font-size: 1rem; color: #374151;">Primary Button</h3>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <app-button variant="primary" size="sm">小さい</app-button>
              <app-button variant="primary" size="md">標準</app-button>
              <app-button variant="primary" size="lg">大きい</app-button>
            </div>
          </div>
          <div>
            <h3 style="margin-bottom: 1rem; font-size: 1rem; color: #374151;">Secondary Button</h3>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <app-button variant="secondary" size="md">保存</app-button>
              <app-button variant="secondary" size="md">キャンセル</app-button>
            </div>
          </div>
          <div>
            <h3 style="margin-bottom: 1rem; font-size: 1rem; color: #374151;">状態</h3>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <app-button variant="primary" size="md" [loading]="true">ローディング</app-button>
              <app-button variant="primary" size="md" [disabled]="true">無効</app-button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * カード表示
 */
export const Cards: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [CommonModule],
    },
    template: `
      <div style="padding: 2rem; font-family: system-ui, sans-serif; background: #f9fafb; min-height: 100vh;">
        <h2 style="margin-bottom: 2rem; color: #111827;">カード表示（Emerald Green）</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; max-width: 1200px;">
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.25rem;">日報カード</h3>
            <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.875rem;">2025-01-15</p>
            <p style="margin: 0 0 1rem 0; color: #374151; line-height: 1.6;">今日はプロジェクトの進捗を確認し、チームメンバーと打ち合わせを行いました。</p>
            <a href="#" style="color: #10b981; text-decoration: none; font-weight: 500; font-size: 0.875rem;">詳細を見る →</a>
          </div>
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.25rem;">フォロー項目</h3>
            <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.875rem;">よかったこと</p>
            <p style="margin: 0 0 1rem 0; color: #374151; line-height: 1.6;">定期的な振り返りが習慣化できてきた</p>
            <div style="display: inline-block; background: #ecfdf5; color: #047857; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;">進行中</div>
          </div>
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.25rem;">週次フォーカス</h3>
            <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.875rem;">今週の目標</p>
            <p style="margin: 0; color: #374151; line-height: 1.6;">日報を毎日書く習慣を定着させる</p>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * ホーム画面風の表示
 */
export const HomePage: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [ButtonComponent, CommonModule],
    },
    template: `
      <div style="
        font-family: system-ui, sans-serif; 
        background: #f9fafb; 
        min-height: 100vh;
        --color-primary-50: #ecfdf5;
        --color-primary-100: #d1fae5;
        --color-primary-200: #a7f3d0;
        --color-primary-300: #6ee7b7;
        --color-primary-400: #34d399;
        --color-primary-500: #10b981;
        --color-primary-600: #059669;
        --color-primary-700: #047857;
        --color-primary-800: #065f46;
        --color-primary-900: #064e3b;
        --color-secondary-50: #ffffff;
        --color-secondary-100: #ffffff;
        --color-secondary-200: #f9fafb;
        --color-secondary-300: #f3f4f6;
        --color-secondary-400: #e5e7eb;
        --color-secondary-500: #d1d5db;
        --color-secondary-600: #ffffff;
        --color-secondary-700: #f9fafb;
        --color-secondary-800: #f3f4f6;
        --color-secondary-900: #e5e7eb;
        --color-secondary-text: #10b981;
        --gradient-primary: linear-gradient(135deg, #10b981 0%, #059669 100%);
        --gradient-primary-hover: linear-gradient(135deg, #059669 0%, #047857 100%);
      ">
        <header style="background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 2rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 24px; height: 24px; background: #10b981; border-radius: 4px;"></div>
            <span style="font-size: 1.125rem; font-weight: 600; color: #10b981;">Daily Report</span>
          </div>
        </header>
        <main style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
          <h1 style="margin: 0 0 2rem 0; color: #111827; font-size: 1.875rem;">ホーム</h1>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.125rem;">📝 日報を書く</h3>
              <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.875rem;">今日の日報を記録します</p>
              <app-button variant="primary" size="md">日報を書く</app-button>
            </div>
            <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.125rem;">📊 日報一覧</h3>
              <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.875rem;">過去の日報を確認します</p>
              <app-button variant="secondary" size="md">一覧を見る</app-button>
            </div>
            <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.125rem;">🎯 フォロー項目</h3>
              <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.875rem;">フォロー項目を管理します</p>
              <app-button variant="secondary" size="md">管理する</app-button>
            </div>
          </div>
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 1rem 0; color: #111827; font-size: 1.25rem;">今週のフォーカス</h2>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div style="padding: 1rem; background: #f9fafb; border-radius: 6px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #374151; font-weight: 500;">日報を毎日書く習慣を定着させる</p>
              </div>
              <div style="padding: 1rem; background: #f9fafb; border-radius: 6px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #374151; font-weight: 500;">週次振り返りを実施する</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    `,
  }),
};


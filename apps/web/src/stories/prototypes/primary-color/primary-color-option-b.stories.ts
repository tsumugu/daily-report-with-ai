import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../../../app/shared/ui/button/button.component';
import { CommonModule } from '@angular/common';

/**
 * Primary Color オプションB: Blue (#3b82f6)
 * 信頼・安定を表現するBlue系
 */
const meta: Meta = {
  title: 'Design System/Prototypes/Primary Color/Option B',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Primary Color オプションB: Blue (#3b82f6) - 信頼・安定を表現するBlue系',
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
        <h2 style="margin-bottom: 2rem; color: #111827;">Primary Color: Blue</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div style="background: #eff6ff; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">50</div>
            <div style="background: #eff6ff; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">#eff6ff</div>
          </div>
          <div style="background: #dbeafe; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">100</div>
            <div style="background: #dbeafe; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">#dbeafe</div>
          </div>
          <div style="background: #bfdbfe; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">200</div>
            <div style="background: #bfdbfe; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">#bfdbfe</div>
          </div>
          <div style="background: #93c5fd; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">300</div>
            <div style="background: #93c5fd; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">#93c5fd</div>
          </div>
          <div style="background: #60a5fa; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">400</div>
            <div style="background: #60a5fa; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">#60a5fa</div>
          </div>
          <div style="background: #3b82f6; padding: 1rem; border-radius: 8px; border: 2px solid #2563eb;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">500 (メイン)</div>
            <div style="background: #3b82f6; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #ffffff;">#3b82f6</div>
          </div>
          <div style="background: #2563eb; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">600</div>
            <div style="background: #2563eb; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #ffffff;">#2563eb</div>
          </div>
          <div style="background: #1d4ed8; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">700</div>
            <div style="background: #1d4ed8; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #ffffff;">#1d4ed8</div>
          </div>
          <div style="background: #1e40af; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">800</div>
            <div style="background: #1e40af; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #ffffff;">#1e40af</div>
          </div>
          <div style="background: #1e3a8a; padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">900</div>
            <div style="background: #1e3a8a; height: 60px; border-radius: 4px; border: 1px solid #d1d5db;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #ffffff;">#1e3a8a</div>
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
        --color-primary-50: #eff6ff;
        --color-primary-100: #dbeafe;
        --color-primary-200: #bfdbfe;
        --color-primary-300: #93c5fd;
        --color-primary-400: #60a5fa;
        --color-primary-500: #3b82f6;
        --color-primary-600: #2563eb;
        --color-primary-700: #1d4ed8;
        --color-primary-800: #1e40af;
        --color-primary-900: #1e3a8a;
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
        --color-secondary-text: #3b82f6;
        --gradient-primary: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        --gradient-primary-hover: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      ">
        <h2 style="margin-bottom: 2rem; color: #111827;">ボタン各種（Blue）</h2>
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
        <h2 style="margin-bottom: 2rem; color: #111827;">カード表示（Blue）</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; max-width: 1200px;">
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.25rem;">日報カード</h3>
            <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.875rem;">2025-01-15</p>
            <p style="margin: 0 0 1rem 0; color: #374151; line-height: 1.6;">今日はプロジェクトの進捗を確認し、チームメンバーと打ち合わせを行いました。</p>
            <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 500; font-size: 0.875rem;">詳細を見る →</a>
          </div>
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.25rem;">フォロー項目</h3>
            <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.875rem;">よかったこと</p>
            <p style="margin: 0 0 1rem 0; color: #374151; line-height: 1.6;">定期的な振り返りが習慣化できてきた</p>
            <div style="display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;">進行中</div>
          </div>
          <div style="background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6;">
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
        --color-primary-50: #eff6ff;
        --color-primary-100: #dbeafe;
        --color-primary-200: #bfdbfe;
        --color-primary-300: #93c5fd;
        --color-primary-400: #60a5fa;
        --color-primary-500: #3b82f6;
        --color-primary-600: #2563eb;
        --color-primary-700: #1d4ed8;
        --color-primary-800: #1e40af;
        --color-primary-900: #1e3a8a;
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
        --color-secondary-text: #3b82f6;
        --gradient-primary: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        --gradient-primary-hover: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      ">
        <header style="background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 2rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 24px; height: 24px; background: #3b82f6; border-radius: 4px;"></div>
            <span style="font-size: 1.125rem; font-weight: 600; color: #3b82f6;">Daily Report</span>
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
              <div style="padding: 1rem; background: #f9fafb; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #374151; font-weight: 500;">日報を毎日書く習慣を定着させる</p>
              </div>
              <div style="padding: 1rem; background: #f9fafb; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #374151; font-weight: 500;">週次振り返りを実施する</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    `,
  }),
};


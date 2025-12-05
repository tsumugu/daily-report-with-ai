import { Meta, StoryObj } from '@storybook/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-colors-showcase',
  standalone: true,
  template: `
    <div style="padding: 2rem; font-family: system-ui, sans-serif;">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">🎨 カラートークン</h1>
      <p style="color: #6b7280; margin-bottom: 2rem;">
        Daily Report で使用するカラーパレットです。<br>
        すべての色は CSS 変数として定義されており、一貫したデザインを実現します。
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0;">
      
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Primary Colors（メインカラー）</h2>
      <p style="color: #6b7280; margin-bottom: 1rem;">ブランドカラーとして使用する紫〜青系のカラーです。</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="aspect-ratio: 1; background: var(--color-primary-50); border-radius: 8px; border: 1px solid #e5e7eb;"></div>
          <span style="font-size: 10px; color: #6b7280;">primary-50</span>
          <span style="font-size: 10px; color: #9ca3af; font-family: monospace;">#eef2ff</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="aspect-ratio: 1; background: var(--color-primary-100); border-radius: 8px; border: 1px solid #e5e7eb;"></div>
          <span style="font-size: 10px; color: #6b7280;">primary-100</span>
          <span style="font-size: 10px; color: #9ca3af; font-family: monospace;">#e0e7ff</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="aspect-ratio: 1; background: var(--color-primary-200); border-radius: 8px; border: 1px solid #e5e7eb;"></div>
          <span style="font-size: 10px; color: #6b7280;">primary-200</span>
          <span style="font-size: 10px; color: #9ca3af; font-family: monospace;">#c7d2fe</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="aspect-ratio: 1; background: var(--color-primary-300); border-radius: 8px; border: 1px solid #e5e7eb;"></div>
          <span style="font-size: 10px; color: #6b7280;">primary-300</span>
          <span style="font-size: 10px; color: #9ca3af; font-family: monospace;">#a5b4fc</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="aspect-ratio: 1; background: var(--color-primary-400); border-radius: 8px; border: 1px solid #e5e7eb;"></div>
          <span style="font-size: 10px; color: #6b7280;">primary-400</span>
          <span style="font-size: 10px; color: #9ca3af; font-family: monospace;">#818cf8</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="aspect-ratio: 1; background: var(--color-primary-500); border-radius: 8px; border: 1px solid #e5e7eb;"></div>
          <span style="font-size: 10px; color: #6b7280;">primary-500</span>
          <span style="font-size: 10px; color: #9ca3af; font-family: monospace;">#667eea</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="aspect-ratio: 1; background: var(--color-primary-600); border-radius: 8px; border: 1px solid #e5e7eb;"></div>
          <span style="font-size: 10px; color: #6b7280;">primary-600</span>
          <span style="font-size: 10px; color: #9ca3af; font-family: monospace;">#5b5bd6</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="aspect-ratio: 1; background: var(--color-primary-700); border-radius: 8px; border: 1px solid #e5e7eb;"></div>
          <span style="font-size: 10px; color: #6b7280;">primary-700</span>
          <span style="font-size: 10px; color: #9ca3af; font-family: monospace;">#4f46e5</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="aspect-ratio: 1; background: var(--color-primary-800); border-radius: 8px; border: 1px solid #e5e7eb;"></div>
          <span style="font-size: 10px; color: #6b7280;">primary-800</span>
          <span style="font-size: 10px; color: #9ca3af; font-family: monospace;">#4338ca</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="aspect-ratio: 1; background: var(--color-primary-900); border-radius: 8px; border: 1px solid #e5e7eb;"></div>
          <span style="font-size: 10px; color: #6b7280;">primary-900</span>
          <span style="font-size: 10px; color: #9ca3af; font-family: monospace;">#3730a3</span>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0;">

      <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Gradients（グラデーション）</h2>
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
        <div style="width: 200px; height: 100px; border-radius: 8px; background: var(--gradient-primary); display: flex; align-items: flex-end; padding: 0.5rem;">
          <span style="color: white; font-size: 12px; font-weight: 500;">gradient-primary</span>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0;">

      <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">使用方法</h2>
      <pre style="background: #f3f4f6; padding: 1rem; border-radius: 8px; overflow-x: auto;"><code>/* CSS変数として使用 */
.button {{ '{' }}
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
{{ '}' }}

.error-message {{ '{' }}
  color: var(--color-error-600);
  background: var(--color-error-50);
{{ '}' }}

/* グラデーション */
.hero {{ '{' }}
  background: var(--gradient-primary);
{{ '}' }}</code></pre>
    </div>
  `,
  styles: [],
})
class ColorsShowcaseComponent {}

const meta: Meta<ColorsShowcaseComponent> = {
  title: 'Design Tokens/Colors',
  component: ColorsShowcaseComponent,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<ColorsShowcaseComponent>;

export const Default: Story = {};


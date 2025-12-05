import { Meta, StoryObj } from '@storybook/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-colors-showcase',
  standalone: true,
  template: `
    <div class="colors-showcase">
      <h1 class="colors-showcase__title">🎨 カラートークン</h1>
      <p class="colors-showcase__description">
        Daily Report で使用するカラーパレットです。<br>
        すべての色は CSS 変数として定義されており、一貫したデザインを実現します。
      </p>
      
      <hr class="colors-showcase__divider">
      
      <h2 class="colors-showcase__section-title">Primary Colors（メインカラー）</h2>
      <p class="colors-showcase__section-description">ブランドカラーとして使用する紫〜青系のカラーです。</p>
      <div class="colors-showcase__grid">
        <div class="color-swatch">
          <div class="color-swatch__box" style="background: var(--color-primary-50);"></div>
          <span class="color-swatch__name">primary-50</span>
          <span class="color-swatch__value">#eef2ff</span>
        </div>
        <div class="color-swatch">
          <div class="color-swatch__box" style="background: var(--color-primary-100);"></div>
          <span class="color-swatch__name">primary-100</span>
          <span class="color-swatch__value">#e0e7ff</span>
        </div>
        <div class="color-swatch">
          <div class="color-swatch__box" style="background: var(--color-primary-200);"></div>
          <span class="color-swatch__name">primary-200</span>
          <span class="color-swatch__value">#c7d2fe</span>
        </div>
        <div class="color-swatch">
          <div class="color-swatch__box" style="background: var(--color-primary-300);"></div>
          <span class="color-swatch__name">primary-300</span>
          <span class="color-swatch__value">#a5b4fc</span>
        </div>
        <div class="color-swatch">
          <div class="color-swatch__box" style="background: var(--color-primary-400);"></div>
          <span class="color-swatch__name">primary-400</span>
          <span class="color-swatch__value">#818cf8</span>
        </div>
        <div class="color-swatch">
          <div class="color-swatch__box" style="background: var(--color-primary-500);"></div>
          <span class="color-swatch__name">primary-500</span>
          <span class="color-swatch__value">#667eea</span>
        </div>
        <div class="color-swatch">
          <div class="color-swatch__box" style="background: var(--color-primary-600);"></div>
          <span class="color-swatch__name">primary-600</span>
          <span class="color-swatch__value">#5b5bd6</span>
        </div>
        <div class="color-swatch">
          <div class="color-swatch__box" style="background: var(--color-primary-700);"></div>
          <span class="color-swatch__name">primary-700</span>
          <span class="color-swatch__value">#4f46e5</span>
        </div>
        <div class="color-swatch">
          <div class="color-swatch__box" style="background: var(--color-primary-800);"></div>
          <span class="color-swatch__name">primary-800</span>
          <span class="color-swatch__value">#4338ca</span>
        </div>
        <div class="color-swatch">
          <div class="color-swatch__box" style="background: var(--color-primary-900);"></div>
          <span class="color-swatch__name">primary-900</span>
          <span class="color-swatch__value">#3730a3</span>
        </div>
      </div>

      <hr class="colors-showcase__divider">

      <h2 class="colors-showcase__section-title">Gradients（グラデーション）</h2>
      <div class="gradient-showcase">
        <div class="gradient-showcase__box" style="background: var(--gradient-primary);">
          <span class="gradient-showcase__label">gradient-primary</span>
        </div>
      </div>

      <hr class="colors-showcase__divider">

      <h2 class="colors-showcase__section-title">使用方法</h2>
      <pre class="code-example"><code>/* CSS変数として使用 */
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
  styles: [`
    .colors-showcase {
      padding: 2rem;
      font-family: system-ui, sans-serif;

      &__title {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: var(--color-text-primary);
      }

      &__description {
        color: var(--color-text-secondary);
        margin-bottom: 2rem;
        line-height: 1.6;
      }

      &__divider {
        border: none;
        border-top: 1px solid var(--color-border-default);
        margin: 2rem 0;
      }

      &__section-title {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: var(--color-text-primary);
      }

      &__section-description {
        color: var(--color-text-secondary);
        margin-bottom: 1rem;
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
    }

    .color-swatch {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      &__box {
        aspect-ratio: 1;
        border-radius: 8px;
        border: 1px solid var(--color-border-default);
      }

      &__name {
        font-size: 10px;
        color: var(--color-text-secondary);
      }

      &__value {
        font-size: 10px;
        color: var(--color-text-tertiary);
        font-family: monospace;
      }
    }

    .gradient-showcase {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;

      &__box {
        width: 200px;
        height: 100px;
        border-radius: 8px;
        display: flex;
        align-items: flex-end;
        padding: 0.5rem;
      }

      &__label {
        color: var(--color-text-inverse);
        font-size: 12px;
        font-weight: 500;
      }
    }

    .code-example {
      background: var(--color-bg-secondary);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid var(--color-border-default);

      code {
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        color: var(--color-text-primary);
      }
    }
  `],
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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { IconComponent, IconName } from '../../app/shared/components/icon/icon.component';
import {
  LucideAngularModule,
  FileText,
  Clipboard,
  ChartBar,
  Target,
  Sparkles,
  Lightbulb,
  Calendar,
  TriangleAlert,
  Eye,
  EyeOff,
  Heart,
  Pin,
} from 'lucide-angular';

@Component({
  selector: 'app-icons-showcase',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
  ],
  template: `
    <div class="icons-showcase">
      <h1 class="icons-showcase__title">🧭 アイコントークン</h1>
      <p class="icons-showcase__description">
        UI全体で再利用するアイコンセットです。Lucideに揃え、Semanticな名前で管理しています。
      </p>

      <div class="icons-grid">
        @for (icon of icons; track icon.name) {
          <div class="icon-card">
            <div class="icon-card__preview">
              <app-icon [name]="icon.name" [size]="28"></app-icon>
            </div>
            <div class="icon-card__label">{{ icon.name }}</div>
            <div class="icon-card__hint">{{ icon.label }}</div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .icons-showcase {
        padding: 2rem;
        font-family: system-ui, sans-serif;
        color: var(--color-text-primary);
      }

      .icons-showcase__title {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .icons-showcase__description {
        margin-bottom: 1.5rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
      }

      .icons-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1rem;
      }

      .icon-card {
        border: 1px solid var(--color-border-default);
        border-radius: 12px;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: var(--color-bg-secondary);
      }

      .icon-card__preview {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        background: var(--color-primary-50);
        color: var(--color-primary-700);
      }

      .icon-card__label {
        font-family: monospace;
        font-size: 0.9rem;
        color: var(--color-text-primary);
      }

      .icon-card__hint {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
      }
    `,
  ],
})
class IconsShowcaseComponent {
  icons: { name: IconName; label: string }[] = [
    { name: 'file-text', label: 'ファイル' },
    { name: 'clipboard', label: 'クリップボード' },
    { name: 'bar-chart-3', label: 'チャート' },
    { name: 'target', label: 'ターゲット' },
    { name: 'sparkles', label: 'スパークル' },
    { name: 'lightbulb', label: '電球' },
    { name: 'calendar', label: 'カレンダー' },
    { name: 'alert-triangle', label: '警告' },
    { name: 'triangle-alert', label: '警告(代替)' },
    { name: 'eye', label: '表示' },
    { name: 'eye-off', label: '非表示' },
    { name: 'heart', label: 'お気に入り' },
    { name: 'pin', label: 'ピン留め' },
  ];
}

const meta: Meta<IconsShowcaseComponent> = {
  title: 'Design Tokens/Icons',
  component: IconsShowcaseComponent,
  decorators: [
    moduleMetadata({
      imports: [
        LucideAngularModule.pick({
          FileText,
          Clipboard,
          ChartBar,
          Target,
          Sparkles,
          Lightbulb,
          Calendar,
          TriangleAlert,
          Eye,
          EyeOff,
          Heart,
          Pin,
        }),
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<IconsShowcaseComponent>;

export const Default: Story = {};


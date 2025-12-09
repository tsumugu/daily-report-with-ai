import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { IconButtonComponent } from '../../app/shared/components/icon-button/icon-button.component';
import { IconName } from '../../app/shared/components/icon/icon.component';
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

const meta: Meta<IconButtonComponent> = {
  title: 'Components/IconButton',
  component: IconButtonComponent,
  tags: ['autodocs'],
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
  argTypes: {
    iconName: {
      control: 'select',
      options: [
        'file-text',
        'clipboard',
        'bar-chart-3',
        'target',
        'sparkles',
        'lightbulb',
        'calendar',
        'alert-triangle',
        'triangle-alert',
        'eye',
        'eye-off',
        'heart',
        'pin',
      ] as IconName[],
    },
    size: {
      control: { type: 'number', min: 16, max: 48, step: 4 },
    },
    color: {
      control: 'color',
    },
    tooltip: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    ariaLabel: {
      control: 'text',
    },
    pinned: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<IconButtonComponent>;

export const Default: Story = {
  args: {
    iconName: 'heart',
    size: 24,
  },
};

export const WithTooltip: Story = {
  args: {
    iconName: 'heart',
    size: 24,
    tooltip: 'お気に入り',
  },
};

export const Pinned: Story = {
  args: {
    iconName: 'pin',
    size: 24,
    pinned: true,
    tooltip: 'ピン留め',
  },
};

export const Disabled: Story = {
  args: {
    iconName: 'heart',
    size: 24,
    disabled: true,
    tooltip: '無効',
  },
};

export const Loading: Story = {
  args: {
    iconName: 'heart',
    size: 24,
    loading: true,
    tooltip: '読み込み中',
  },
};

export const Small: Story = {
  args: {
    iconName: 'eye',
    size: 16,
    tooltip: '表示',
  },
};

export const Large: Story = {
  args: {
    iconName: 'target',
    size: 32,
    tooltip: 'ターゲット',
  },
};

export const WithColor: Story = {
  args: {
    iconName: 'heart',
    size: 24,
    color: '#ef4444',
    tooltip: '赤いハート',
  },
};


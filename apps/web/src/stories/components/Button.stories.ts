import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../../app/shared/components/button/button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
    icon: {
      control: 'select',
      options: ['none', 'plus'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: '<app-button [variant]="variant" [size]="size">ログイン</app-button>',
  }),
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    icon: 'none',
  },
  render: (args) => ({
    props: args,
    template: '<app-button [variant]="variant" [size]="size" [icon]="icon">保存</app-button>',
  }),
};

// Outline variantはsecondaryに統合されました
// このストーリーは削除され、Secondaryストーリーで確認できます

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: '<app-button [variant]="variant" [size]="size">詳細</app-button>',
  }),
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: '<app-button [variant]="variant" [size]="size">削除</app-button>',
  }),
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
  },
  render: (args) => ({
    props: args,
    template: '<app-button [variant]="variant" [size]="size">小さいボタン</app-button>',
  }),
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
  },
  render: (args) => ({
    props: args,
    template: '<app-button [variant]="variant" [size]="size">大きいボタン</app-button>',
  }),
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: true,
  },
  render: (args) => ({
    props: args,
    template: '<app-button [variant]="variant" [size]="size" [loading]="loading">送信中...</app-button>',
  }),
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: '<app-button [variant]="variant" [size]="size" [disabled]="disabled">無効</app-button>',
  }),
};

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    fullWidth: true,
  },
  render: (args) => ({
    props: args,
    template: '<app-button [variant]="variant" [size]="size" [fullWidth]="fullWidth">全幅ボタン</app-button>',
  }),
};



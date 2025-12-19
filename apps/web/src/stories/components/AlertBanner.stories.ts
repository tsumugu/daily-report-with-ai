import { Meta, StoryObj } from '@storybook/angular';
import { AlertBannerComponent } from '../../app/shared/ui/alert-banner/alert-banner.component';

const meta: Meta<AlertBannerComponent> = {
  title: 'Design System/UI Components/AlertBanner',
  component: AlertBannerComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info'],
    },
    message: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<AlertBannerComponent>;

export const Success: Story = {
  args: {
    variant: 'success',
    message: 'ログインに成功しました',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    message: 'パスワードの有効期限が近づいています',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    message: 'メールアドレスまたはパスワードが正しくありません',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    message: 'システムメンテナンスのお知らせ',
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'info',
    message: 'この通知は閉じることができます',
    dismissible: true,
  },
};

export const LongMessage: Story = {
  args: {
    variant: 'warning',
    message:
      'これは長いメッセージの例です。複数行にわたるメッセージでも適切に表示されることを確認するためのテキストです。アラートバナーは柔軟にコンテンツを表示できます。',
  },
};

export const WithSlotContent: Story = {
  args: {
    variant: 'success',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-alert-banner [variant]="variant">
        <strong>成功:</strong> アカウントが作成されました。<a href="#" style="text-decoration: underline; margin-left: 0.25rem;">ログインページへ</a>
      </app-alert-banner>
    `,
  }),
};


import { Meta, StoryObj } from '@storybook/angular';
import { InputFieldComponent } from '../../app/shared/ui/input-field/input-field.component';

const meta: Meta<InputFieldComponent> = {
  title: 'Design System/UI Components/InputField',
  component: InputFieldComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password'],
    },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    errorMessage: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<InputFieldComponent>;

export const Text: Story = {
  args: {
    label: 'お名前',
    type: 'text',
    placeholder: '山田 太郎',
    id: 'name',
  },
};

export const Email: Story = {
  args: {
    label: 'メールアドレス',
    type: 'email',
    placeholder: 'your@email.com',
    id: 'email',
    autocomplete: 'email',
  },
};

export const Password: Story = {
  args: {
    label: 'パスワード',
    type: 'password',
    placeholder: '••••••••',
    id: 'password',
    autocomplete: 'current-password',
  },
};

export const WithError: Story = {
  args: {
    label: 'メールアドレス',
    type: 'email',
    placeholder: 'your@email.com',
    id: 'email-error',
    errorMessage: 'メールアドレスの形式が正しくありません',
  },
};

export const Disabled: Story = {
  args: {
    label: 'お名前',
    type: 'text',
    placeholder: '山田 太郎',
    id: 'name-disabled',
    disabled: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    type: 'text',
    placeholder: 'ラベルなし入力',
    id: 'no-label',
  },
};


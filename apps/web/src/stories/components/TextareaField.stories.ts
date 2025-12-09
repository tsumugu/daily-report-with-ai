import type { Meta, StoryObj } from '@storybook/angular';
import { TextareaFieldComponent } from '../../app/shared/components/textarea-field/textarea-field.component';

const meta: Meta<TextareaFieldComponent> = {
  title: 'Components/TextareaField',
  component: TextareaFieldComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<TextareaFieldComponent>;

export const Default: Story = {
  args: {
    label: 'できごと',
    id: 'events',
    labelIcon: 'file-text',
    required: true,
    maxLength: 1000,
    rows: 4,
    placeholder: '今日の主な業務内容、出来事を記入してください',
  },
};

export const WithCharCount: Story = {
  args: {
    label: '学び',
    id: 'learnings',
    labelIcon: 'lightbulb',
    maxLength: 1000,
    rows: 3,
    placeholder: '業務を通じて得た気づき、学びを記入してください',
    showCharCount: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'できごと',
    id: 'events-error',
    required: true,
    errorMessage: 'この項目は必須です',
    maxLength: 1000,
  },
};

export const OverLimit: Story = {
  args: {
    label: 'できごと',
    id: 'events-over',
    maxLength: 10,
    value: 'これは10文字を超える長いテキストです',
    showCharCount: true,
  },
};

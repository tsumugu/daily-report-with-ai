import type { Meta, StoryObj } from '@storybook/angular';
import { AddButtonComponent } from '../../app/shared/components/add-button/add-button.component';

const meta: Meta<AddButtonComponent> = {
  title: 'Components/AddButton',
  component: AddButtonComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<AddButtonComponent>;

export const Default: Story = {
  args: {
    label: '追加',
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'よかったことを追加',
  },
};


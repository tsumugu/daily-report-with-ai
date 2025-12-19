import { Meta, StoryObj } from '@storybook/angular';
import { ViewToggleComponent } from '../../app/shared/ui/view-toggle/view-toggle.component';

const meta: Meta<ViewToggleComponent> = {
  title: 'Design System/UI Components/ViewToggle',
  component: ViewToggleComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'ビュー切り替えトグルコンポーネント。2つのビューを切り替えるための汎用的なコンポーネントです。',
      },
    },
  },
  argTypes: {
    viewType: {
      control: 'select',
      options: ['tree', 'card'],
      description: '現在のビュータイプ',
    },
    treeLabel: {
      control: 'text',
      description: '階層表示のラベル',
    },
    cardLabel: {
      control: 'text',
      description: 'カード表示のラベル',
    },
    viewTypeChange: {
      action: 'viewTypeChange',
      description: 'ビュータイプが変更されたときに発火するイベント',
    },
  },
};

export default meta;
type Story = StoryObj<ViewToggleComponent>;

export const Default: Story = {
  args: {
    viewType: 'tree',
    treeLabel: '階層表示',
    cardLabel: 'カード表示',
  },
};

export const TreeViewActive: Story = {
  args: {
    viewType: 'tree',
    treeLabel: '階層表示',
    cardLabel: 'カード表示',
  },
};

export const CardViewActive: Story = {
  args: {
    viewType: 'card',
    treeLabel: '階層表示',
    cardLabel: 'カード表示',
  },
};

export const CustomLabels: Story = {
  args: {
    viewType: 'tree',
    treeLabel: 'リスト表示',
    cardLabel: 'グリッド表示',
  },
};


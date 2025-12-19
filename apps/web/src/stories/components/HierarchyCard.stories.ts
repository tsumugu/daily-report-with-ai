import { Meta, StoryObj } from '@storybook/angular';
import { HierarchyCardComponent } from '../../app/shared/ui/hierarchy-card/hierarchy-card.component';

const meta: Meta<HierarchyCardComponent> = {
  title: 'Design System/UI Components/HierarchyCard',
  component: HierarchyCardComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '階層構造のカード表示コンポーネント。汎用的な階層構造のカード表示に使用可能です。',
      },
    },
  },
  argTypes: {
    showExpandIcon: {
      control: 'boolean',
      description: '展開アイコンを表示するかどうか',
    },
    isExpanded: {
      control: 'boolean',
      description: '展開されているかどうか',
    },
    clicked: {
      action: 'clicked',
      description: 'カードがクリックされたときに発火するイベント',
    },
    expandToggled: {
      action: 'expandToggled',
      description: '展開/折りたたみが切り替えられたときに発火するイベント',
    },
  },
};

export default meta;
type Story = StoryObj<HierarchyCardComponent>;

const mockArgs = {
  id: '1',
  title: 'スキル習得',
  subtitle: 'フロントエンド開発のスキルを向上させる',
  metadata: '2025-01-01 〜 2025-06-30',
  levelName: '長期目標',
};

export const Default: Story = {
  args: {
    ...mockArgs,
    showExpandIcon: false,
    isExpanded: false,
  },
};

export const WithExpandIcon: Story = {
  args: {
    ...mockArgs,
    showExpandIcon: true,
    isExpanded: false,
  },
};

export const Expanded: Story = {
  args: {
    ...mockArgs,
    showExpandIcon: true,
    isExpanded: true,
  },
};

export const MediumLevel: Story = {
  args: {
    ...mockArgs,
    title: 'React基礎を習得',
    levelName: '中期目標',
    showExpandIcon: true,
    isExpanded: false,
  },
};

export const ShortLevel: Story = {
  args: {
    ...mockArgs,
    title: '週次学習',
    levelName: '短期目標',
    showExpandIcon: false,
    isExpanded: false,
  },
};

export const WithoutSubtitle: Story = {
  args: {
    ...mockArgs,
    subtitle: undefined,
    showExpandIcon: false,
    isExpanded: false,
  },
};


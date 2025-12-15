import { Meta, StoryObj } from '@storybook/angular';
import { HierarchyCardComponent, HierarchyCardData } from '../../app/shared/components/hierarchy-card/hierarchy-card.component';

const meta: Meta<HierarchyCardComponent> = {
  title: 'Components/HierarchyCard',
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

const mockData: HierarchyCardData = {
  id: '1',
  title: 'スキル習得',
  subtitle: 'フロントエンド開発のスキルを向上させる',
  metadata: '2025-01-01 〜 2025-06-30',
  level: 'long',
  type: 'skill',
};

export const Default: Story = {
  args: {
    data: mockData,
    showExpandIcon: false,
    isExpanded: false,
  },
};

export const WithExpandIcon: Story = {
  args: {
    data: mockData,
    showExpandIcon: true,
    isExpanded: false,
  },
};

export const Expanded: Story = {
  args: {
    data: mockData,
    showExpandIcon: true,
    isExpanded: true,
  },
};

export const MediumLevel: Story = {
  args: {
    data: {
      ...mockData,
      title: 'React基礎を習得',
      level: 'medium',
    },
    showExpandIcon: true,
    isExpanded: false,
  },
};

export const ShortLevel: Story = {
  args: {
    data: {
      ...mockData,
      title: '週次学習',
      level: 'short',
    },
    showExpandIcon: false,
    isExpanded: false,
  },
};

export const WithoutSubtitle: Story = {
  args: {
    data: {
      ...mockData,
      subtitle: undefined,
    },
    showExpandIcon: false,
    isExpanded: false,
  },
};


import { Meta, StoryObj } from '@storybook/angular';
import { HierarchyTreeViewComponent, HierarchyTreeNode } from '../../app/shared/ui/hierarchy-tree-view/hierarchy-tree-view.component';

const meta: Meta<HierarchyTreeViewComponent> = {
  title: 'Design System/UI Components/HierarchyTreeView',
  component: HierarchyTreeViewComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '階層構造のツリービューコンポーネント。階層構造を縦に階段状に積む形式で表示します。',
      },
    },
  },
  argTypes: {
    expandedIds: {
      control: 'object',
      description: '展開されているノードのIDのセット',
    },
    nodeClicked: {
      action: 'nodeClicked',
      description: 'ノードがクリックされたときに発火するイベント',
    },
    expandToggled: {
      action: 'expandToggled',
      description: '展開/折りたたみが切り替えられたときに発火するイベント',
    },
  },
};

export default meta;
type Story = StoryObj<HierarchyTreeViewComponent>;

const mockNodes: HierarchyTreeNode[] = [
  {
    id: '1',
    data: {
      id: '1',
      title: 'スキル習得',
      subtitle: 'フロントエンド開発のスキルを向上させる',
      metadata: '2025-01-01 〜 2025-06-30',
      levelName: '長期目標',
    },
    children: [
      {
        id: '2',
        data: {
          id: '2',
          title: 'React基礎を習得',
          subtitle: 'Reactの基本概念と実践的な使い方を学ぶ',
          metadata: '2025-01-01 〜 2025-03-31',
          levelName: '中期目標',
        },
        children: [
          {
            id: '3',
            data: {
              id: '3',
              title: '週次学習',
              metadata: '2025-01-01 〜 2025-01-07',
              levelName: '短期目標',
            },
            children: [],
          },
        ],
      },
      {
        id: '4',
        data: {
          id: '4',
          title: 'Next.jsを習得',
          subtitle: 'Next.jsの基本から応用まで',
          metadata: '2025-04-01 〜 2025-06-30',
          levelName: '中期目標',
        },
        children: [],
      },
    ],
  },
];

export const Default: Story = {
  args: {
    nodes: mockNodes,
    expandedIds: new Set<string>(),
  },
};

export const Expanded: Story = {
  args: {
    nodes: mockNodes,
    expandedIds: new Set<string>(['1', '2']),
  },
};

export const SingleNode: Story = {
  args: {
    nodes: [
      {
        id: '1',
        data: {
          id: '1',
          title: '単一目標',
          metadata: '2025-01-01 〜 2025-06-30',
          levelName: '長期目標',
        },
        children: [],
      },
    ],
    expandedIds: new Set<string>(),
  },
};

export const DeepHierarchy: Story = {
  args: {
    nodes: [
      {
        id: '1',
        data: {
          id: '1',
          title: '長期目標1',
          levelName: '長期目標',
        },
        children: [
          {
            id: '2',
            data: {
              id: '2',
              title: '中期目標1',
              levelName: '中期目標',
            },
            children: [
              {
                id: '3',
                data: {
                  id: '3',
                  title: '短期目標1',
                  levelName: '短期目標',
                },
                children: [
                  {
                    id: '4',
                    data: {
                      id: '4',
                      title: '週次目標1',
                      levelName: '短期目標',
                    },
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    expandedIds: new Set<string>(['1', '2', '3']),
  },
};


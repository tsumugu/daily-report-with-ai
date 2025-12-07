import { Meta, StoryObj } from '@storybook/angular';
import { FollowupCardComponent } from '../../app/features/followup/components/followup-card/followup-card.component';
import { FollowupItem } from '../../app/shared/models/followup.model';

const meta: Meta<FollowupCardComponent> = {
  title: 'Components/FollowupCard',
  component: FollowupCardComponent,
  tags: ['autodocs'],
  argTypes: {
    isInWeeklyFocus: { control: 'boolean' },
    isAddingToWeeklyFocus: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<FollowupCardComponent>;

const baseItem: FollowupItem = {
  itemType: 'goodPoint',
  item: {
    id: 'gp-1',
    content: 'チーム会議で積極的に発言できた',
    status: '進行中',
    success_count: 1,
    createdAt: '2025-12-05T12:00:00Z',
  },
  reportDate: '2025-12-05',
  reportId: 'report-1',
};

export const GoodPoint: Story = {
  args: {
    item: baseItem,
    isInWeeklyFocus: false,
    isAddingToWeeklyFocus: false,
  },
};

export const Improvement: Story = {
  args: {
    item: {
      itemType: 'improvement',
      item: {
        id: 'imp-1',
        content: '朝の準備を前日の夜に済ませる',
        status: '未着手',
        success_count: 0,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-1',
    },
    isInWeeklyFocus: false,
    isAddingToWeeklyFocus: false,
  },
};

export const InWeeklyFocus: Story = {
  args: {
    item: baseItem,
    isInWeeklyFocus: true,
    isAddingToWeeklyFocus: false,
  },
};

export const AddingToWeeklyFocus: Story = {
  args: {
    item: baseItem,
    isInWeeklyFocus: false,
    isAddingToWeeklyFocus: true,
  },
};

export const Settled: Story = {
  args: {
    item: {
      itemType: 'goodPoint',
      item: {
        id: 'gp-2',
        content: '毎日振り返りを実施している',
        status: '定着',
        success_count: 3,
        createdAt: '2025-12-01T12:00:00Z',
      },
      reportDate: '2025-12-01',
      reportId: 'report-2',
    },
    isInWeeklyFocus: false,
    isAddingToWeeklyFocus: false,
  },
};

export const SuccessStatus: Story = {
  args: {
    item: {
      itemType: 'goodPoint',
      item: {
        id: 'gp-3',
        content: 'チーム会議で積極的に発言できた',
        status: '再現成功',
        success_count: 2,
        createdAt: '2025-12-04T12:00:00Z',
      },
      reportDate: '2025-12-04',
      reportId: 'report-3',
    },
    isInWeeklyFocus: false,
    isAddingToWeeklyFocus: false,
  },
};

export const FailedStatus: Story = {
  args: {
    item: {
      itemType: 'improvement',
      item: {
        id: 'imp-2',
        content: '朝の準備を前日の夜に済ませる',
        status: '未達成',
        success_count: 0,
        createdAt: '2025-12-03T12:00:00Z',
      },
      reportDate: '2025-12-03',
      reportId: 'report-4',
    },
    isInWeeklyFocus: false,
    isAddingToWeeklyFocus: false,
  },
};

export const LongContent: Story = {
  args: {
    item: {
      itemType: 'goodPoint',
      item: {
        id: 'gp-4',
        content:
          'これは非常に長いコンテンツの例です。3行以上になる場合の表示を確認するためのテキストです。フォロー項目カードでは長いコンテンツも適切に表示される必要があります。',
        status: '進行中',
        success_count: 1,
        createdAt: '2025-12-05T12:00:00Z',
      },
      reportDate: '2025-12-05',
      reportId: 'report-5',
    },
    isInWeeklyFocus: false,
    isAddingToWeeklyFocus: false,
  },
};


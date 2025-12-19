import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RelatedDailyReportsListComponent } from '../../app/shared/domain-components/related-daily-reports-list/related-daily-reports-list.component';
import { GoalService } from '../../app/features/goal/services/goal.service';
import { of } from 'rxjs';
import { GoalDetailResponse } from '../../app/features/goal/models/goal.model';

const meta: Meta<RelatedDailyReportsListComponent> = {
  title: 'Design System/Domain Components/RelatedDailyReportsList',
  component: RelatedDailyReportsListComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: GoalService,
          useValue: {
            getGoal: () => of({
              id: 'goal-1',
              userId: 'user-1',
              name: '目標名',
              description: null,
              startDate: '2025-01-01',
              endDate: '2025-12-31',
              parentId: null,
              goalType: 'skill',
              successCriteria: null,
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
              parent: null,
              children: [],
              relatedDailyReports: [
                {
                  id: 'report-1',
                  date: '2025-12-16',
                  events: '今日やったこと1',
                  createdAt: '2025-12-16T00:00:00Z',
                },
                {
                  id: 'report-2',
                  date: '2025-12-15',
                  events: '今日やったこと2',
                  createdAt: '2025-12-15T00:00:00Z',
                },
                {
                  id: 'report-3',
                  date: '2025-12-14',
                  events: '今日やったこと3',
                  createdAt: '2025-12-14T00:00:00Z',
                },
              ],
              relatedDailyReportsCount: 3,
            } as GoalDetailResponse),
          },
        },
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: '目標詳細画面で関連日報を表示するコンポーネント。並び替え・ページネーション対応。',
      },
    },
  },
  argTypes: {
    goalId: {
      control: 'text',
      description: '目標ID',
    },
    limit: {
      control: { type: 'number', min: 1, max: 50 },
      description: '初期表示件数',
    },
    sort: {
      control: 'select',
      options: ['asc', 'desc'],
      description: '並び順',
    },
  },
};

export default meta;
type Story = StoryObj<RelatedDailyReportsListComponent>;

export const Default: Story = {
  args: {
    goalId: 'goal-1',
    limit: 10,
    sort: 'desc',
  },
};

export const Ascending: Story = {
  args: {
    goalId: 'goal-1',
    limit: 10,
    sort: 'asc',
  },
};

export const WithManyReports: Story = {
  decorators: [
    moduleMetadata({
      providers: [
        {
          provide: GoalService,
          useValue: {
            getGoal: () => of({
              id: 'goal-1',
              userId: 'user-1',
              name: '目標名',
              description: null,
              startDate: '2025-01-01',
              endDate: '2025-12-31',
              parentId: null,
              goalType: 'skill',
              successCriteria: null,
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
              parent: null,
              children: [],
              relatedDailyReports: Array.from({ length: 10 }, (_, i) => ({
                id: `report-${i + 1}`,
                date: `2025-12-${16 - i}`,
                events: `今日やったこと${i + 1}`,
                createdAt: `2025-12-${16 - i}T00:00:00Z`,
              })),
              relatedDailyReportsCount: 15,
            } as GoalDetailResponse),
          },
        },
      ],
    }),
  ],
  args: {
    goalId: 'goal-1',
    limit: 10,
    sort: 'desc',
  },
};

export const Empty: Story = {
  decorators: [
    moduleMetadata({
      providers: [
        {
          provide: GoalService,
          useValue: {
            getGoal: () => of({
              id: 'goal-1',
              userId: 'user-1',
              name: '目標名',
              description: null,
              startDate: '2025-01-01',
              endDate: '2025-12-31',
              parentId: null,
              goalType: 'skill',
              successCriteria: null,
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
              parent: null,
              children: [],
              relatedDailyReports: [],
              relatedDailyReportsCount: 0,
            } as GoalDetailResponse),
          },
        },
      ],
    }),
  ],
  args: {
    goalId: 'goal-1',
    limit: 10,
    sort: 'desc',
  },
};


import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GoalMultiSelectFieldComponent } from '../../app/shared/domain-components/goal-multi-select-field/goal-multi-select-field.component';
import { GoalService } from '../../app/features/goal/services/goal.service';
import { of } from 'rxjs';
import { Goal } from '../../app/features/goal/models/goal.model';

const meta: Meta<GoalMultiSelectFieldComponent> = {
  title: 'Design System/Domain Components/GoalMultiSelectField',
  component: GoalMultiSelectFieldComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: GoalService,
          useValue: {
            getGoals: () => of({
              data: [
                {
                  id: 'goal-1',
                  userId: 'user-1',
                  name: '長期目標1',
                  description: null,
                  startDate: '2025-01-01',
                  endDate: '2025-12-31',
                  parentId: null,
                  goalType: 'skill',
                  successCriteria: null,
                  createdAt: '2025-01-01T00:00:00Z',
                  updatedAt: '2025-01-01T00:00:00Z',
                },
                {
                  id: 'goal-2',
                  userId: 'user-1',
                  name: '中期目標1',
                  description: null,
                  startDate: '2025-01-01',
                  endDate: '2025-06-30',
                  parentId: 'goal-1',
                  goalType: 'project',
                  successCriteria: null,
                  createdAt: '2025-01-01T00:00:00Z',
                  updatedAt: '2025-01-01T00:00:00Z',
                },
                {
                  id: 'goal-3',
                  userId: 'user-1',
                  name: '短期目標1',
                  description: null,
                  startDate: '2025-01-01',
                  endDate: '2025-03-31',
                  parentId: 'goal-2',
                  goalType: 'habit',
                  successCriteria: null,
                  createdAt: '2025-01-01T00:00:00Z',
                  updatedAt: '2025-01-01T00:00:00Z',
                },
              ] as Goal[],
            }),
          },
        },
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: '目標を複数選択するセレクトフィールドコンポーネント。検索可能で、階層構造を視覚的に表示します。',
      },
    },
  },
  argTypes: {
    value: {
      control: 'object',
      description: '選択された目標のIDリスト',
    },
    label: {
      control: 'text',
      description: 'フィールドのラベル',
    },
    placeholder: {
      control: 'text',
      description: 'プレースホルダー',
    },
    disabled: {
      control: 'boolean',
      description: '無効化フラグ',
    },
    error: {
      control: 'text',
      description: 'エラーメッセージ',
    },
    helperText: {
      control: 'text',
      description: 'ヘルパーテキスト',
    },
    maxSelection: {
      control: { type: 'number', min: 1, max: 20 },
      description: '最大選択数',
    },
  },
};

export default meta;
type Story = StoryObj<GoalMultiSelectFieldComponent>;

export const Default: Story = {
  args: {
    value: [],
    label: '関連する目標',
    placeholder: '目標を選択',
    disabled: false,
    error: '',
    helperText: '',
    maxSelection: 10,
  },
};

export const WithSelectedGoals: Story = {
  args: {
    value: ['goal-1', 'goal-2'],
    label: '関連する目標',
    placeholder: '目標を選択',
    disabled: false,
    error: '',
    helperText: '',
    maxSelection: 10,
  },
};

export const WithError: Story = {
  args: {
    value: [],
    label: '関連する目標',
    placeholder: '目標を選択',
    disabled: false,
    error: '目標は最大10個まで選択できます',
    helperText: '',
    maxSelection: 10,
  },
};

export const WithHelperText: Story = {
  args: {
    value: [],
    label: '関連する目標',
    placeholder: '目標を選択',
    disabled: false,
    error: '',
    helperText: '最大10個まで選択できます',
    maxSelection: 10,
  },
};

export const Disabled: Story = {
  args: {
    value: ['goal-1'],
    label: '関連する目標',
    placeholder: '目標を選択',
    disabled: true,
    error: '',
    helperText: '',
    maxSelection: 10,
  },
};

export const MaxSelectionReached: Story = {
  args: {
    value: Array.from({ length: 10 }, (_, i) => `goal-${i + 1}`),
    label: '関連する目標',
    placeholder: '目標を選択',
    disabled: false,
    error: '',
    helperText: '最大10個まで選択できます',
    maxSelection: 10,
  },
};


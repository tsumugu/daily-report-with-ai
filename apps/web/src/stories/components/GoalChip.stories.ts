import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { GoalChipComponent } from '../../app/shared/components/goal-chip/goal-chip.component';

const meta: Meta<GoalChipComponent> = {
  title: 'Components/GoalChip',
  component: GoalChipComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [RouterTestingModule],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: '目標を表示するチップコンポーネント。目標名を表示し、クリックで目標詳細画面に遷移します。',
      },
    },
  },
  argTypes: {
    goalId: {
      control: 'text',
      description: '目標ID',
    },
    goalName: {
      control: 'text',
      description: '目標名',
    },
    showRemoveButton: {
      control: 'boolean',
      description: '削除ボタンを表示するかどうか',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'サイズ',
    },
    clickable: {
      control: 'boolean',
      description: 'クリック可能かどうか',
    },
  },
};

export default meta;
type Story = StoryObj<GoalChipComponent>;

export const Default: Story = {
  args: {
    goalId: 'goal-1',
    goalName: '目標名',
    showRemoveButton: false,
    size: 'medium',
    clickable: true,
  },
};

export const Small: Story = {
  args: {
    goalId: 'goal-1',
    goalName: '目標名',
    showRemoveButton: false,
    size: 'small',
    clickable: true,
  },
};

export const WithRemoveButton: Story = {
  args: {
    goalId: 'goal-1',
    goalName: '目標名',
    showRemoveButton: true,
    size: 'medium',
    clickable: true,
  },
};

export const LongName: Story = {
  args: {
    goalId: 'goal-1',
    goalName: 'これは非常に長い目標名の例です。20文字を超えると省略表示されます。',
    showRemoveButton: false,
    size: 'medium',
    clickable: true,
  },
};

export const NotClickable: Story = {
  args: {
    goalId: 'goal-1',
    goalName: '目標名',
    showRemoveButton: false,
    size: 'medium',
    clickable: false,
  },
};


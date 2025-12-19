import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { StatusBadgeComponent } from '../../app/shared/ui/status-badge/status-badge.component';
import {
  LucideAngularModule,
  FileText,
  Clipboard,
  ChartBar,
  Target,
  Sparkles,
  Lightbulb,
  Calendar,
  TriangleAlert,
  Eye,
  EyeOff,
  Heart,
  Pin,
  Check,
} from 'lucide-angular';

const meta: Meta<StatusBadgeComponent> = {
  title: 'Design System/UI Components/StatusBadge',
  component: StatusBadgeComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        LucideAngularModule.pick({
          FileText,
          Clipboard,
          ChartBar,
          Target,
          Sparkles,
          Lightbulb,
          Calendar,
          TriangleAlert,
          Eye,
          EyeOff,
          Heart,
          Pin,
          Check,
        }),
      ],
    }),
  ],
  argTypes: {
    status: {
      control: 'select',
      options: [
        '未着手',
        '進行中',
        '再現成功',
        '再現できず',
        '完了',
        '未達成',
        '定着',
        '習慣化',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<StatusBadgeComponent>;

export const NotStarted: Story = {
  args: {
    status: '未着手',
  },
  render: (args) => ({
    props: args,
    template: '<app-status-badge [status]="status"></app-status-badge>',
  }),
};

export const InProgress: Story = {
  args: {
    status: '進行中',
  },
  render: (args) => ({
    props: args,
    template: '<app-status-badge [status]="status"></app-status-badge>',
  }),
};

export const Success: Story = {
  args: {
    status: '再現成功',
  },
  render: (args) => ({
    props: args,
    template: '<app-status-badge [status]="status"></app-status-badge>',
  }),
};

export const Completed: Story = {
  args: {
    status: '完了',
  },
  render: (args) => ({
    props: args,
    template: '<app-status-badge [status]="status"></app-status-badge>',
  }),
};

export const Settled: Story = {
  args: {
    status: '定着',
  },
  render: (args) => ({
    props: args,
    template: '<app-status-badge [status]="status"></app-status-badge>',
  }),
};

export const Habitualized: Story = {
  args: {
    status: '習慣化',
  },
  render: (args) => ({
    props: args,
    template: '<app-status-badge [status]="status"></app-status-badge>',
  }),
};

export const Failed: Story = {
  args: {
    status: '再現できず',
  },
  render: (args) => ({
    props: args,
    template: '<app-status-badge [status]="status"></app-status-badge>',
  }),
};

export const NotAchieved: Story = {
  args: {
    status: '未達成',
  },
  render: (args) => ({
    props: args,
    template: '<app-status-badge [status]="status"></app-status-badge>',
  }),
};

export const AllStatuses: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <app-status-badge status="未着手"></app-status-badge>
        <app-status-badge status="進行中"></app-status-badge>
        <app-status-badge status="再現成功"></app-status-badge>
        <app-status-badge status="完了"></app-status-badge>
        <app-status-badge status="定着"></app-status-badge>
        <app-status-badge status="習慣化"></app-status-badge>
        <app-status-badge status="再現できず"></app-status-badge>
        <app-status-badge status="未達成"></app-status-badge>
      </div>
    `,
  }),
};


import { Meta, StoryObj } from '@storybook/angular';
import { ReportCardComponent, ReportCardData } from '../../app/shared/components/report-card/report-card.component';

const meta: Meta<ReportCardComponent> = {
  title: 'Components/ReportCard',
  component: ReportCardComponent,
  tags: ['autodocs'],
  argTypes: {
    report: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<ReportCardComponent>;

const baseReport: ReportCardData = {
  id: 'report-1',
  date: '2025-12-10',
  events: 'チーム会議で積極的に発言できた。午後はコードレビューを行い、良いフィードバックをもらえた。',
  goodPointIds: ['gp1', 'gp2'],
  improvementIds: ['imp1'],
  goodPointSummary: {
    count: 2,
    statusSummary: {
      再現成功: 1,
      定着: 1,
    },
  },
  improvementSummary: {
    count: 1,
    statusSummary: {
      完了: 1,
      習慣化: 0,
    },
  },
};

export const Default: Story = {
  args: {
    report: baseReport,
  },
  render: (args) => ({
    props: args,
    template: '<app-report-card [report]="report"></app-report-card>',
  }),
};

export const WithGoodPointsAndImprovements: Story = {
  args: {
    report: {
      ...baseReport,
      goodPointSummary: {
        count: 3,
        statusSummary: {
          再現成功: 2,
          定着: 1,
        },
      },
      improvementSummary: {
        count: 2,
        statusSummary: {
          完了: 1,
          習慣化: 1,
        },
      },
    },
  },
  render: (args) => ({
    props: args,
    template: '<app-report-card [report]="report"></app-report-card>',
  }),
};

export const WithStatusSummary: Story = {
  args: {
    report: {
      ...baseReport,
      goodPointSummary: {
        count: 2,
        statusSummary: {
          再現成功: 1,
          定着: 1,
        },
      },
      improvementSummary: {
        count: 1,
        statusSummary: {
          完了: 1,
          習慣化: 0,
        },
      },
    },
  },
  render: (args) => ({
    props: args,
    template: '<app-report-card [report]="report"></app-report-card>',
  }),
};

export const WithoutStatusSummary: Story = {
  args: {
    report: {
      ...baseReport,
      goodPointSummary: {
        count: 2,
        statusSummary: {
          再現成功: 0,
          定着: 0,
        },
      },
      improvementSummary: {
        count: 1,
        statusSummary: {
          完了: 0,
          習慣化: 0,
        },
      },
    },
  },
  render: (args) => ({
    props: args,
    template: '<app-report-card [report]="report"></app-report-card>',
  }),
};

export const NoGoodPoints: Story = {
  args: {
    report: {
      ...baseReport,
      goodPointIds: [],
      goodPointSummary: {
        count: 0,
        statusSummary: {
          再現成功: 0,
          定着: 0,
        },
      },
    },
  },
  render: (args) => ({
    props: args,
    template: '<app-report-card [report]="report"></app-report-card>',
  }),
};

export const NoImprovements: Story = {
  args: {
    report: {
      ...baseReport,
      improvementIds: [],
      improvementSummary: {
        count: 0,
        statusSummary: {
          完了: 0,
          習慣化: 0,
        },
      },
    },
  },
  render: (args) => ({
    props: args,
    template: '<app-report-card [report]="report"></app-report-card>',
  }),
};

export const NoGoodPointsAndImprovements: Story = {
  args: {
    report: {
      ...baseReport,
      goodPointIds: [],
      improvementIds: [],
      goodPointSummary: {
        count: 0,
        statusSummary: {
          再現成功: 0,
          定着: 0,
        },
      },
      improvementSummary: {
        count: 0,
        statusSummary: {
          完了: 0,
          習慣化: 0,
        },
      },
    },
  },
  render: (args) => ({
    props: args,
    template: '<app-report-card [report]="report"></app-report-card>',
  }),
};

export const LongEvents: Story = {
  args: {
    report: {
      ...baseReport,
      events: 'あ'.repeat(100) + '今日はとても長いできごとがありました。' + 'い'.repeat(100),
    },
  },
  render: (args) => ({
    props: args,
    template: '<app-report-card [report]="report"></app-report-card>',
  }),
};


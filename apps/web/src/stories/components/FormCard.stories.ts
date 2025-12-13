import type { Meta, StoryObj } from '@storybook/angular';
import { FormCardComponent } from '../../app/shared/components/form-card/form-card.component';

const meta: Meta<FormCardComponent> = {
  title: 'Components/FormCard',
  component: FormCardComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FormCardComponent>;

export const Default: Story = {
  args: {
    showRemoveButton: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-form-card [showRemoveButton]="showRemoveButton" (removed)="onRemoved()">
        <div style="padding: 8px;">
          <p>カードの内容がここに表示されます</p>
        </div>
      </app-form-card>
    `,
  }),
};

export const WithoutRemoveButton: Story = {
  args: {
    showRemoveButton: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-form-card [showRemoveButton]="showRemoveButton">
        <div style="padding: 8px;">
          <p>削除ボタンなしのカード</p>
        </div>
      </app-form-card>
    `,
  }),
};



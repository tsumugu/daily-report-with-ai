import type { Meta, StoryObj } from '@storybook/angular';
import { DateFieldComponent } from '../../app/shared/components/date-field/date-field.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

const meta: Meta<DateFieldComponent> = {
  title: 'Components/DateField',
  component: DateFieldComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<DateFieldComponent>;

export const Default: Story = {
  args: {
    label: '日付',
    id: 'date',
    required: true,
  },
  render: (args) => {
    const fb = new FormBuilder();
    const form = fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
    });
    return {
      props: {
        ...args,
        form,
      },
      template: `
        <form [formGroup]="form">
          <app-date-field
            [label]="label"
            [id]="id"
            [required]="required"
            formControlName="date"
          />
        </form>
      `,
      moduleMetadata: {
        imports: [DateFieldComponent, ReactiveFormsModule],
      },
    };
  },
};

export const WithError: Story = {
  args: {
    label: '日付',
    id: 'date-error',
    required: true,
    errorMessage: 'この項目は必須です',
  },
};


import { Meta, StoryObj } from '@storybook/angular';
import { EntitySelectFieldComponent, EntitySelectOption } from '../../app/shared/components/entity-select-field/entity-select-field.component';

const meta: Meta<EntitySelectFieldComponent> = {
  title: 'Components/EntitySelectField',
  component: EntitySelectFieldComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '汎用的なエンティティ選択フィールドコンポーネント。ドロップダウンでエンティティを選択するためのコンポーネントです。ControlValueAccessorを実装しており、Angularのフォームと統合できます。',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'ラベル',
    },
    placeholder: {
      control: 'text',
      description: 'プレースホルダー',
    },
    emptyLabel: {
      control: 'text',
      description: '空オプションのラベル',
    },
    showEmptyOption: {
      control: 'boolean',
      description: '空オプションを表示するかどうか',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    errorMessage: {
      control: 'text',
      description: 'エラーメッセージ',
    },
    excludeIds: {
      control: 'object',
      description: '除外するIDの配列',
    },
  },
};

export default meta;
type Story = StoryObj<EntitySelectFieldComponent>;

const mockOptions: EntitySelectOption[] = [
  { id: '1', label: '目標1' },
  { id: '2', label: '目標2' },
  { id: '3', label: '目標3' },
];

export const Default: Story = {
  args: {
    label: '上位目標',
    options: mockOptions,
    placeholder: '選択してください',
    emptyLabel: 'なし',
    showEmptyOption: true,
    disabled: false,
    errorMessage: '',
  },
};

export const WithLabel: Story = {
  args: {
    label: '目標の性質',
    options: [
      { id: 'skill', label: 'スキル習得' },
      { id: 'project', label: 'プロジェクト完了' },
      { id: 'habit', label: '習慣形成' },
      { id: 'other', label: 'その他' },
    ],
    placeholder: '選択してください',
    showEmptyOption: false,
  },
};

export const WithError: Story = {
  args: {
    label: '上位目標',
    options: mockOptions,
    placeholder: '選択してください',
    emptyLabel: 'なし',
    showEmptyOption: true,
    errorMessage: 'この項目は必須です',
  },
};

export const Disabled: Story = {
  args: {
    label: '上位目標',
    options: mockOptions,
    placeholder: '選択してください',
    emptyLabel: 'なし',
    showEmptyOption: true,
    disabled: true,
  },
};

export const WithoutEmptyOption: Story = {
  args: {
    label: '目標の性質',
    options: [
      { id: 'skill', label: 'スキル習得' },
      { id: 'project', label: 'プロジェクト完了' },
    ],
    placeholder: '選択してください（任意）',
    showEmptyOption: false,
  },
};

export const WithExcludedIds: Story = {
  args: {
    label: '上位目標',
    options: [
      { id: '1', label: '目標1' },
      { id: '2', label: '目標2' },
      { id: '3', label: '目標3' },
    ],
    placeholder: '選択してください',
    emptyLabel: 'なし',
    showEmptyOption: true,
    excludeIds: ['2'],
  },
};

export const ManyOptions: Story = {
  args: {
    label: '上位目標',
    options: Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      label: `目標${i + 1}`,
    })),
    placeholder: '選択してください',
    emptyLabel: 'なし',
    showEmptyOption: true,
  },
};


import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FollowupService } from '../../../../shared/services/followup.service';
import { FollowupItem, CreateFollowupRequest, FollowupStatus } from '../../../../shared/models/followup.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TextareaFieldComponent } from '../../../../shared/components/textarea-field/textarea-field.component';
import { DateFieldComponent } from '../../../../shared/components/date-field/date-field.component';
import { FormCardComponent } from '../../../../shared/components/form-card/form-card.component';

@Component({
  selector: 'app-followup-input-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    TextareaFieldComponent,
    DateFieldComponent,
    FormCardComponent,
  ],
  templateUrl: './followup-input-modal.component.html',
  styleUrl: './followup-input-modal.component.scss',
})
export class FollowupInputModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly followupService = inject(FollowupService);

  @Input() item!: FollowupItem;
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  readonly statusOptions: { value: FollowupStatus; label: string }[] = [];

  ngOnInit(): void {
    this.initializeStatusOptions();
    this.initializeForm();
  }

  private initializeStatusOptions(): void {
    if (this.item.itemType === 'goodPoint') {
      this.statusOptions.push(
        { value: '未着手', label: '未着手' },
        { value: '進行中', label: '進行中' },
        { value: '再現成功', label: '再現成功' },
        { value: '再現できず', label: '再現できず' }
      );
    } else {
      this.statusOptions.push(
        { value: '未着手', label: '未着手' },
        { value: '進行中', label: '進行中' },
        { value: '完了', label: '完了' },
        { value: '未達成', label: '未達成' }
      );
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      status: ['進行中', Validators.required],
      memo: ['', [Validators.maxLength(500)]],
      date: [''],
    });

    // ステータス変更時に日付の必須/任意を切り替え
    this.form.get('status')?.valueChanges.subscribe((status: string) => {
      const dateControl = this.form.get('date');
      if (status === '再現成功' || status === '完了') {
        dateControl?.setValidators([Validators.required]);
      } else {
        dateControl?.clearValidators();
      }
      dateControl?.updateValueAndValidity();
    });
  }

  get modalTitle(): string {
    return this.item.itemType === 'goodPoint'
      ? 'よかったことのフォローアップ'
      : '改善点のフォローアップ';
  }

  get dateLabel(): string {
    return this.item.itemType === 'goodPoint' ? '再現日' : '完了日';
  }

  get dateRequired(): boolean {
    const status = this.form.get('status')?.value as string;
    return status === '再現成功' || status === '完了';
  }

  onClose(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const formValue = this.form.value as { status: FollowupStatus; memo?: string; date?: string };
    const request: CreateFollowupRequest = {
      status: formValue.status,
      ...(formValue.memo ? { memo: formValue.memo } : {}),
      ...(formValue.date ? { date: formValue.date } : {}),
    };

    const observable =
      this.item.itemType === 'goodPoint'
        ? this.followupService.addGoodPointFollowup(this.item.item.id, request)
        : this.followupService.addImprovementFollowup(this.item.item.id, request);

    observable.subscribe({
      next: () => {
        this.saved.emit();
        this.onClose();
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err.error?.message || 'フォローアップの保存に失敗しました';
        this.isSubmitting = false;
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeeklyFocusService } from '../../services/weekly-focus.service';
import { WeeklyFocusResponse } from '../../models/weekly-focus.model';
import { WeeklyFocusCardComponent } from '../weekly-focus-card/weekly-focus-card.component';
import { ButtonComponent } from '../button/button.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-weekly-focus-section',
  standalone: true,
  imports: [CommonModule, WeeklyFocusCardComponent, ButtonComponent],
  templateUrl: './weekly-focus-section.component.html',
  styleUrl: './weekly-focus-section.component.scss',
})
export class WeeklyFocusSectionComponent implements OnInit, OnDestroy {
  @Input() showAddButton = true;
  @Output() addClicked = new EventEmitter<void>();

  focuses: WeeklyFocusResponse[] = [];
  loading = false;
  error: string | null = null;

  private subscription?: Subscription;

  constructor(private weeklyFocusService: WeeklyFocusService) {}

  ngOnInit(): void {
    this.loadFocuses();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadFocuses(): void {
    this.loading = true;
    this.error = null;
    this.subscription = this.weeklyFocusService.getCurrentWeekFocuses().subscribe({
      next: (focuses) => {
        this.focuses = focuses;
        this.loading = false;
      },
      error: (_err) => {
        this.error = 'フォーカスの読み込みに失敗しました';
        this.loading = false;
      },
    });
  }

  onAddClick(): void {
    this.addClicked.emit();
  }

  onDelete(focusId: string): void {
    this.subscription = this.weeklyFocusService.deleteWeeklyFocus(focusId).subscribe({
      next: () => {
        this.loadFocuses();
      },
      error: (_err) => {
        this.error = 'フォーカスの削除に失敗しました';
      },
    });
  }

  get isEmpty(): boolean {
    return !this.loading && this.focuses.length === 0;
  }
}


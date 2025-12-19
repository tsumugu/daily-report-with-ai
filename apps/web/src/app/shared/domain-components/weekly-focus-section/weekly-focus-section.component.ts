import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { WeeklyFocusService } from '../../services/weekly-focus.service';
import { WeeklyFocusResponse } from '../../models/weekly-focus.model';
import { WeeklyFocusCardComponent } from '../weekly-focus-card/weekly-focus-card.component';
import { ButtonComponent } from '../../ui';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-weekly-focus-section',
  standalone: true,
  imports: [WeeklyFocusCardComponent, ButtonComponent],
  templateUrl: './weekly-focus-section.component.html',
  styleUrl: './weekly-focus-section.component.scss',
})
export class WeeklyFocusSectionComponent implements OnInit, OnDestroy {
  private readonly weeklyFocusService = inject(WeeklyFocusService);
  private readonly router = inject(Router);

  @Input() showAddButton = true;
  @Output() addClicked = new EventEmitter<void>();

  focuses: WeeklyFocusResponse[] = [];
  loading = false;
  error: string | null = null;

  private subscription?: Subscription;
  private routerSubscription?: Subscription;

  ngOnInit(): void {
    this.loadFocuses();
    // ホーム画面に戻った時に自動更新
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigation = event as NavigationEnd;
        if (navigation.url === '/home' || navigation.url === '/') {
          this.loadFocuses();
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  loadFocuses(): void {
    this.loading = true;
    this.error = null;
    this.subscription = this.weeklyFocusService.getCurrentWeekFocuses().subscribe({
      next: (focuses) => {
        this.focuses = focuses;
        this.loading = false;
      },
      error: () => {
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
      error: () => {
        this.error = 'フォーカスの削除に失敗しました';
      },
    });
  }

  get isEmpty(): boolean {
    return !this.loading && this.focuses.length === 0;
  }
}

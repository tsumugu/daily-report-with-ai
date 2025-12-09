import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { WeeklyFocusSectionComponent } from '../../../../shared/components/weekly-focus-section/weekly-focus-section.component';
import { IconComponent } from '../../../../shared/components/icon';

/**
 * ホームページコンポーネント
 * ログイン後のダッシュボード
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, WeeklyFocusSectionComponent, IconComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  /**
   * ログアウト
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // エラーでもログアウト処理を行う
        this.router.navigate(['/login']);
      },
    });
  }

  /**
   * 週次フォーカス追加ボタンクリック時
   */
  onAddWeeklyFocus(): void {
    this.router.navigate(['/followups']);
  }
}


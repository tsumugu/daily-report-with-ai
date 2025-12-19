import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HomePageComponent } from './home-page.component';
import { AuthService } from '../../../auth/services/auth.service';
import { provideLucideIconsForTesting } from '../../../../shared/test-helpers/lucide-icons.helper';
import { WeeklyFocusSectionComponent } from '../../../../shared/domain-components';
import { By } from '@angular/platform-browser';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: signal(mockUser),
    });

    await TestBed.configureTestingModule({
      imports: [HomePageComponent, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideLucideIconsForTesting(),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('初期状態', () => {
    it('コンポーネントが作成されること', () => {
      expect(component).toBeTruthy();
    });

    it('currentUserが設定されていること', () => {
      expect(component.currentUser()).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('ログアウトが成功した場合、ログインページに遷移すること', fakeAsync(() => {
      authServiceSpy.logout.and.returnValue(of(void 0));

      component.logout();
      tick();

      expect(authServiceSpy.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('ログアウトが失敗した場合でも、ログインページに遷移すること', fakeAsync(() => {
      authServiceSpy.logout.and.returnValue(throwError(() => new Error('Logout failed')));

      component.logout();
      tick();

      expect(authServiceSpy.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));
  });

  describe('DOM', () => {
    it('ユーザーのメールアドレスが表示されること', () => {
      const emailElement = fixture.nativeElement.querySelector('.header');
      expect(emailElement.textContent).toContain(mockUser.email);
    });

    it('ログアウトボタンが表示されること', () => {
      const logoutButton = fixture.nativeElement.querySelector('.logout-button');
      expect(logoutButton).toBeTruthy();
      expect(logoutButton.textContent).toContain('ログアウト');
    });

    it('ログアウトボタンをクリックするとlogoutが呼ばれること', fakeAsync(() => {
      authServiceSpy.logout.and.returnValue(of(void 0));
      const logoutButton = fixture.nativeElement.querySelector('.logout-button');

      logoutButton.click();
      tick();

      expect(authServiceSpy.logout).toHaveBeenCalled();
    }));

    it('日報入力へのリンクが表示されること', () => {
      const dailyReportLink = fixture.nativeElement.querySelector('a[routerLink="/daily-reports/new"]');
      expect(dailyReportLink).toBeTruthy();
    });

    it('目標管理へのリンクが表示されること', () => {
      const goalLink = fixture.nativeElement.querySelector('a[routerLink="/goals"]');
      expect(goalLink).toBeTruthy();
      expect(goalLink.textContent).toContain('目標管理');
    });
  });

  describe('onAddWeeklyFocus', () => {
    it('週次フォーカス追加ボタンクリック時、フォロー項目一覧ページに遷移すること', () => {
      component.onAddWeeklyFocus();
      expect(router.navigate).toHaveBeenCalledWith(['/followups']);
    });

    it('テンプレートからonAddWeeklyFocusが呼ばれること', () => {
      // テンプレート内の(addClicked)="onAddWeeklyFocus()"をカバー
      // 実際のテンプレートのイベントバインディングを実行するために、
      // WeeklyFocusSectionComponentのインスタンスを取得してaddClickedイベントを発火
      fixture.detectChanges();
      const weeklyFocusSectionDebugElement = fixture.debugElement.query(By.directive(WeeklyFocusSectionComponent));
      expect(weeklyFocusSectionDebugElement).toBeTruthy();

      // WeeklyFocusSectionComponentのインスタンスを取得
      const weeklyFocusSectionComponent = weeklyFocusSectionDebugElement.componentInstance;

      // addClickedイベントを発火（これでテンプレートのイベントバインディングが実行される）
      weeklyFocusSectionComponent.addClicked.emit();
      fixture.detectChanges();

      // onAddWeeklyFocusが呼ばれたことを確認
      expect(router.navigate).toHaveBeenCalledWith(['/followups']);
    });
  });
});


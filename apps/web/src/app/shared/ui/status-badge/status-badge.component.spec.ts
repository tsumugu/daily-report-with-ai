import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent, StatusBadgeType } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('デフォルトで「未着手」が表示されること', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent?.trim()).toBe('未着手');
  });

  describe('ステータスごとのクラス適用', () => {
    const testCases: { status: StatusBadgeType; expectedClass: string }[] = [
      { status: '未着手', expectedClass: 'not-started' },
      { status: '進行中', expectedClass: 'in-progress' },
      { status: '再現成功', expectedClass: 'success' },
      { status: '完了', expectedClass: 'success' },
      { status: '定着', expectedClass: 'settled' },
      { status: '習慣化', expectedClass: 'settled' },
      { status: '再現できず', expectedClass: 'failed' },
      { status: '未達成', expectedClass: 'failed' },
    ];

    testCases.forEach(({ status, expectedClass }) => {
      it(`ステータス「${status}」の場合、クラス「${expectedClass}」が適用されること`, () => {
        component.status = status;
        fixture.detectChanges();
        const element = fixture.nativeElement as HTMLElement;
        const badge = element.querySelector('.status-badge');
        expect(badge?.classList.contains(`status-badge--${expectedClass}`)).toBe(true);
      });
    });

    it('未知のステータスの場合、デフォルトクラスが適用されること', () => {
      // TypeScriptの型チェックを回避するため、anyを使用
      component.status = 'unknown' as StatusBadgeType;
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      const badge = element.querySelector('.status-badge');
      expect(badge?.classList.contains('status-badge--not-started')).toBe(true);
    });
  });

  it('badgeClassesが正しく生成されること', () => {
    component.status = '進行中';
    fixture.detectChanges();
    const classes = component.badgeClasses;
    expect(classes).toContain('status-badge');
    expect(classes).toContain('status-badge--in-progress');
  });
});


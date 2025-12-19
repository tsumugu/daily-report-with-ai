import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent, ToastVariant } from './toast.component';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('デフォルトでsuccessバリアントが適用されること', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const toast = element.querySelector('.toast');
    expect(toast?.classList.contains('toast--success')).toBe(true);
  });

  describe('バリアントごとのクラス適用', () => {
    const testCases: { variant: ToastVariant; expectedClass: string; expectedIcon: string }[] = [
      { variant: 'success', expectedClass: 'success', expectedIcon: '✓' },
      { variant: 'error', expectedClass: 'error', expectedIcon: '✕' },
      { variant: 'info', expectedClass: 'info', expectedIcon: 'ℹ' },
    ];

    testCases.forEach(({ variant, expectedClass, expectedIcon }) => {
      it(`バリアント「${variant}」の場合、クラス「${expectedClass}」とアイコン「${expectedIcon}」が適用されること`, () => {
        component.variant = variant;
        component.message = 'テストメッセージ';
        fixture.detectChanges();
        const element = fixture.nativeElement as HTMLElement;
        const toast = element.querySelector('.toast');
        expect(toast?.classList.contains(`toast--${expectedClass}`)).toBe(true);
        const icon = element.querySelector('.toast__icon');
        expect(icon?.textContent?.trim()).toBe(expectedIcon);
      });
    });
  });

  it('メッセージが表示されること', () => {
    component.message = 'テストメッセージ';
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const message = element.querySelector('.toast__message');
    expect(message?.textContent?.trim()).toBe('テストメッセージ');
  });

  it('toastClassesが正しく生成されること', () => {
    component.variant = 'error';
    fixture.detectChanges();
    const classes = component.toastClasses;
    expect(classes).toContain('toast');
    expect(classes).toContain('toast--error');
  });

  it('iconが正しく返されること', () => {
    component.variant = 'success';
    expect(component.icon).toBe('✓');
    component.variant = 'error';
    expect(component.icon).toBe('✕');
    component.variant = 'info';
    expect(component.icon).toBe('ℹ');
  });

  it('未知のバリアントの場合、デフォルトアイコンが返されること', () => {
    // TypeScriptの型チェックを回避するため、anyを使用
    component.variant = 'unknown' as ToastVariant;
    expect(component.icon).toBe('ℹ');
  });
});


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EmptyStateComponent } from './empty-state.component';
import { provideLucideIconsForTesting } from '../../test-helpers/lucide-icons.helper';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent, RouterTestingModule],
      providers: [provideLucideIconsForTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    component.message = 'テストメッセージ';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state__message')?.textContent).toContain('テストメッセージ');
  });

  it('should display icon when iconName is provided', () => {
    component.iconName = 'clipboard';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state__icon')).toBeTruthy();
  });

  it('should not display icon when iconName is not provided', () => {
    component.iconName = undefined;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state__icon')).toBeFalsy();
  });

  it('should display subMessage when provided', () => {
    component.subMessage = 'サブメッセージ';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state__submessage')?.textContent).toContain('サブメッセージ');
  });

  it('should display action button when actionButtonText is provided', () => {
    component.actionButtonText = 'アクション';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state__action')).toBeTruthy();
  });

  it('should emit actionButtonClick when button is clicked', () => {
    component.actionButtonText = 'アクション';
    // actionButtonRouteを設定しない（クリックイベントを発火させるため）
    component.actionButtonRoute = undefined;
    fixture.detectChanges();
    spyOn(component.actionButtonClick, 'emit');
    const button = fixture.nativeElement.querySelector('app-button button');
    expect(button).toBeTruthy();
    // 実際のボタンをクリックして、ButtonComponentのonClick()が呼ばれるようにする
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(component.actionButtonClick.emit).toHaveBeenCalled();
  });
});


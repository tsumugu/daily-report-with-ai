import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HierarchyCardComponent } from './hierarchy-card.component';
import { provideLucideIconsForTesting } from '../../test-helpers/lucide-icons.helper';

describe('HierarchyCardComponent', () => {
  let component: HierarchyCardComponent;
  let fixture: ComponentFixture<HierarchyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HierarchyCardComponent],
      providers: [provideLucideIconsForTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HierarchyCardComponent);
    component = fixture.componentInstance;
    component.id = '1';
    component.title = 'テスト目標';
    component.subtitle = 'テストサブタイトル';
    component.metadata = '2025-01-01 〜 2025-06-30';
    component.levelName = '長期目標';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit clicked event when card is clicked', () => {
    spyOn(component.clicked, 'emit');
    component.onCardClick();
    expect(component.clicked.emit).toHaveBeenCalledWith('1');
  });

  it('should emit expandToggled event when expand button is clicked', () => {
    spyOn(component.expandToggled, 'emit');
    const event = new Event('click');
    component.onExpandToggle(event);
    expect(component.expandToggled.emit).toHaveBeenCalledWith('1');
  });

  it('should display levelName', () => {
    component.levelName = 'Test Level';
    fixture.detectChanges();
    const levelElement = fixture.nativeElement.querySelector('.hierarchy-card__level');
    expect(levelElement.textContent).toContain('Test Level');
  });

  it('should return correct expand icon name', () => {
    component.isExpanded = false;
    expect(component.expandIconName).toBe('chevron-right');
    component.isExpanded = true;
    expect(component.expandIconName).toBe('chevron-down');
  });

  it('should call onCardClick when card is clicked', () => {
    spyOn(component.clicked, 'emit');
    fixture.detectChanges();
    const cardElement = fixture.nativeElement.querySelector('.hierarchy-card');
    cardElement.click();
    expect(component.clicked.emit).toHaveBeenCalledWith('1');
  });

  it('should call onCardClick when Enter key is pressed', () => {
    spyOn(component.clicked, 'emit');
    fixture.detectChanges();
    const cardElement = fixture.nativeElement.querySelector('.hierarchy-card');
    const enterEvent = new KeyboardEvent('keyup', { key: 'Enter' });
    cardElement.dispatchEvent(enterEvent);
    expect(component.clicked.emit).toHaveBeenCalledWith('1');
  });

  it('should call onExpandToggle when expand button is clicked', () => {
    component.showExpandIcon = true;
    fixture.detectChanges();
    spyOn(component.expandToggled, 'emit');
    const expandButton = fixture.nativeElement.querySelector('.hierarchy-card__expand-button');
    expandButton.click();
    expect(component.expandToggled.emit).toHaveBeenCalledWith('1');
  });
});


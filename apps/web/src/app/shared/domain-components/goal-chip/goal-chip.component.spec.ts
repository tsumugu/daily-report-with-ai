import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GoalChipComponent } from './goal-chip.component';
import { provideLucideIconsForTesting } from '../../../shared/test-helpers/lucide-icons.helper';

describe('GoalChipComponent', () => {
  let component: GoalChipComponent;
  let fixture: ComponentFixture<GoalChipComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [GoalChipComponent],
      providers: [{ provide: Router, useValue: router }, provideLucideIconsForTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalChipComponent);
    component = fixture.componentInstance;
    component.goalId = 'goal-1';
    component.goalName = 'テスト目標';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display goal name', () => {
    expect(fixture.nativeElement.textContent).toContain('テスト目標');
  });

  it('should truncate long goal names', () => {
    component.goalName = 'あ'.repeat(25);
    fixture.detectChanges();
    expect(component.displayName).toContain('...');
  });

  it('should navigate to goal detail on click when clickable', () => {
    component.clickable = true;
    component.showRemoveButton = false;
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('.goal-chip');
    chip.click();

    expect(router.navigate).toHaveBeenCalledWith(['/goals', 'goal-1']);
  });

  it('should emit remove event when remove button is clicked', () => {
    component.showRemoveButton = true;
    fixture.detectChanges();

    spyOn(component.remove, 'emit');
    const removeButton = fixture.nativeElement.querySelector('.goal-chip__remove');
    removeButton.click();

    expect(component.remove.emit).toHaveBeenCalled();
  });
});


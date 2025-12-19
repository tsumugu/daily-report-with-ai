import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GoalMultiSelectFieldComponent } from './goal-multi-select-field.component';
import { GoalService } from '../../../features/goal/services/goal.service';
import { provideLucideIconsForTesting } from '../../../shared/test-helpers/lucide-icons.helper';

describe('GoalMultiSelectFieldComponent', () => {
  let component: GoalMultiSelectFieldComponent;
  let fixture: ComponentFixture<GoalMultiSelectFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalMultiSelectFieldComponent, HttpClientTestingModule],
      providers: [GoalService, provideLucideIconsForTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalMultiSelectFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


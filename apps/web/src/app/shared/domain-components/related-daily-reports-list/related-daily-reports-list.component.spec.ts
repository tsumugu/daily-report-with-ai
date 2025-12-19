import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RelatedDailyReportsListComponent } from './related-daily-reports-list.component';
import { GoalService } from '../../../features/goal/services/goal.service';

describe('RelatedDailyReportsListComponent', () => {
  let component: RelatedDailyReportsListComponent;
  let fixture: ComponentFixture<RelatedDailyReportsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatedDailyReportsListComponent, HttpClientTestingModule],
      providers: [
        GoalService,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatedDailyReportsListComponent);
    component = fixture.componentInstance;
    component.goalId = 'goal-1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewToggleComponent } from './view-toggle.component';

describe('ViewToggleComponent', () => {
  let component: ViewToggleComponent;
  let fixture: ComponentFixture<ViewToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit viewTypeChange when view type is changed', () => {
    spyOn(component.viewTypeChange, 'emit');
    component.viewType = 'tree';
    component.onViewTypeChange('card');
    expect(component.viewTypeChange.emit).toHaveBeenCalledWith('card');
  });

  it('should not emit viewTypeChange when same view type is selected', () => {
    spyOn(component.viewTypeChange, 'emit');
    component.viewType = 'tree';
    component.onViewTypeChange('tree');
    expect(component.viewTypeChange.emit).not.toHaveBeenCalled();
  });
});


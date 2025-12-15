import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent, IconName } from './icon.component';
import { provideLucideIconsForTesting } from '../../test-helpers/lucide-icons.helper';

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [provideLucideIconsForTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    component.name = 'target';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct icon name for bar-chart-3', () => {
    component.name = 'bar-chart-3' as IconName;
    expect(component.iconName).toBe('chart-bar');
  });

  it('should return correct icon name for alert-triangle', () => {
    component.name = 'alert-triangle' as IconName;
    expect(component.iconName).toBe('triangle-alert');
  });

  it('should return original name for other icons', () => {
    component.name = 'target';
    expect(component.iconName).toBe('target');
  });

  it('should return fillColor when fill is set', () => {
    component.fill = 'red';
    expect(component.fillColor).toBe('red');
  });

  it('should return null when fill is none', () => {
    component.fill = 'none';
    expect(component.fillColor).toBeNull();
  });

  it('should return null when fill is undefined', () => {
    component.fill = undefined;
    expect(component.fillColor).toBeNull();
  });

  it('should use default size', () => {
    expect(component.size).toBe(24);
  });

  it('should accept custom size', () => {
    component.size = 32;
    expect(component.size).toBe(32);
  });
});


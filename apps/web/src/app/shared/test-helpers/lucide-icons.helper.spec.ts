import { TestBed } from '@angular/core/testing';
import { provideLucideIconsForTesting } from './lucide-icons.helper';
import { Component } from '@angular/core';
import { IconComponent } from '../ui/icon/icon.component';

@Component({
  standalone: true,
  imports: [IconComponent],
  template: '<app-icon name="target"></app-icon>',
})
class TestComponent { }

describe('lucide-icons.helper', () => {
  describe('provideLucideIconsForTesting', () => {
    it('should return a provider that can be used in TestBed', () => {
      const provider = provideLucideIconsForTesting();
      expect(provider).toBeDefined();
      // importProvidersFromはEnvironmentProvidersを返すので、配列ではない
      expect(typeof provider).toBe('object');
    });

    it('should provide Lucide icons module and allow icon rendering', async () => {
      await TestBed.configureTestingModule({
        imports: [TestComponent],
        providers: [provideLucideIconsForTesting()],
      }).compileComponents();

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance).toBeTruthy();
      const iconElement = fixture.nativeElement.querySelector('app-icon');
      expect(iconElement).toBeTruthy();
    });
  });
});


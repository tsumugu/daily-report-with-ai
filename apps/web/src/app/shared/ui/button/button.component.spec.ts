import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('初期状態', () => {
    it('コンポーネントが作成されること', () => {
      expect(component).toBeTruthy();
    });

    it('variantのデフォルトはprimaryであること', () => {
      expect(component.variant).toBe('primary');
    });

    it('sizeのデフォルトはmdであること', () => {
      expect(component.size).toBe('md');
    });

    it('typeのデフォルトはbuttonであること', () => {
      expect(component.type).toBe('button');
    });

    it('disabledのデフォルトはfalseであること', () => {
      expect(component.disabled).toBeFalse();
    });

    it('loadingのデフォルトはfalseであること', () => {
      expect(component.loading).toBeFalse();
    });

    it('fullWidthのデフォルトはfalseであること', () => {
      expect(component.fullWidth).toBeFalse();
    });
  });

  describe('onClick', () => {
    it('disabled/loadingがfalseの場合、clickedイベントが発火すること', () => {
      const spy = spyOn(component.clicked, 'emit');
      const mockEvent = new MouseEvent('click');
      
      component.onClick(mockEvent);
      
      expect(spy).toHaveBeenCalledWith(mockEvent);
    });

    it('disabledがtrueの場合、clickedイベントが発火しないこと', () => {
      const spy = spyOn(component.clicked, 'emit');
      component.disabled = true;
      
      component.onClick(new MouseEvent('click'));
      
      expect(spy).not.toHaveBeenCalled();
    });

    it('loadingがtrueの場合、clickedイベントが発火しないこと', () => {
      const spy = spyOn(component.clicked, 'emit');
      component.loading = true;
      
      component.onClick(new MouseEvent('click'));
      
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('buttonClasses', () => {
    it('デフォルトのクラスが含まれること', () => {
      const classes = component.buttonClasses;
      expect(classes).toContain('button');
      expect(classes).toContain('button--primary');
      expect(classes).toContain('button--md');
    });

    it('variantが変更された場合、対応するクラスが含まれること', () => {
      component.variant = 'secondary';
      expect(component.buttonClasses).toContain('button--secondary');

      component.variant = 'ghost';
      expect(component.buttonClasses).toContain('button--ghost');

      component.variant = 'danger';
      expect(component.buttonClasses).toContain('button--danger');
    });

    it('sizeが変更された場合、対応するクラスが含まれること', () => {
      component.size = 'sm';
      expect(component.buttonClasses).toContain('button--sm');

      component.size = 'lg';
      expect(component.buttonClasses).toContain('button--lg');
    });

    it('fullWidthがtrueの場合、full-widthクラスが含まれること', () => {
      component.fullWidth = true;
      expect(component.buttonClasses).toContain('button--full-width');
    });

    it('disabledがtrueの場合、disabledクラスが含まれること', () => {
      component.disabled = true;
      expect(component.buttonClasses).toContain('button--disabled');
    });

    it('loadingがtrueの場合、loadingクラスが含まれること', () => {
      component.loading = true;
      expect(component.buttonClasses).toContain('button--loading');
    });

    it('複数の状態が組み合わさった場合、すべてのクラスが含まれること', () => {
      component.variant = 'danger';
      component.size = 'lg';
      component.fullWidth = true;
      component.disabled = true;
      component.loading = true;

      const classes = component.buttonClasses;
      expect(classes).toContain('button');
      expect(classes).toContain('button--danger');
      expect(classes).toContain('button--lg');
      expect(classes).toContain('button--full-width');
      expect(classes).toContain('button--disabled');
      expect(classes).toContain('button--loading');
    });
  });

  describe('DOM', () => {
    it('button要素がレンダリングされること', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('typeが正しく設定されること', () => {
      component.type = 'submit';
      fixture.detectChanges();
      
      const button = fixture.nativeElement.querySelector('button');
      expect(button.type).toBe('submit');
    });

    it('disabledが正しく設定されること', () => {
      component.disabled = true;
      fixture.detectChanges();
      
      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBeTrue();
    });

    it('loadingがtrueの場合もdisabledになること', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBeTrue();
    });

    it('ariaLabelが正しく設定されること', () => {
      component.ariaLabel = 'Test Label';
      fixture.detectChanges();
      
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('aria-label')).toBe('Test Label');
    });
  });
});


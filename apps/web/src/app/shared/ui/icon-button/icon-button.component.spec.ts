import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconButtonComponent } from './icon-button.component';
import { provideLucideIconsForTesting } from '../../test-helpers/lucide-icons.helper';

describe('IconButtonComponent', () => {
  let component: IconButtonComponent;
  let fixture: ComponentFixture<IconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconButtonComponent],
      providers: [provideLucideIconsForTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(IconButtonComponent);
    component = fixture.componentInstance;
    component.iconName = 'file-text'; // 必須プロパティを設定
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  describe('onClick', () => {
    it('disabled/loadingがfalseの場合、clickedイベントが発火すること', () => {
      component.disabled = false;
      component.loading = false;
      const spy = spyOn(component.clicked, 'emit');
      const event = new MouseEvent('click');

      component.onClick(event);

      expect(spy).toHaveBeenCalledWith(event);
    });

    it('disabledがtrueの場合、clickedイベントが発火しないこと', () => {
      component.disabled = true;
      component.loading = false;
      const spy = spyOn(component.clicked, 'emit');
      const event = new MouseEvent('click');

      component.onClick(event);

      expect(spy).not.toHaveBeenCalled();
    });

    it('loadingがtrueの場合、clickedイベントが発火しないこと', () => {
      component.disabled = false;
      component.loading = true;
      const spy = spyOn(component.clicked, 'emit');
      const event = new MouseEvent('click');

      component.onClick(event);

      expect(spy).not.toHaveBeenCalled();
    });

    it('disabledとloadingが両方trueの場合、clickedイベントが発火しないこと', () => {
      component.disabled = true;
      component.loading = true;
      const spy = spyOn(component.clicked, 'emit');
      const event = new MouseEvent('click');

      component.onClick(event);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('buttonClasses', () => {
    it('デフォルトではicon-buttonクラスのみが返されること', () => {
      expect(component.buttonClasses).toBe('icon-button');
    });

    it('disabledがtrueの場合、icon-button--disabledクラスが追加されること', () => {
      component.disabled = true;
      expect(component.buttonClasses).toContain('icon-button--disabled');
    });

    it('loadingがtrueの場合、icon-button--loadingクラスが追加されること', () => {
      component.loading = true;
      expect(component.buttonClasses).toContain('icon-button--loading');
    });

    it('pinnedがtrueの場合、icon-button--pinnedクラスが追加されること', () => {
      component.pinned = true;
      expect(component.buttonClasses).toContain('icon-button--pinned');
    });

    it('複数のクラスが同時に適用されること', () => {
      component.disabled = true;
      component.loading = true;
      component.pinned = true;
      const classes = component.buttonClasses;
      expect(classes).toContain('icon-button');
      expect(classes).toContain('icon-button--disabled');
      expect(classes).toContain('icon-button--loading');
      expect(classes).toContain('icon-button--pinned');
    });
  });

  describe('プロパティのデフォルト値', () => {
    it('sizeのデフォルトは24であること', () => {
      expect(component.size).toBe(24);
    });

    it('tooltipのデフォルトは空文字であること', () => {
      expect(component.tooltip).toBe('');
    });

    it('disabledのデフォルトはfalseであること', () => {
      expect(component.disabled).toBeFalse();
    });

    it('loadingのデフォルトはfalseであること', () => {
      expect(component.loading).toBeFalse();
    });

    it('ariaLabelのデフォルトは空文字であること', () => {
      expect(component.ariaLabel).toBe('');
    });

    it('pinnedのデフォルトはfalseであること', () => {
      expect(component.pinned).toBeFalse();
    });
  });
});


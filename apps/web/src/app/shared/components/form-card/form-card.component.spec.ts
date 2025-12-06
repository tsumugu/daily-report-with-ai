import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormCardComponent } from './form-card.component';

describe('FormCardComponent', () => {
  let component: FormCardComponent;
  let fixture: ComponentFixture<FormCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('showRemoveButtonがtrueの場合、削除ボタンが表示されること', () => {
    component.showRemoveButton = true;
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector('.form-card__remove');
    expect(removeButton).toBeTruthy();
  });

  it('showRemoveButtonがfalseの場合、削除ボタンが表示されないこと', () => {
    component.showRemoveButton = false;
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector('.form-card__remove');
    expect(removeButton).toBeFalsy();
  });

  it('削除ボタンをクリックするとremovedイベントが発火すること', () => {
    component.showRemoveButton = true;
    fixture.detectChanges();

    const emitSpy = spyOn(component.removed, 'emit');
    const removeButton = fixture.nativeElement.querySelector('.form-card__remove');
    
    removeButton.click();
    
    expect(emitSpy).toHaveBeenCalled();
  });
});


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddButtonComponent } from './add-button.component';

describe('AddButtonComponent', () => {
  let component: AddButtonComponent;
  let fixture: ComponentFixture<AddButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('コンポーネントが作成されること', () => {
    expect(component).toBeTruthy();
  });

  it('デフォルトのラベルが表示されること', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('追加');
  });

  it('カスタムラベルが表示されること', () => {
    component.label = 'よかったことを追加';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('よかったことを追加');
  });

  it('クリックするとclickedイベントが発火すること', () => {
    const emitSpy = spyOn(component.clicked, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    
    button.click();
    
    expect(emitSpy).toHaveBeenCalled();
  });
});


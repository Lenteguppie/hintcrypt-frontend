import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibPinBoxItemDirective } from './pin-box-item.component';

describe('PinBoxItemComponent', () => {
  let component: LibPinBoxItemDirective;
  let fixture: ComponentFixture<LibPinBoxItemDirective>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibPinBoxItemDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(LibPinBoxItemDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinBoxComponent } from './pin-box.component';

describe('PinBoxComponent', () => {
  let component: PinBoxComponent;
  let fixture: ComponentFixture<PinBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratorPageComponent } from './generator-page.component';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('GeneratorPageComponent', () => {
  let component: GeneratorPageComponent;
  let fixture: ComponentFixture<GeneratorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratorPageComponent],
      providers: [provideRouter([]), importProvidersFrom([BrowserAnimationsModule])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

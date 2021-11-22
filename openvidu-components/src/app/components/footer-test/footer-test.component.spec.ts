import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTestComponent } from './footer-test.component';

describe('FooterTestComponent', () => {
  let component: FooterTestComponent;
  let fixture: ComponentFixture<FooterTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

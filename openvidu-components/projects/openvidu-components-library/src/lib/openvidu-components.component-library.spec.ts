import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenviduComponentsLibraryComponent } from './openvidu-components-library.component';

describe('OpenviduComponentsComponent', () => {
  let component: OpenviduComponentsLibraryComponent;
  let fixture: ComponentFixture<OpenviduComponentsLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenviduComponentsLibraryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenviduComponentsLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

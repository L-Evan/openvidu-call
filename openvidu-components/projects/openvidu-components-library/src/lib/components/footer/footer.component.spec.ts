import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoteUserService } from '../../../public-api';
import { TooltipListPipe } from '../../pipes/tooltip-list.pipe';
import { RemoteUserServiceMock } from '../../services/remote-user/remote-user.service.mock';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterComponent, TooltipListPipe ],
      providers: [
        {provide: RemoteUserService,  useClass: RemoteUserServiceMock }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionService } from '../../services/action/action.service';
import { ActionServiceMock } from '../../services/action/action.service.mock';

import { ChatService } from '../../services/chat/chat.service';
import { LayoutService } from '../../services/layout/layout.service';
import { ChatServiceMock } from '../../services/chat/chat.service.mock';

import { LocalUserService } from '../../services/local-user/local-user.service';
import { LocalUserServiceMock } from '../../services/local-user/local-user.service.mock';
import { LoggerService } from '../../services/logger/logger.service';
import { LoggerServiceMock } from '../../services/logger/logger.service.mock';
import { PlatformService } from '../../services/platform/platform.service';
import { PlatformServiceMock } from '../../services/platform/platform.service.mock';
import { RemoteUserService } from '../../services/remote-user/remote-user.service';
import { TokenService } from '../../services/token/token.service';
import { RemoteUserServiceMock } from '../../services/remote-user/remote-user.service.mock';
import { TokenServiceMock } from '../../services/token/token.service.mock';
import { WebrtcService } from '../../services/webrtc/webrtc.service';
import { WebrtcServiceMock } from '../../services/webrtc/webrtc.service.mock';

import { RoomComponent } from './room.component';

describe('RoomComponent', () => {
  let component: RoomComponent;
  let fixture: ComponentFixture<RoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomComponent ],
      providers: [
      { provide: LoggerService, useClass: LoggerServiceMock },
				{ provide: ActionService, useClass: ActionServiceMock },
				{ provide: RemoteUserService, useClass: RemoteUserServiceMock },
				{ provide: LocalUserService, useClass: LocalUserServiceMock },
				{ provide: WebrtcService, useClass: WebrtcServiceMock },
				{ provide: ChatService, useClass: ChatServiceMock },
        { provide: PlatformService, useClass: PlatformServiceMock },
        { provide: TokenService, useClass: TokenServiceMock },
        { provide: LayoutService, useClass: LayoutService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

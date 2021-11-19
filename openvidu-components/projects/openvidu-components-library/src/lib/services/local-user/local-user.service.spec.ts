import { TestBed } from '@angular/core/testing';
import { LoggerService } from '../logger/logger.service';

import { LoggerServiceMock } from '../logger/logger.service.mock';

import { LocalUserService } from './local-user.service';

describe('LocalUserService', () => {
  let service: LocalUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
				{ provide: LoggerService, useClass: LoggerServiceMock }
			],
    });
    service = TestBed.inject(LocalUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

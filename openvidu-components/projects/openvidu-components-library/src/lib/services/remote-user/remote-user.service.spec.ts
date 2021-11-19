import { TestBed } from '@angular/core/testing';
import { LoggerService } from '../logger/logger.service';
import { LoggerServiceMock } from '../logger/logger.service.mock';

import { RemoteUserService } from './remote-user.service';

describe('RemoteUserService', () => {
	let service: RemoteUserService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [{ provide: LoggerService, useClass: LoggerServiceMock }]
		});
		service = TestBed.inject(RemoteUserService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

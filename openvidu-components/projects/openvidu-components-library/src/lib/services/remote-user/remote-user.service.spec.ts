import { TestBed } from '@angular/core/testing';

import { RemoteUserService } from './remote-user.service';

describe('RemoteUserService', () => {
  let service: RemoteUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

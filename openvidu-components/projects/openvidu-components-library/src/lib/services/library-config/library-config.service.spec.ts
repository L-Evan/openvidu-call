import { TestBed } from '@angular/core/testing';

import { LibraryConfigService } from './library-config.service';

describe('LibraryConfigService', () => {
  let service: LibraryConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibraryConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

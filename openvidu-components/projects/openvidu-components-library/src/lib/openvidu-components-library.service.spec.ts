import { TestBed } from '@angular/core/testing';

import { OpenviduComponentsLibraryService } from './openvidu-components-library.service';

describe('OpenviduComponentsService', () => {
  let service: OpenviduComponentsLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenviduComponentsLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

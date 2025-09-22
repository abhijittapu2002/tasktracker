import { TestBed } from '@angular/core/testing';

import { RemarksService } from './remarks.service';

describe('RemarksService', () => {
  let service: RemarksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemarksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { TripLogService } from './trip-log.service';

describe('TripLogService', () => {
  let service: TripLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

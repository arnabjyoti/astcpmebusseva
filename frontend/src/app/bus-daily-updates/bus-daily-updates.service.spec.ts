import { TestBed } from '@angular/core/testing';

import { BusDailyUpdatesService } from './bus-daily-updates.service';

describe('BusDailyUpdatesService', () => {
  let service: BusDailyUpdatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusDailyUpdatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

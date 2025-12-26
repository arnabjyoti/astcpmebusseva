import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusDailyUpdatesComponent } from './bus-daily-updates.component';

describe('BusDailyUpdatesComponent', () => {
  let component: BusDailyUpdatesComponent;
  let fixture: ComponentFixture<BusDailyUpdatesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BusDailyUpdatesComponent]
    });
    fixture = TestBed.createComponent(BusDailyUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

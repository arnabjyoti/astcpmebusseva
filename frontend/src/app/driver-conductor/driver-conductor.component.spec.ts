import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverConductorComponent } from './driver-conductor.component';

describe('DriverConductorComponent', () => {
  let component: DriverConductorComponent;
  let fixture: ComponentFixture<DriverConductorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DriverConductorComponent]
    });
    fixture = TestBed.createComponent(DriverConductorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

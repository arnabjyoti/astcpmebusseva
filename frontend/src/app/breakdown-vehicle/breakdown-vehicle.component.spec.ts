import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakdownVehicleComponent } from './breakdown-vehicle.component';

describe('BreakdownVehicleComponent', () => {
  let component: BreakdownVehicleComponent;
  let fixture: ComponentFixture<BreakdownVehicleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BreakdownVehicleComponent]
    });
    fixture = TestBed.createComponent(BreakdownVehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

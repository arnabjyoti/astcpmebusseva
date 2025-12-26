import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusRoutesComponent } from './bus-routes.component';

describe('BusRoutesComponent', () => {
  let component: BusRoutesComponent;
  let fixture: ComponentFixture<BusRoutesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BusRoutesComponent]
    });
    fixture = TestBed.createComponent(BusRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

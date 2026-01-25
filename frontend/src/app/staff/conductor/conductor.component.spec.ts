import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductorComponent } from './conductor.component';

describe('ConductorComponent', () => {
  let component: ConductorComponent;
  let fixture: ComponentFixture<ConductorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConductorComponent]
    });
    fixture = TestBed.createComponent(ConductorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface BreakdownVehicleData {
  vehicleNumber: string;
  routeNumber: string;
  driverId: string;
  conductorId: string;
  tripCompleted: number;
  kilometresDriven: number;
  placeOfBreakdown: string;
  timeOfBreakdown: string;
  causeOfBreakdown: string;
  remarks?: string;
}

@Component({
  selector: 'app-breakdown-vehicle',
  templateUrl: './breakdown-vehicle.component.html',
  styleUrls: ['./breakdown-vehicle.component.css'],
})
export class BreakdownVehicleComponent implements OnInit {
   breakdownForm: FormGroup;
  isSubmitting = false;

  @Output() formSubmit = new EventEmitter<BreakdownVehicleData>();
  @Output() formCancel = new EventEmitter<void>();

  constructor(private fb: FormBuilder) {
    this.breakdownForm = this.fb.group({
      vehicleNumber: ['', [Validators.required]],
      routeNumber: ['', [Validators.required]],
      driverId: ['', [Validators.required]],
      conductorId: ['', [Validators.required]],
      tripCompleted: ['', [Validators.required, Validators.min(0)]],
      kilometresDriven: ['', [Validators.required, Validators.min(0)]],
      placeOfBreakdown: ['', [Validators.required]],
      timeOfBreakdown: ['', [Validators.required]],
      causeOfBreakdown: ['', [Validators.required]],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    // Initialize with current time
    const currentTime = new Date().toTimeString().slice(0, 5);
    this.breakdownForm.patchValue({
      timeOfBreakdown: currentTime
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.breakdownForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.breakdownForm.valid) {
      this.isSubmitting = true;
      const formData: BreakdownVehicleData = this.breakdownForm.value;
      
      // Emit the form data to parent component
      this.formSubmit.emit(formData);

      // Simulate API call delay (remove in production)
      setTimeout(() => {
        this.isSubmitting = false;
        this.breakdownForm.reset();
        // Reset time to current time
        const currentTime = new Date().toTimeString().slice(0, 5);
        this.breakdownForm.patchValue({
          timeOfBreakdown: currentTime
        });
      }, 1000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.breakdownForm.controls).forEach(key => {
        this.breakdownForm.get(key)?.markAsTouched();
      });
    }
  }

  onReset(): void {
    this.breakdownForm.reset();
    // Reset time to current time
    const currentTime = new Date().toTimeString().slice(0, 5);
    this.breakdownForm.patchValue({
      timeOfBreakdown: currentTime
    });
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}

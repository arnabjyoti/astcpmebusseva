import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';

interface BreakdownRecord {
  id: number;
  vehicleNumber: string;
  routeNumber: string;
  driverId: string;
  conductorId: string;
  tripCompleted: string;
  kmDriven: string;
  placeOfBreakdown: string;
  dateOfBreakdown: Date;
  timeOfBreakdown: string;
  causeOfBreakdown: string;
  remarks: string;
}

@Component({
  selector: 'app-breakdown-vehicle',
  templateUrl: './breakdown-vehicle.component.html',
  styleUrls: ['./breakdown-vehicle.component.css'],
})
export class BreakdownVehicleComponent implements OnInit {
  BreakdownData: any[] = [];
  headers: any;

  breakdownRecords: BreakdownRecord[] = [];
  paginatedRecords: BreakdownRecord[] = [];

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10; // Records per page
  totalRecords: number = 0;
  totalPages: number = 0;

  // Form properties
  breakdownForm: FormGroup;
  showForm: boolean = false;
  isEditMode: boolean = false;
  editingRecordId: number | null = null;

  constructor(private formBuilder: FormBuilder, private app: AppService, private http: HttpClient) {
    this.breakdownForm = this.createForm();
     this.app.getHttpHeader((h: any) => {
      this.headers = h;
    });
  }

  ngOnInit(): void {
    // Load breakdown records from your service
    // this.loadBreakdownRecords();
    this.fetchBreakdownTable();
  }

  fetchBreakdownTable(): void {
    const ENDPOINT = `${environment.BASE_URL}/api/fetchBreakdownTable`;
    
      this.http.post(ENDPOINT, {  }).subscribe(
        (response: any) => {
          console.log('Hello me:',response);
          this.BreakdownData = response.breakdownQuery; // Adjust based on actual response structure
        },
        (error) => {
          console.log(error);
        }
      );
    }

  // Form Methods
  createForm(): FormGroup {
    return this.formBuilder.group({
      vehicleNumber: ['', Validators.required],
      routeNumber: ['', Validators.required],
      driverId: ['', Validators.required],
      conductorId: ['', Validators.required],
      tripCompleted: ['', [Validators.required, Validators.min(0)]],
      kmDriven: ['', [Validators.required, Validators.min(0)]],
      placeOfBreakdown: ['', Validators.required],
      dateOfBreakdown: ['', Validators.required],
      timeOfBreakdown: ['', Validators.required],
      causeOfBreakdown: ['', Validators.required],
      remarks: [''],
    });
  }

  loadBreakdownRecords(): void {
    // Sample data - replace with actual service call
    this.breakdownRecords = [
      {
        id: 1,
        vehicleNumber: 'AS21595',
        routeNumber: '12A',
        driverId: 'D001',
        conductorId: 'C001',
        tripCompleted: '5',
        kmDriven: '120',
        placeOfBreakdown: 'Near Ganeshguri',
        dateOfBreakdown: new Date('2026-01-29'),
        timeOfBreakdown: '12:36',
        causeOfBreakdown: 'Engine failure',
        remarks: 'Immediate repair required',
      },
    ];

    this.totalRecords = this.breakdownRecords.length;
    this.calculateTotalPages();
    this.updatePaginatedRecords();
  }

  // Pagination Methods
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
  }

  updatePaginatedRecords(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRecords = this.breakdownRecords.slice(startIndex, endIndex);
  }

  getStartIndex(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    const endIndex = this.currentPage * this.pageSize;
    return endIndex > this.totalRecords ? this.totalRecords : endIndex;
  }

  getActualIndex(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedRecords();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedRecords();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedRecords();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than or equal to maxPagesToShow
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, this.currentPage + 2);

      // Adjust if at the beginning or end
      if (this.currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (this.currentPage >= this.totalPages - 2) {
        startPage = this.totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to first page
    this.calculateTotalPages();
    this.updatePaginatedRecords();
  }

  // Export Methods
  downloadReport(): void {
    // Format data for export
    const exportData = this.formatBreakdownDataForExport(this.breakdownRecords);

    // Export to Excel
    this.exportToExcel(exportData, 'Breakdown_Records_Report');

    console.log('Report downloaded successfully');
  }

  formatBreakdownDataForExport(records: BreakdownRecord[]): any[] {
    return records.map((record, index) => ({
      'Sr. No.': index + 1,
      'Vehicle Number': record.vehicleNumber,
      'Route Number': record.routeNumber,
      'Driver ID': record.driverId,
      'Conductor ID': record.conductorId,
      'Trip Completed': record.tripCompleted,
      'Kilometres Driven': record.kmDriven,
      'Place of Breakdown': record.placeOfBreakdown,
      'Date of Breakdown': this.formatDate(record.dateOfBreakdown),
      'Time of Breakdown': record.timeOfBreakdown,
      'Cause of Breakdown': record.causeOfBreakdown,
      Remarks: record.remarks,
    }));
  }

  exportToExcel(data: any[], fileName: string): void {
    // Create a new workbook
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Breakdown Records');

    // Save the file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  private formatDate(date: any): string {
    if (!date) return '';

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  // CRUD Operations
  isOpen_form: boolean = false;
  open_breakdown_form(): void {
    // Show the form for adding new breakdown
    this.isOpen_form = !this.isOpen_form;
    // this.isEditMode = false;
    // this.editingRecordId = null;
    // this.breakdownForm.reset();
    // this.showForm = true;
    // console.log('Add breakdown clicked - form shown');
  }

  close_breakdown_form(): void {
    this.isOpen_form = false;
  }

  editBreakdown(record: BreakdownRecord): void {
    // Populate form with record data and show it
    this.isEditMode = true;
    this.editingRecordId = record.id;

    // Format date for input[type="date"]
    const formattedDate = this.formatDateForInput(record.dateOfBreakdown);

    this.breakdownForm.patchValue({
      vehicleNumber: record.vehicleNumber,
      routeNumber: record.routeNumber,
      driverId: record.driverId,
      conductorId: record.conductorId,
      tripCompleted: record.tripCompleted,
      kmDriven: record.kmDriven,
      placeOfBreakdown: record.placeOfBreakdown,
      dateOfBreakdown: formattedDate,
      timeOfBreakdown: record.timeOfBreakdown,
      causeOfBreakdown: record.causeOfBreakdown,
      remarks: record.remarks,
    });

    this.showForm = true;
    console.log('Edit breakdown:', record);
  }

  deleteBreakdown(id: number): void {
    // Confirm and delete the record
    if (confirm('Are you sure you want to delete this breakdown record?')) {
      this.breakdownRecords = this.breakdownRecords.filter((r) => r.id !== id);
      this.totalRecords = this.breakdownRecords.length;
      this.calculateTotalPages();

      // Check if current page is now out of bounds
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages;
      }

      this.updatePaginatedRecords();
      console.log('Deleted breakdown with id:', id);
      // Call your service to delete from backend
    }
  }

  // Form submission and actions
  onSubmit(): void {
    if (this.breakdownForm.valid) {
      const formData = this.breakdownForm.value;

      if (this.isEditMode && this.editingRecordId !== null) {
        // Update existing record
        const index = this.breakdownRecords.findIndex(
          (r) => r.id === this.editingRecordId,
        );
        if (index !== -1) {
          this.breakdownRecords[index] = {
            id: this.editingRecordId,
            vehicleNumber: formData.vehicleNumber,
            routeNumber: formData.routeNumber,
            driverId: formData.driverId,
            conductorId: formData.conductorId,
            tripCompleted: formData.tripCompleted,
            kmDriven: formData.kmDriven,
            placeOfBreakdown: formData.placeOfBreakdown,
            dateOfBreakdown: new Date(formData.dateOfBreakdown),
            timeOfBreakdown: formData.timeOfBreakdown,
            causeOfBreakdown: formData.causeOfBreakdown,
            remarks: formData.remarks || '',
          };
          console.log('Updated record:', this.breakdownRecords[index]);
          alert('Breakdown record updated successfully!');
        }
      } else {
        // Create new record
        const newRecord: BreakdownRecord = {
          id: this.getNextId(),
          vehicleNumber: formData.vehicleNumber,
          routeNumber: formData.routeNumber,
          driverId: formData.driverId,
          conductorId: formData.conductorId,
          tripCompleted: formData.tripCompleted,
          kmDriven: formData.kmDriven,
          placeOfBreakdown: formData.placeOfBreakdown,
          dateOfBreakdown: new Date(formData.dateOfBreakdown),
          timeOfBreakdown: formData.timeOfBreakdown,
          causeOfBreakdown: formData.causeOfBreakdown,
          remarks: formData.remarks || '',
        };

        this.breakdownRecords.push(newRecord);
        console.log('Created new record:', newRecord);
        alert('Breakdown record created successfully!');
      }

      // Update pagination and hide form
      this.totalRecords = this.breakdownRecords.length;
      this.calculateTotalPages();
      this.updatePaginatedRecords();
      this.showForm = false;
      this.breakdownForm.reset();

      // Call your service here to save to backend
      // this.breakdownService.createBreakdown(formData).subscribe(...)
      // or this.breakdownService.updateBreakdown(id, formData).subscribe(...)
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.breakdownForm.controls).forEach((key) => {
        this.breakdownForm.get(key)?.markAsTouched();
      });

      alert('Please fill in all required fields');
    }
  }

  onReset(): void {
    this.breakdownForm.reset();
    console.log('Form reset');
  }

  onCancel(): void {
    if (this.breakdownForm.dirty) {
      if (
        confirm(
          'Are you sure you want to cancel? Any unsaved changes will be lost.',
        )
      ) {
        this.showForm = false;
        this.breakdownForm.reset();
      }
    } else {
      this.showForm = false;
      this.breakdownForm.reset();
    }
  }

  // Helper methods for form
  getNextId(): number {
    if (this.breakdownRecords.length === 0) {
      return 1;
    }
    return Math.max(...this.breakdownRecords.map((r) => r.id)) + 1;
  }

  formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.breakdownForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

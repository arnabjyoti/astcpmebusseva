import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';

import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-breakdown-vehicle',
  templateUrl: './breakdown-vehicle.component.html',
  styleUrls: ['./breakdown-vehicle.component.css'],
})
export class BreakdownVehicleComponent implements OnInit {
  BreakdownData: any[] = [];
  headers: any;

  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  isOpen_form = false;

  breakdownForm: FormGroup;
  searchForm: FormGroup;
  // selectedId: number | null = null;
  selectedId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private app: AppService,
    private http: HttpClient,
  ) {
    this.breakdownForm = this.createForm();
    this.searchForm = this.createSearchForm();

    this.app.getHttpHeader((headers: any) => {
      this.headers = headers;
    });
  }

  ngOnInit(): void {
    this.fetchBreakdownTable();
  }

  private createSearchForm(): FormGroup {
    return this.formBuilder.group({
      fromDate: [''],
      toDate: [''],
      vehicleNumber: [''],
      routeNumber: [''],
    });
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      vehicleNumber: ['', Validators.required],
      routeNumber: ['', Validators.required],
      driverId: ['', Validators.required],
      driverName: ['', Validators.required],
      conductorId: ['', Validators.required],
      conductorName: ['', Validators.required],
      tripCompleted: ['', [Validators.required, Validators.min(0)]],
      kmDriven: ['', [Validators.required, Validators.min(0)]],
      kmAtBreakdown: ['', Validators.required],
      kmLost: ['', Validators.required],
      placeOfBreakdown: ['', Validators.required],
      dateOfBreakdown: ['', Validators.required],
      timeOfBreakdown: ['', Validators.required],
      causeOfBreakdown: ['', Validators.required],
      currentStatus: ['', Validators.required],
      remarks: [''],
    });
  }

  fetchBreakdownTable(): void {
    const ENDPOINT = `${environment.BASE_URL}/api/fetchBreakdownTable`;

    const payload = {
      params: {
        page: this.currentPage,
        limit: this.pageSize,
        ...this.searchForm.value,
      },
    };

    this.http.post(ENDPOINT, payload).subscribe({
      next: (response: any) => {
        console.log("Breakdown Data ==> ", response);
        this.BreakdownData = response?.breakdownQuery || [];
        this.totalRecords = Number(
          response?.pagination?.total || this.BreakdownData.length,
        );
        this.totalPages = Number(
          response?.pagination?.totalPages ||
            Math.ceil(this.totalRecords / this.pageSize),
        );
      },
      error: (error) => {
        console.error('Error fetching breakdown records:', error);
      },
    });
  }

  updateForm(): void {
    if (this.breakdownForm.invalid) {
      this.breakdownForm.markAllAsTouched();
      return;
    }

    const payload = this.breakdownForm.value;

    console.log('Selected Id ==> ', this.selectedId)

    const ENDPOINT = `${environment.BASE_URL}/api/updateBreakdown/${this.selectedId}`;

    this.http.post(ENDPOINT, payload).subscribe({
      next: () => {
        this.fetchBreakdownTable();
        this.close_breakdown_form();
      },
      error: (err) => console.error(err),
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.fetchBreakdownTable();
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.currentPage = 1;
    this.fetchBreakdownTable();
  }

  getStartIndex(): number {
    return this.totalRecords === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  getActualIndex(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.fetchBreakdownTable();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchBreakdownTable();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchBreakdownTable();
    }
  }

  onReset(): void {
    this.breakdownForm.reset();
  }

  formatDateForInput(date: any): string {
    if (!date) return '';

    const d = new Date(date);
    return d.toISOString().split('T')[0]; // ✅ correct format
  }

  open_breakdown_form(record: any): void {
    this.isOpen_form = true;

    this.selectedId = record.id;
    console.log('Selected Id New:', this.selectedId);

    console.log('Selected Record:', record);

    this.breakdownForm.patchValue({
      vehicleNumber: record?.bus?.busNo,
      routeNumber: record?.routeNo,
      driverId: record?.driver?.driver_id,
      driverName: record?.driver?.driver_name,
      conductorId: record?.conductor?.conductor_id,
      conductorName: record?.conductor?.conductor_name,
      tripCompleted: record?.noOfTrip,
      kmDriven: record?.totalOperated,
      kmAtBreakdown: record?.kmAtBreakdown,
      kmLost: record?.lossKm,
      placeOfBreakdown: record?.placeOfBreakdown,
      causeOfBreakdown: record?.causeOfBreakdown,
      dateOfBreakdown: this.formatDateForInput(record?.date),
      timeOfBreakdown: record?.stopTime,
      currentStatus: record?.currentStatus,
      remarks: record?.remarks,
    });
  }

  close_breakdown_form(): void {
    this.isOpen_form = false;
    this.breakdownForm.reset();
  }

  deleteBreakdown(id: number): void {
    // Delete data and make the vehicle current status to idle
    if (!confirm('Are you sure you want to delete this breakdown record?')) {
      return;
    }

    const ENDPOINT = `${environment.BASE_URL}/api/deleteBreakdownRecord/${id}`;

    this.http.delete(ENDPOINT).subscribe({
      next: () => {
        this.fetchBreakdownTable();
      },
      error: (error) => {
        console.error('Error deleting breakdown record:', error);
      },
    });
  }

  downloadReport(): void {
    if (!this.BreakdownData.length) {
      return;
    }

    const exportData = this.BreakdownData.map((record, index) => ({
      'Sl No.': index + 1,
      'Vehicle Number': record?.bus?.busNo || 'N/A',
      'Route Number': record?.routeNo || 'N/A',
      'Driver ID': record?.driver?.driver_id || 'N/A',
      'Driver Name': record?.driver?.driver_name || 'N/A',
      'Conductor ID': record?.conductor?.conductor_id || 'N/A',
      'Conductor Name': record?.conductor?.conductor_name || 'N/A',
      'Trip Completed': record?.noOfTrip || 0,
      'KM Driven': record?.totalOperated || 0,
      'KM At Breakdown': record?.kmAtBreakdown || 0,
      'Loss KM': record?.lossKm || 0,
      'Place of Breakdown': record?.placeOfBreakdown || 'N/A',
      'Date of Breakdown': this.formatDate(record?.date),
      'Time of Breakdown': record?.stopTime || 'N/A',
      'Cause of Breakdown': record?.causeOfBreakdown || 'N/A',
      Remarks: record?.remarks || '',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Breakdown Report');
    XLSX.writeFile(workbook, `breakdown_report_${new Date().getTime()}.xlsx`);
  }

  private formatDate(date: any): string {
    if (!date) {
      return 'N/A';
    }

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }
}

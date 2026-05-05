import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-breakdown-vehicle',
  templateUrl: './breakdown-vehicle.component.html',
  styleUrls: ['./breakdown-vehicle.component.css'],
})
export class BreakdownVehicleComponent implements OnInit {
  BreakdownData: any[] = [];

  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  isOpen_form = false;
  selectedId: number | null = null;

  breakdownForm: FormGroup;
  searchForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
  ) {
    this.breakdownForm = this.createForm();
    this.searchForm = this.createSearchForm();
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
      currentStatus: ['all'],
    });
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      vehicleNumber: [{ value: '', disabled: true }, Validators.required],
      routeNumber: [{ value: '', disabled: true }, Validators.required],
      driverId: [{ value: '', disabled: true }, Validators.required],
      driverName: [{ value: '', disabled: true }, Validators.required],
      conductorId: [{ value: '', disabled: true }, Validators.required],
      conductorName: [{ value: '', disabled: true }, Validators.required],
      tripCompleted: [{ value: '', disabled: true }],
      kmDriven: [{ value: '', disabled: true }],
      kmAtBreakdown: ['', Validators.required],
      kmLost: ['', Validators.required],
      placeOfBreakdown: ['', Validators.required],
      dateOfBreakdown: ['', Validators.required],
      timeOfBreakdown: ['', Validators.required],
      causeOfBreakdown: ['', Validators.required],
      currentStatus: ['still', Validators.required],
      idleDate: [''],
      remarks: [''],
    });
  }

  fetchBreakdownTable(): void {
    const ENDPOINT = `${environment.BASE_URL}/api/fetchBreakdownTable`;
    const payload = {
      params: {
        page: this.currentPage,
        limit: this.pageSize,
        ...this.searchForm.getRawValue(),
      },
    };

    this.http.post(ENDPOINT, payload).subscribe({
      next: (response: any) => {
        const records = response?.breakdownQuery || [];
        this.BreakdownData = records.map((record: any) => ({
          ...record,
          daysInIdle: this.calculateDaysInIdle(record?.idleDate),
        }));
        this.totalRecords = Number(response?.pagination?.total || this.BreakdownData.length);
        this.totalPages = Number(
          response?.pagination?.totalPages || Math.ceil(this.totalRecords / this.pageSize) || 1,
        );
      },
      error: (error) => {
        console.error('Error fetching breakdown records:', error);
      },
    });
  }

  updateForm(): void {
    if (this.breakdownForm.invalid || !this.selectedId) {
      this.breakdownForm.markAllAsTouched();
      return;
    }

    const payload = this.breakdownForm.getRawValue();
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
    this.searchForm.reset({
      fromDate: '',
      toDate: '',
      vehicleNumber: '',
      routeNumber: '',
      currentStatus: 'all',
    });
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
    if (!this.selectedId) {
      return;
    }

    const selectedRecord = this.BreakdownData.find((record) => record.id === this.selectedId);
    if (selectedRecord) {
      this.open_breakdown_form(selectedRecord);
    }
  }

  formatDateForInput(date: string): string {
    if (!date) {
      return '';
    }

    return String(date).slice(0, 10);
  }

  open_breakdown_form(record: any): void {
    this.isOpen_form = true;
    this.selectedId = record.id;

    this.breakdownForm.patchValue({
      vehicleNumber: record?.bus?.busNo || '',
      routeNumber: record?.routeNo || '',
      driverId: record?.driver?.driver_id || '',
      driverName: record?.driver?.driver_name || '',
      conductorId: record?.conductor?.conductor_id || '',
      conductorName: record?.conductor?.conductor_name || '',
      tripCompleted: record?.tripCompleted || '',
      kmDriven: record?.kmDriven || '',
      kmAtBreakdown: record?.kmAtBreakdown || '',
      kmLost: record?.lossKm || '',
      placeOfBreakdown: record?.placeOfBreakdown || '',
      causeOfBreakdown: record?.causeOfBreakdown || '',
      dateOfBreakdown: this.formatDateForInput(record?.breakdownDate),
      timeOfBreakdown: record?.breakdownTime || '',
      currentStatus: record?.currentStatus || 'still',
      idleDate: this.formatDateForInput(record?.idleDate),
      remarks: record?.remarks || '',
    });
  }

  close_breakdown_form(): void {
    this.isOpen_form = false;
    this.selectedId = null;
    this.breakdownForm.reset({
      currentStatus: 'still',
      idleDate: '',
    });
  }

  markAsIdle(record: any): void {
    this.open_breakdown_form(record);

    this.breakdownForm.patchValue({
      currentStatus: 'idle',
      idleDate: this.formatDateForInput(record?.idleDate || new Date().toISOString()),
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
      'Trip Completed': record?.tripCompleted || 0,
      'KM Driven': record?.kmDriven || 0,
      'KM At Breakdown': record?.kmAtBreakdown || 0,
      'Loss KM': record?.lossKm || 0,
      'Place of Breakdown': record?.placeOfBreakdown || 'N/A',
      'Breakdown Date': this.formatDisplayDate(record?.breakdownDate),
      'Breakdown Time': record?.breakdownTime || 'N/A',
      'Breakdown Cause': record?.causeOfBreakdown || 'N/A',
      Status: this.formatStatus(record?.currentStatus),
      'Idle Date': this.formatDisplayDate(record?.idleDate),
      'Days In Idle': record?.daysInIdle || 0,
      Remarks: record?.remarks || '',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Breakdown Report');
    XLSX.writeFile(workbook, `breakdown_report_${new Date().getTime()}.xlsx`);
  }

  formatStatus(status: string): string {
    if (!status) {
      return 'N/A';
    }

    return status === 'still' ? 'Still' : status === 'idle' ? 'Idle' : status;
  }

  private calculateDaysInIdle(idleDate: string): number {
    if (!idleDate) {
      return 0;
    }

    const start = new Date(idleDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    if (diffTime < 0) {
      return 0;
    }

    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  private formatDisplayDate(date: string): string {
    if (!date) {
      return 'N/A';
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();

    return `${day}-${month}-${year}`;
  }
}

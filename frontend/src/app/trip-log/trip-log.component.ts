import { Component } from '@angular/core';
import { TripLogService } from './trip-log.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-trip-log',
  templateUrl: './trip-log.component.html',
})
export class TripLogComponent {
  startDate: string = '';
  endDate: string = '';
  tripLogs: any[] = [];
  loading = false;
  loadingDiv = false;



  trips: any[] = [];
  currentTrip: any = {};
  isEdit = false;
  bsModal: any;


  // For modal form binding
  newEntry: any = {
    date: '',
    vehicleOnRoad: '',
    timesheetNo: '',
    routeNo: '',
    omrOpeningKm: '',
    cmrClosingKm: '',
    totalKm: '',
    driverName: '',
    conductorName: '',
    noOfTrip: '',
    totalEarning: '',
    phonepe: '',
    parking: '',
    tripAllowance: '',
    netAmt: '',
    netEarning: ''
  };

  // Array to hold all added rows
  tableData: any[] = [];

  constructor(private tripLogService: TripLogService) {}

  searchLogs(): void {
    this.loadingDiv = true;
    if (!this.startDate || !this.endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    const req = {
      startDate: this.startDate,
      endDate: this.endDate,
    };

    this.loading = true;

    this.tripLogService.getFilteredTripLogs(req, (res: any) => {
      if (res?.error) {
        console.error('Error fetching trip logs', res);
        this.loading = false;
      } else {
        this.tripLogs = res;
        this.loading = false;
        this.loadingDiv = false;
      }
    });
  }


  downloadCSV(): void {
  if (!this.tripLogs.length) return;

  // CSV Header
  const headers = [
    'Sl. No.',
    'Date',
    'Vehicle on Road',
    'Timesheet No.',
    'Route No.',
    'OMR Opening Km',
    'CMR Closing Km',
    'Total KM Operated',
    'Driver Name',
    'Conductor Name',
    'No. of Trips',
    'Total Earning ( in Rs.) (A)',
    'PhonePe (B)',
    'Parking (C)',
    'Allowance ( in Rs.) (D)',
    'Net Amt deposited in WaySide Cahier E=A-B-C-D',
    'Net Net Earning',
    'Amount to be deposited',
    'Remarks',
  ];

  // CSV Rows
  const rows = this.tripLogs.map((log, index) => [
    index + 1,
    log.date,
    log.vehicle_on_road,
    log.timesheet_no,
    log.route_no,
    log.omr_opening_km,
    log.cmr_closing_km,
    log.total_km_operated,
    log.driver_name,
    log.conductor_name,
    log.no_of_trip,
    log.total_earning_rs,
    log.phonepe_b,
    log.parking_c,
    log.trip_allowance_rs_d,
    log.net_amt_deposited,
    log.net_2,
    log.amount_to_be_deposited,
    log.remarks
  ]);

  // Convert to CSV string
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(value => `"${value ?? ''}"`).join(',') + '\n';
  });

  // Create a download link and click it
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `trip_logs_${this.startDate}_to_${this.endDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


ngOnInit() {
    const modalEl: any = document.getElementById('tripModal');
    if (modalEl) {
      this.bsModal = new (window as any).bootstrap.Modal(modalEl);

      // reset form when modal fully closes
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.resetForm();
      });
    }
  }

  openModal(trip?: any) {
    if (trip) {
      this.currentTrip = { ...trip };
      this.isEdit = true;
    } else {
      this.resetForm();
      this.isEdit = false;
    }
    this.bsModal.show();
  }

  calculate() {
    const open = Number(this.currentTrip.omrOpen) || 0;
    const close = Number(this.currentTrip.cmrClose) || 0;
    this.currentTrip.totalKm = close - open;

    const A = Number(this.currentTrip.earning) || 0;
    const B = Number(this.currentTrip.phonepe) || 0;
    const C = Number(this.currentTrip.parking) || 0;
    const D = Number(this.currentTrip.allowance) || 0;

    this.currentTrip.netDeposit = A - (B + C + D);
  }

  formatDate(date: any): string {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

onSubmit(form: NgForm) {
  if (form.invalid) {
    form.form.markAllAsTouched(); // show validation messages if you add them
    return;
  }

  // ensure yyyy-mm-dd going out
  this.currentTrip.date = this.formatDate(this.currentTrip.date);

  this.saveTrip();     // your existing logic updates/pushes to this.trips
  // form.resetForm();  // optional, since you already clear on modal hidden
}

saveTrip() {
  // Required field list
  const requiredFields = [
    'date',
    'vehicle',
    'timesheet',
    'route',
    'omrOpen',
    'cmrClose',
    'trips',
    'driver',
    'conductor',
    'earning',
    'phonepe',
    'parking',
    'allowance'
  ];

  // Loop through required fields
  for (const field of requiredFields) {
    if (this.currentTrip[field] === null || this.currentTrip[field] === '' || this.currentTrip[field] === undefined) {
      alert(`❌ Please fill ${field} before saving.`);
      return; // stop saving
    }
  }

  // Ensure date format yyyy-mm-dd
  this.currentTrip.date = this.formatDate(this.currentTrip.date);

  // Save / Update trip
  if (this.isEdit) {
    const idx = this.trips.findIndex(
      t => t.vehicle === this.currentTrip.vehicle && t.date === this.currentTrip.date
    );
    if (idx > -1) this.trips[idx] = { ...this.currentTrip };
  } else {
    this.trips.push({ ...this.currentTrip });
  }

  this.bsModal.hide();
}

  resetForm() {
    this.currentTrip = {
      date: '',
      vehicle: '',
      timesheet: '',
      route: '',
      omrOpen: 0,
      cmrClose: 0,
      totalKm: 0,
      driver: '',
      conductor: '',
      trips: 0,
      earning: 0,
      phonepe: 0,
      parking: 0,
      allowance: 0,
      netDeposit: 0,
      netEarning: 0
    };
  }


  submitAll() {
    if (this.trips.length === 0) {
      alert("No trip log to save!");
      return;
    }

    this.loading = true;
    this.tripLogService.createTripLog(this.trips, (res: any) => {
      if (res?.error) {
        console.error('Error submitting trip log data', res);
        this.loading = false;
      } else {
        this.loading = false;
      }
    });

    console.log("data", this.trips);
    this.trips = []; 
    
  }

  closeModal() {
  this.resetForm();  // clear form
  this.isEdit = false;

  if (this.bsModal) {
    this.bsModal.hide();   // hide modal properly
  }

  // Move focus back to button after modal closes
  setTimeout(() => {
    const addBtn = document.querySelector("#addTripBtn") as HTMLElement;
    if (addBtn) addBtn.focus();
  }, 300);
}
}

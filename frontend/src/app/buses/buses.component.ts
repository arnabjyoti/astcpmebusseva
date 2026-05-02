import { Component } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'underscore';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import * as XLSX from 'xlsx';

declare var $: any;

@Component({
  selector: 'app-buses',
  templateUrl: './buses.component.html',
  styleUrls: ['./buses.component.css'],
})
export class BusesComponent {
  isLoading: boolean = false;
  loadingMessage: string = 'Fetching Bus Master...';
  expandedBusId: number | null = null;
  readonly conductorWarningPendingAmount = 3000;
  readonly conductorBlockPendingAmount = 5000;
  warningPendingAmount: number = 0;
  isPendingAmountLoading: boolean = false;
  isPendingAmountCheckLoading: boolean = false;
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  private pendingTripProceedAction: (() => void) | null = null;

  constructor(
    private appService: AppService,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  private readonly busesScrollPositionKey =
    'busesScrollPositionBeforeDailyUpdate';

  form: any = {
    busName: '',
    busNo: '',
    driverName: '',
    driverContactNo: '',
    conductorName: '',
    conductorContactNo: '',
    baseDepot: '',
    allotedRouteNo: '',
  };

  busList: any;
  driverList: any;
  conductorList: any;
  routeList: any;

  // current date in formate yyyy-mm-dd
  dataForDate: any = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.getBuses();
    this.getDriver();
    this.getConductor();
    this.getBusRoutes();
  }

  saveData = () => {
    // 🔴 Basic validation
    if (!this.form.busNo || this.form.busNo.trim() === '') {
      this.toastr.warning('Bus No is required', 'Validation');
      return;
    }

    if (!this.form.driverName) {
      this.toastr.warning('Please select a Driver', 'Validation');
      return;
    }

    if (!this.form.conductorName) {
      this.toastr.warning('Please select a Conductor', 'Validation');
      return;
    }

    if (!this.form.allotedRouteNo) {
      this.toastr.warning('Please select a Route', 'Validation');
      return;
    }

    // ✅ continue only if validation passed
    const ENDPOINT = `${environment.BASE_URL}/api/createBus`;

    let selectedDriverDetails = this.driverList.find(
      (ele: any) => ele.id === parseInt(this.form.driverName),
    );

    let selectedConductorDetails = this.conductorList.find(
      (ele: any) => ele.id === parseInt(this.form.conductorName),
    );

    if (!selectedDriverDetails || !selectedConductorDetails) {
      this.toastr.error('Invalid Driver or Conductor selected', 'Error');
      return;
    }

    this.form.driverId = selectedDriverDetails.id;
    this.form.driverName = selectedDriverDetails.driver_name;
    this.form.conductorId = selectedConductorDetails.id;
    this.form.conductorName = selectedConductorDetails.conductor_name;

    const requestOptions = {
      requestObject: this.form,
    };

    this.http.post(ENDPOINT, requestOptions).subscribe(
      (response) => {
        this.getBuses();
        this.getDriver();
        this.getConductor();
        this.toastr.success('Added Successfully', 'Success');
        let ele: any = document.getElementById('modalClose');
        ele.click();
      },
      (error) => {
        this.toastr.error('Something went wrong!', 'Warning');
      },
    );
  };

  updateData = () => {
    // 🔴 Basic validation (no driver/conductor validation)
    if (!this.form.busNo || this.form.busNo.trim() === '') {
      this.toastr.warning('Bus No is required', 'Validation');
      return;
    }

    if (!this.form.allotedRouteNo) {
      this.toastr.warning('Please select a Route', 'Validation');
      return;
    }

    // 👉 DRIVER LOGIC
    if (this.form.driverName === 'REMOVE') {
      this.form.driverId = null;
      this.form.driverName = null;
    } else if (this.form.driverName) {
      const driver = this.driverList.find(
        (d: any) => d.id === parseInt(this.form.driverName),
      );

      if (driver) {
        this.form.driverId = driver.id;
        this.form.driverName = driver.driver_name;
      }
    }
    // else → keep existing values (do nothing)

    // 👉 CONDUCTOR LOGIC
    if (this.form.conductorName === 'REMOVE') {
      this.form.conductorId = null;
      this.form.conductorName = null;
    } else if (this.form.conductorName) {
      const conductor = this.conductorList.find(
        (c: any) => c.id === parseInt(this.form.conductorName),
      );

      if (conductor) {
        this.form.conductorId = conductor.id;
        this.form.conductorName = conductor.conductor_name;
      }
    }

    const ENDPOINT = `${environment.BASE_URL}/api/updateBus`;

    const requestOptions = {
      requestObject: this.form,
    };

    this.http.post(ENDPOINT, requestOptions).subscribe(
      () => {
        this.getBuses();
        this.getDriver();
        this.getConductor();
        this.toastr.success('Updated Successfully', 'Success');
      },
      () => {
        this.toastr.error('Something went wrong!', 'Warning');
      },
    );
    let ele: any = document.getElementById('modalClose');
    ele.click();
  };

  dateForStatus: any = new Date().toISOString().split('T')[0];
  getBuses = () => {
    const params = new URLSearchParams({
      date: this.dataForDate,
      page: String(this.currentPage),
      limit: String(this.pageSize),
      search: this.searchTerm.trim(),
    });
    const ENDPOINT = `${environment.BASE_URL}/api/getBusList?${params.toString()}`;
    this.isLoading = true;
    this.loadingMessage = 'Fetching Bus Master...';

    this.http.get(ENDPOINT).subscribe(
      (response: any) => {
        console.log('busList response ', response);
        this.busList = response?.rows || [];
        this.totalRecords = Number(response?.pagination?.total || 0);
        this.totalPages = Number(response?.pagination?.totalPages || 0);
        this.currentPage = Number(
          response?.pagination?.page || this.currentPage,
        );
        this.dateForStatus = this.dataForDate;
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
        this.isLoading = false;
      },
      () => {
        console.log('Observable is now completed.');
        this.isLoading = false;
      },
    );
  };

  applySearch(): void {
    this.currentPage = 1;
    this.getBuses();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.getBuses();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.getBuses();
  }

  getStartEntry(): number {
    if (!this.totalRecords) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndEntry(): number {
    if (!this.totalRecords) {
      return 0;
    }

    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  getRowNumber(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  getDriver = () => {
    const ENDPOINT = `${environment.BASE_URL}/api/getDriver`;

    this.http.get(ENDPOINT).subscribe(
      (response) => {
        console.log('driver response ', response);
        this.driverList = response;
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
      },
      () => {
        console.log('Observable is now completed.');
      },
    );
  };

  getConductor = () => {
    const ENDPOINT = `${environment.BASE_URL}/api/getConductorWithAllotment`;

    this.http.get(ENDPOINT).subscribe(
      (response) => {
        console.log('response ', response);
        this.conductorList = response;
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
      },
      () => {
        console.log('Observable is now completed.');
      },
    );
  };

  getBusRoutes = () => {
    const ENDPOINT = `${environment.BASE_URL}/api/getBusRoutes`;

    this.http.get(ENDPOINT).subscribe(
      (response) => {
        console.log('response ', response);
        this.routeList = response;
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
      },
      () => {
        console.log('Observable is now completed.');
      },
    );
  };

  selectedConductorId: any;
  manageDrive = () => {
    const selectEl = document.querySelector(
      '[name="driverName"]',
    ) as HTMLSelectElement;

    const selectedDriverId = parseInt(selectEl.value);

    // If no driver selected
    if (!selectedDriverId) {
      this.form.driverContactNo = '';
      return;
    }

    const selectedDriverDetails = this.driverList.find(
      (driver: any) => driver.id === selectedDriverId,
    );

    if (!selectedDriverDetails) {
      return;
    }

    // 🚫 If driver already allotted
    if (selectedDriverDetails.allotmentStatus === 'Allotted') {
      this.toastr.warning('This driver is already allotted');
      selectEl.value = ''; // reset dropdown
      this.form.driverContactNo = '';
      return;
    }

    // ✅ Valid free driver
    this.form.driverContactNo = selectedDriverDetails.contact_no;
  };

  manageConductor = () => {
    const selectEl = document.querySelector(
      '[name="conductorName"]',
    ) as HTMLSelectElement;

    const selectedConductorId = parseInt(selectEl.value);

    // If nothing selected
    if (!selectedConductorId) {
      this.form.conductorContactNo = '';
      return;
    }

    const selectedDetails = this.conductorList.find(
      (conductor: any) => conductor.id === selectedConductorId,
    );

    if (!selectedDetails) {
      return;
    }

    // 🚫 Block already allotted conductor
    if (selectedDetails.allotmentStatus === 'Allotted') {
      this.toastr.warning('This conductor is already allotted');
      selectEl.value = '';
      this.form.conductorContactNo = '';
      return;
    }

    // ✅ Free conductor
    this.form.conductorContactNo = selectedDetails.contact_no;
  };

  selectedData: any = {};
  viewData = (id: any) => {
    this.selectedData = this.busList[id];
    console.log(this.busList[id]);
    this.newRoundTrip = parseInt(this.selectedData.noOfTrip) + 1;
  };

  amountToBeDeposited: any = 0;
  getRemainingAmountForConductor = (id: any) => {
    this.selectedData = this.busList[id];
    console.log(this.busList[id]);

    this.isPendingAmountLoading = true;

    const ENDPOINT = `${environment.BASE_URL}/api/getAmountToBePaidByConductor?id=${this.selectedData.conductor_actual_id}`;

    this.http.get(ENDPOINT).subscribe(
      (response: any) => {
        console.log('response ', response.data.amountToBeDeposited);
        this.amountToBeDeposited = Number(
          response.data.amountToBeDeposited || 0,
        );
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
        this.isPendingAmountLoading = false;
      },
      () => {
        console.log('Observable is now completed.');
        this.isPendingAmountLoading = false;
      },
    );
  };

  toBeDeletedRecord: any = {};
  openConfirmationDialog = (data: any) => {
    this.toBeDeletedRecord = data;
  };

  handleDeleteBus = () => {
    if (this.toBeDeletedRecord.id != '') {
      const ENDPOINT = `${environment.BASE_URL}/api/deleteBus`;
      const requestOptions = {
        requestObject: this.toBeDeletedRecord,
      };
      this.http.post(ENDPOINT, requestOptions).subscribe(
        (response) => {
          this.getBuses();
          this.toastr.success('Bus deleted successfully', 'Success Message');
        },
        (error) => {
          console.log('error here ', error);
          this.toastr.error('Something went wrong !', 'Warning');
        },
        () => {
          console.log('Observable is now completed.');
        },
      );
    } else {
      this.toastr.warning(
        'Please enter data properly before proceed',
        'Warning Message',
      );
    }
  };

  isEdit: boolean = false;
  openNewDialog = () => {
    this.isEdit = false;
    this.form = {
      id: '',
      busName: '',
      busNo: '',
      driverName: '',
      driverContactNo: '',
      conductorName: '',
      conductorContactNo: '',
      baseDepot: '',
      allotedRouteNo: '',
    };
  };

  openEditDialog = (data: any) => {
    console.log('data: ', data);

    this.isEdit = true;
    let selectedDriverDetails = this.driverList.find(
      (ele: any) => ele.driver_name === data?.driverName,
    );
    let selectedConductorDetails = this.conductorList.find(
      (ele: any) => ele.conductor_name === data?.conductorName,
    );
    this.form = {
      id: data?.id,
      busName: data?.busName,
      busNo: data?.busNo,
      driverName: selectedDriverDetails?.id,
      driverContactNo: data?.driverContactNo,
      conductorName: selectedConductorDetails?.id,
      conductorContactNo: data?.conductorContactNo,
      baseDepot: data?.baseDepot,
      allotedRouteNo: data?.routeId,
      isFixed: data?.isFixed,
    };
  };

  selectedDate: any;
  redirectToAddForm() {
    const dateInput = document.querySelector(
      'input[name="date"]',
    ) as HTMLInputElement;
    if (dateInput) {
      this.selectedDate = dateInput.value;
    }

    if (!this.selectedDate) {
      alert('Please select a date!');
      return;
    }

    this.validateConductorPendingAmountBeforeTrip(() => {
      this.closeModalAndCleanup('#addDetailsModal');
      this.saveCurrentScrollPosition();

      setTimeout(() => {
        this.router.navigate(['/daily-update'], {
          queryParams: {
            date: this.selectedDate,
            busId: this.selectedData.id,
            currentStatus: 'running',
            noOfTrip: 0,
            stopDate: this.dataForDate,
          },
        });
      }, 150);
    });
  }

  redirectToUpdateForm(data: any) {
    const dateInput = document.querySelector(
      'input[name="date"]',
    ) as HTMLInputElement;
    console.log('data ==> ', data);
    // return;

    if (!data.id) {
      alert('Bus id not found!');
      return;
    }

    this.saveCurrentScrollPosition();

    this.router.navigate(['/daily-update'], {
      queryParams: {
        busId: data.id,
        triptId: data.dailyUpdateId || data.previousDailyUpdateId,
        currentStatus: 'finished',
        type: 'update',
        stopDate: this.dataForDate,
      },
    });
  }

  private saveCurrentScrollPosition() {
    const scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    sessionStorage.setItem(this.busesScrollPositionKey, String(scrollTop));
  }

  private restoreSavedScrollPosition() {
    const savedScrollTop = sessionStorage.getItem(this.busesScrollPositionKey);

    if (savedScrollTop === null) {
      return;
    }

    sessionStorage.removeItem(this.busesScrollPositionKey);

    const scrollTop = Number(savedScrollTop);

    if (Number.isNaN(scrollTop)) {
      return;
    }

    setTimeout(() => {
      window.scrollTo({ top: scrollTop, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = scrollTop;
      document.body.scrollTop = scrollTop;
    });
  }

  // newRoundTrip:any = this.selectedData || 0;
  newRoundTrip: any;

  updateTrip() {
    if (this.newRoundTrip) {
      const ENDPOINT = `${environment.BASE_URL}/api/updateDailyUpdates`;
      const requestOptions = {
        requestObject: { noOfTrip: this.newRoundTrip },
        id: this.selectedData.dailyUpdateId,
      };
      this.http.post(ENDPOINT, requestOptions).subscribe(
        (response) => {
          this.getBuses();
          this.toastr.success('Trip updated successfully', 'Success Message');
        },
        (error) => {
          console.log('error here ', error);
          this.toastr.error('Something went wrong !', 'Warning');
        },
        () => {
          console.log('Observable is now completed.');
        },
      );
    }
  }

  toggleFixed(data: any, event: any) {
    console.log('data', event.target.checked);

    // return;
    const ENDPOINT = `${environment.BASE_URL}/api/updateBus`;
    const requestOptions = {
      requestObject: {
        isFixed: event.target.checked ? 'yes' : 'no',
        id: data.id,
      },
    };
    this.http.post(ENDPOINT, requestOptions).subscribe(
      (response) => {
        this.getBuses();
        this.toastr.success('Bus updated successfully', 'Success Message');
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
      },
      () => {
        console.log('Observable is now completed.');
      },
    );
  }

  today = new Date().toISOString().split('T')[0];

  private fetchPendingAmountForConductor(
    conductorId: number,
    callback: (amount: number, status?: string) => void,
  ): void {
    const ENDPOINT = `${environment.BASE_URL}/api/getAmountToBePaidByConductor?id=${conductorId}`;
    this.isPendingAmountCheckLoading = true;

    this.http.get(ENDPOINT).subscribe(
      (response: any) => {
        const pendingAmount = Number(response?.data?.amountToBeDeposited || 0);
        const conductorStatus = response?.data?.conductorStatus;
        this.isPendingAmountCheckLoading = false;
        callback(pendingAmount, conductorStatus);
      },
      () => {
        this.isPendingAmountCheckLoading = false;
        this.toastr.error(
          'Unable to verify conductor pending amount',
          'Warning',
        );
      },
    );
  }

  private validateConductorPendingAmountBeforeTrip(
    onAllowed: () => void,
  ): void {
    const conductorId = this.selectedData?.conductor_actual_id;

    if (!conductorId) {
      this.toastr.warning('Conductor is not allotted', 'Warning');
      return;
    }

    this.fetchPendingAmountForConductor(
      conductorId,
      (pendingAmount, conductorStatus) => {
        if (
          pendingAmount > this.conductorBlockPendingAmount ||
          this.isBlockedConductor(conductorStatus)
        ) {
          this.toastr.error(
            conductorStatus === 'Block'
              ? 'Conductor is manually blocked.'
              : `Conductor pending amount is more than ${this.conductorBlockPendingAmount}. Conductor is blocked until the bill is paid.`,
            'Conductor Blocked',
          );
          this.getBuses();
          return;
        }

        if (pendingAmount > this.conductorWarningPendingAmount) {
          this.warningPendingAmount = pendingAmount;
          this.pendingTripProceedAction = onAllowed;
          this.closeModalAndCleanup('#addDetailsModal');
          setTimeout(() => {
            this.openPendingAmountWarningModal();
          }, 150);
          return;
        }

        onAllowed();
      },
    );
  }

  private openPendingAmountWarningModal(): void {
    $('#pendingAmountWarningModal').modal('show');
  }

  closePendingAmountWarningModal(): void {
    this.pendingTripProceedAction = null;
    this.closeModalAndCleanup('#pendingAmountWarningModal');
  }

  proceedAfterPendingAmountWarning(): void {
    const proceedAction = this.pendingTripProceedAction;
    this.pendingTripProceedAction = null;
    this.closeModalAndCleanup('#pendingAmountWarningModal');

    if (proceedAction) {
      setTimeout(() => {
        proceedAction();
      }, 150);
    }
  }

  isBlockedConductor(status: string | undefined): boolean {
    return status === 'Block' || status === 'PendingBlock';
  }

  private closeModalAndCleanup(modalSelector: string): void {
    $(modalSelector).modal('hide');
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    document
      .querySelectorAll('.modal-backdrop')
      .forEach((backdrop) => backdrop.remove());
  }

  toggleDetails(busId: number): void {
    this.expandedBusId = this.expandedBusId === busId ? null : busId;
  }

  getStatus(data: any): string {
    const today = new Date().toISOString().split('T')[0];

    const updateDate = data.dailyUpdateDate
      ? new Date(data.dailyUpdateDate).toISOString().split('T')[0]
      : null;

    // console.log("status ", data.currentStatus, data.previousStatus, updateDate, today);

    // ✅ Case 1:
    if (
      // today === updateDate &&
      data.startDate <= this.dateForStatus &&
      !data.currentStatus &&
      data.previousStatus === 'running'
    ) {
      return 'running';
    }

    // ✅ Case 2:
    if (!data.currentStatus) {
      return 'idle';
    }

    // ✅ Default:
    return data.currentStatus;
  }

  downloadRecord = (): void => {
    if (!this.busList || this.busList.length === 0) {
      this.toastr.warning('No records available to download', 'Warning');
      return;
    }

    const exportData = this.busList.map((bus: any, index: number) => ({
      'Sr. No.': index + 1,
      'Vehicle Name': bus.busName || '',
      'Vehicle No': bus.busNo || '',

      'Driver ID': bus.driverId || bus.driver_actual_id || '',
      'Driver Name': bus.driverName || '',
      'Driver Contact': bus.driverContactNo || '',

      'Conductor ID': bus.conductorId || bus.conductor_actual_id || '',
      'Conductor Name': bus.conductorName || '',
      'Conductor Contact': bus.conductorContactNo || '',

      Depot: bus.routeDepot || '',
      Route: bus.routeNo || bus.allotedRouteNo || '',
      Status: this.getStatus(bus) || '',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    // Optional: Set column widths
    worksheet['!cols'] = [
      { wch: 10 }, // Sr. No.
      { wch: 20 }, // Vehicle Name
      { wch: 18 }, // Vehicle No
      { wch: 12 }, // Driver ID
      { wch: 25 }, // Driver Name
      { wch: 18 }, // Driver Contact
      { wch: 14 }, // Conductor ID
      { wch: 25 }, // Conductor Name
      { wch: 20 }, // Conductor Contact
      { wch: 15 }, // Route
      { wch: 20 }, // Depot
      { wch: 15 }, // Status
    ];

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Vehicle Records': worksheet },
      SheetNames: ['Vehicle Records'],
    };

    XLSX.writeFile(workbook, `vehicle_records_${this.dataForDate}.xlsx`);

    this.toastr.success('Records downloaded successfully', 'Success');
  };
}

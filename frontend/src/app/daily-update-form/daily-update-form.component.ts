import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import html2pdf from 'html2pdf.js';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-daily-update-form',
  templateUrl: './daily-update-form.component.html',
  styleUrls: ['./daily-update-form.component.css'],
})
export class DailyUpdateFormComponent {
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  private apiUrl = 'https://worldtimeapi.org/api/timezone/Asia/Kolkata';
  currentTinme: string | null = null;

  public isLodaing: boolean = true;

  // currentStatus: string | null = null;
  busId: string | null = null;
  busDetails: any = {};
  selectedDate: string | null = null;
  form: any = {
    omr: 0,
    cmr: 0,
    totalOperated: 0,
    osoc: 0,
    csoc: 0,
    consumedSOC: 0,
    targetedTrip: 6,
    noOfTrip: 0,
    routeNo: '',

    routeStart: '',
    routeEnd: '',
    routeVia: '',
    routeDepot: '',
    routeDistance: '',

    challanDeposited: 0,
    walletCard: 0,
    mobilePass: 0,
    studentMpass: 0,
    scanPay: 0,
    unprintedTiciket: 0,
    cardRecharge: 0,
    phonePe: 0,
    basisthaParking: 0,
    tripAllowance: 0,
    tragetedEarning: 6500,
    amountToBeDeposited: 6500,
    currentStatus: '',
  };

  routeNo: any;
  triptId: any;
  formtype: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.busId = params['busId'];
      this.selectedDate = params['date'];
      this.form.currentStatus = params['currentStatus'];
      this.form.noOfTrip = params['noOfTrip'];
      this.triptId = params['triptId'];
      this.formtype = params['type'];

      if (this.triptId) {
        console.log('update');

        this.tripDetails(this.triptId);
      } else {
        console.log('create');
        this.getBusDetails(params['busId']);
      }
    });
  }

  spiner() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 5000);
  }

  tripDetails = (triptId: any) => {
    // getBusData

    const ENDPOINT = `${environment.BASE_URL}/api/getOneTripDetails`;

    this.http.post(ENDPOINT, { id: triptId }).subscribe(
      (response: any) => {
        console.log('tripDetails ==>> ', response[0]);
        let data = response[0];
        data.currentStatus = 'finished';
        console.log('getOneTripDetails ==>> ', data);

        this.form = data;

        let busDetails = {
          busName: data.busName,
          busNo: data.busNo,
          driverName: data.driverName,
          driver_id: data.driver_id,
          driverContactNo: data.driverContactNo,
          conductorName: data.conductorName,
          conductor_id: data.conductor_id,
          conductorContactNo: data.conductorContactNo,
          baseDepot: data.baseDepot,

        };
        this.busDetails = busDetails;
        this.routeNo = data.routeNo;

        // this.form.currentStatus = 'finished'

        // this.form.busId = this.busId;
        // this.form.date = this.selectedDate;
        // this.form.routeNo = response.allotedRouteNo
        // this.form.depot = response.depotName;
        // this.routeName = response.routeName;
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
      },
      () => {
        console.log('Observable is now completed.');
      }
    );
  };

  getBusDetails = (busId: any) => {
    // getBusData

    const ENDPOINT = `${environment.BASE_URL}/api/getBusData`;

    this.http.post(ENDPOINT, { busId }).subscribe(
      (response: any) => {
        console.log('response ==>> ', response);
        // this.busList = response;
        this.busDetails = response;
        this.form.busId = this.busId;
        this.form.date = this.selectedDate;
        this.form.routeNo = response.allotedRouteNo;
        this.form.depot = response.depotName;
        this.form.driverId = response.driverId;
        this.form.conductorId = response.conductorId;
        this.form.routeNo = response.routeNo;
        this.form.routeDepot = response.routeDepot;
        this.form.routeStart = response.routeStart;
        this.form.routeEnd = response.routeEnd;
        this.form.routeVia = response.routeVia;
        this.form.routeDistance = response.routeDistance;
        this.form.omr = response.lastCmr;
        this.form.osoc = 100;
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
      },
      () => {
        console.log('Observable is now completed.');
      }
    );
  };

  saveData = () => {
    const ENDPOINT = `${environment.BASE_URL}/api/saveDailyUpdates`;
    const requestOptions = {
      requestObject: this.form,
    };
    console.log('mmmmmmmmmmm', requestOptions);
    this.http.post(ENDPOINT, requestOptions).subscribe(
      (response) => {
        console.log('response ', response);
        // this.getBuses();
        // this.form = { ...this.originalForm };

        this.router.navigate(['/buses']);

        this.toastr.success('Added Successfully', 'Success');
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
      },
      () => {
        console.log('Observable is now completed.');
      }
    );
  };

  updateData = () => {
    const ENDPOINT = `${environment.BASE_URL}/api/updateDailyUpdates`;
    const requestOptions = {
      requestObject: this.form,
      id: this.triptId,
    };
    console.log('mmmmmmmmmmm', requestOptions);
    this.http.post(ENDPOINT, requestOptions).subscribe(
      (response) => {
        console.log('response ', response);
        // this.getBuses();
        // this.form = { ...this.originalForm };

        this.router.navigate(['/buses']);

        this.toastr.success('Added Successfully', 'Success');
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
      },
      () => {
        console.log('Observable is now completed.');
      }
    );
  };

  calculateTotalOperated = () => {
    // console.log("data", this.form.cmr - this.form.omr);
    let data = this.form.cmr - this.form.omr;
    this.form.totalOperated = data > 0 ? data : 0;
  };
  calculateTotalCosumed = () => {
    // console.log("data", this.form.cmr - this.form.omr);
    let data = this.form.osoc - this.form.csoc;
    this.form.consumedSOC = this.form.csoc == 0 ? 0 : data > 0 ? data : 0;
  };

  calculateAmount = () => {
    console.log('here');
    // this.form.netAmountDeposited = this.form.challanDeposited+this.form.walletCard+this.form.mobilePass+this.form.studentMpass+this.form.scanPay+this.form.unprintedTiciket+this.form.cardRecharge+this.form.phonePe-this.form.basisthaParking-this.form.tripAllowance;

    this.form.netAmountDeposited =
      (parseInt(this.form.challanDeposited) || 0) +
      (parseInt(this.form.walletCard) || 0) +
      (parseInt(this.form.mobilePass) || 0) +
      (parseInt(this.form.studentMpass) || 0) +
      (parseInt(this.form.scanPay) || 0) +
      (parseInt(this.form.unprintedTiciket) || 0) +
      (parseInt(this.form.cardRecharge) || 0) +
      (parseInt(this.form.phonePe) || 0) -
      (parseInt(this.form.basisthaParking) || 0) -
      (parseInt(this.form.tripAllowance) || 0);

    this.calculateDiposite();
  };

  calculateDiposite = () => {
    const target = parseInt(this.form.tragetedEarning, 10) || 0;
    const deposited = parseInt(this.form.netAmountDeposited, 10) || 0;
  
    this.form.amountToBeDeposited = Math.max(0, target - deposited);
  };
  

  showPreview = false;

  openPreview() {
    this.isLodaing = true;
    this.spiner();
    this.getCurrentISTTime();
    this.showPreview = true;
    this.isLodaing = false;
  }

  downloadPdf() {
    if (!this.form.omr || this.form.omr === 0 || !this.form.osoc || this.form.osoc === 0) {
      this.toastr.warning('OMR and SOC values must be greater than 0', 'Warning');
      return;
    }

    const element: any = document.getElementById('printA4');

    html2pdf()
      .set({
        margin: [4, 4, 4, 4],
        filename:
          'Bus Earning Log ' +
          this.busDetails.busNo +
          ' / ' +
          this.selectedDate +
          '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1.2,   
          dpi: 144,
          scrollY: 0,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
      })
      .from(element)
      .save();
  }

  get currentTime() {
    return new Date().toLocaleTimeString();
  }

  getCurrentISTTime = () => {
    const ENDPOINT = `${environment.BASE_URL}/api/getCurrentISTTime`;

    this.http.get(ENDPOINT).subscribe(
      (response: any) => {
        console.log('IST response ==>> ', response);

        this.currentTinme = response.timestamp;
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Failed to fetch IST time!', 'Warning');
      },
      () => {
        console.log('IST Observable is now completed.');
      }
    );
  };
}

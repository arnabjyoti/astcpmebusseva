import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import html2pdf from 'html2pdf.js';

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
    private router: Router
  ) {}

  busId: string | null = null;
  busDetails : any = {};
  selectedDate: string | null = null;
  form: any = {
    omr: 0,
    cmr: 0,
    totalOperated : 0,
    routeNo: "",

    challanDeposited:0,
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

  };

  routeName:any;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.busId = params['busId'];
      this.selectedDate = params['date'];

     

      this.getBusDetails(params['busId']);
    });
  }

  getBusDetails = (busId: any) => {
    // getBusData

    const ENDPOINT = `${environment.BASE_URL}/api/getBusData`;

    this.http.post(ENDPOINT, { busId }).subscribe(
      (response:any) => {
        console.log('response ==>> ', response);
        // this.busList = response;
        this.busDetails = response;
        this.form.busId = this.busId;
        this.form.date = this.selectedDate;
        this.form.routeNo = response.allotedRouteNo;
        this.routeName = response.routeName;
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
        console.log("response ", response);
        // this.getBuses();
        // this.form = { ...this.originalForm };


        this.router.navigate(['/buses']);


        this.toastr.success("Added Successfully", "Success");
      },
      (error) => {
        console.log("error here ", error);
        this.toastr.error("Something went wrong !", "Warning");
        
      },
      () => {
        console.log('Observable is now completed.');
      }
    );
  };

  calculateTotalOperated=()=>{
    // console.log("data", this.form.cmr - this.form.omr);
    this.form.totalOperated = this.form.cmr - this.form.omr
  }

  calculateAmount=()=>{
    console.log("here");
    this.form.netAmountDeposited = this.form.challanDeposited+this.form.walletCard+this.form.mobilePass+this.form.studentMpass+this.form.scanPay+this.form.unprintedTiciket+this.form.cardRecharge+this.form.phonePe-this.form.basisthaParking-this.form.tripAllowance;

    this.calculateDiposite();
  }

  calculateDiposite=()=>{
    this.form.amountToBeDeposited = this.form.tragetedEarning - this.form.netAmountDeposited
  }


showPreview = false;

openPreview() {
  this.showPreview = true;
}

  downloadPdf() {
  const element:any = document.getElementById('printA4');

  html2pdf().set({
    margin: 0,
    filename: 'Bus Earning Log ' + this.busDetails.busNo + ' / ' + this.selectedDate + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      scrollY: 0
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  }).from(element).save();
}

get currentTime() {
  return new Date().toLocaleTimeString();
}
}

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import html2pdf from 'html2pdf.js';
import { NgxSpinnerService } from 'ngx-spinner';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  ) { }

  private apiUrl = 'https://worldtimeapi.org/api/timezone/Asia/Kolkata';
  currentTinme: string | null = null;

  public isLodaing: boolean = true;

  public isSaving = false;

  // currentStatus: string | null = null;
  busId: string | null = null;
  busDetails: any = {};
  selectedDate: string | null = null;
  form: any = {
    timesheetNo: '',
    omr: 0,
    cmr: 0,
    totalOperated: 0,
    osoc: 0,
    csoc: 0,
    consumedSOC: 0,
    targetedTrip: 6,
    noOfTrip: 0,
    routeNo: '',

    startTime: '',

    routeStart: '',
    routeEnd: '',
    routeVia: '',
    routeDepot: '',
    routeDistance: '',

    chaloWayBillNo: 0,
    chaloTicketNo: 0,
    chaloPassengersNo: 0,
    chaloTicketAmount: 0,
    cashCollection: 0,
    upi: 0,

    estimated_collection: 0,
    tragetedEarning: 0,
    amountToBeDeposited: 0,
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
        this.form.tragetedEarning = data.estimated_collection;
        this.form.routeDepot = data.depot;
        this.form.routeStart = data.start;
        this.form.routeEnd = data.end;
        this.form.driverId = data.driverId;
        this.form.conductorId = data.conductorId;

        this.form.conductor_actual_id = data.conductor_actual_id,
        this.form.driver_actual_id = data.driver_actual_id
        console.log('data ==>> ', data.driverId);
        

        let busDetails = {
          busName: data.busName,
          busNo: data.busNo,
          driverName: data.driverName,
          driverId: data.driverId,
          driverContactNo: data.driverContactNo,
          conductorName: data.conductorName,
          conductorId: data.conductorId,
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
        console.log('getBusData ==>> ', response);
        // this.busList = response;
        this.form.timesheetNo = response.timesheetNo;
        this.busDetails = response;
        this.form.busId = this.busId;
        this.form.date = this.selectedDate;
        this.form.routeNo = response.allotedRouteNo;
        this.form.depot = response.depotName;
        this.form.driverId = response.driver_actual_id;
        this.form.conductorId = response.conductor_actual_id;
        this.form.routeNo = response.routeNo;
        this.form.estimated_collection = response.estimated_collection;
        this.form.tragetedEarning = response.estimated_collection;
        // this.form.amountToBeDeposited = response.estimated_collection;
        this.form.routeDepot = response.routeDepot;
        this.form.routeStart = response.routeStart;
        this.form.routeEnd = response.routeEnd;
        this.form.routeVia = response.routeVia;
        this.form.routeDistance = response.routeDistance;
        this.form.omr = response.lastCmr;
        this.form.routeName = response.routeName;
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

  saveData = async () => {

  if (this.isSaving) return; // 🚫 prevent double click

  if (this.form.startTime != 0 && this.form.omr != 0 && this.form.osoc != 0) {

    this.isSaving = true; // ✅ start loader + disable button

    const ENDPOINT = `${environment.BASE_URL}/api/saveDailyUpdates`;

    const requestOptions = {
      requestObject: this.form,
    };

    console.log("dataaaaa",requestOptions);
    

    this.http.post<any>(ENDPOINT, requestOptions).subscribe(
      async (response) => {

        this.form.timesheetNo = response.timesheetNo;

        this.showPreview = true;
        await this.waitForElement('printA4');
        await this.downloadPdf();
        this.showPreview = false;

        this.router.navigate(['/buses']);
        this.toastr.success('Added Successfully', 'Success');

        this.isSaving = false; // ✅ stop loader
      },
      (error) => {
        this.toastr.error('Something went wrong!', 'Warning');
        this.isSaving = false; // ✅ stop loader on error
      }
    );

  } else {
    this.toastr.warning('Please fill all required fields', 'Warning');
  }
};


  waitForElement(id: string): Promise<HTMLElement> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const el = document.getElementById(id);
        if (el) {
          clearInterval(interval);
          resolve(el);
        }
      }, 50);
    });
  }


  updateData = () => {
    const ENDPOINT = `${environment.BASE_URL}/api/updateDailyUpdates`;

    this.form.conductorId = this.form.conductor_actual_id;
    this.form.driverId = this.form.driver_actual_id;

    const requestOptions = {
      requestObject: this.form,
      id: this.triptId,
    };
    console.log('mmmmmmmmmmm', requestOptions);

    // return;
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
      // (parseInt(this.form.chaloTicketAmount) || 0) +
      (parseInt(this.form.cashCollection) || 0) +
      (parseInt(this.form.upi) || 0);

    this.calculateDiposite();
  };

  calculateDiposite = () => {
    const target = parseInt(this.form.estimated_collection, 10) || 0;
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

  downloadPdf(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const element: any = document.getElementById('printA4');

        console.log('Element found:', element);

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
          .save()
          .then(() => {
            resolve();   // ✅ PDF finished downloading
          })
          .catch((err: any) => {
            reject(err);
          });

      } catch (err) {
        reject(err);
      }
    });
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











  downloadPdfText(timesheetNo: string) {
    const doc = new jsPDF('p', 'mm', 'a4');

    let y = 10;

    // ===== Logos =====
    const logoLeft = new Image();
    logoLeft.src = '../../../assets/image/login/astc.png'; // left logo

    const logoRight = new Image();
    logoRight.src = '../../../assets/image/logo.png'; // right logo

    // wait for images to load
    logoLeft.onload = () => {
      doc.addImage(logoLeft, 'PNG', 10, y, 30, 30); // left

      logoRight.onload = () => {
        doc.addImage(logoRight, 'PNG', 170, y, 30, 30); // right
        addHeaderAndTables();
      };
    };

    // ===== Function to continue PDF after logos loaded =====
    const addHeaderAndTables = () => {
      y += 10;

      // Header title
      doc.setFontSize(14);
      doc.text('VEHICLE LOG SHEET', 105, y, { align: 'center' });

      // Timesheet No
      doc.setFontSize(10);
      doc.text(`Timesheet No: ${timesheetNo}`, 105, y + 6, { align: 'center' });

      y += 14;

      // Depot and Date
      doc.setFontSize(10);
      doc.text(`Depot: ${this.form.routeDepot}`, 10, y);
      doc.text(`Date: ${this.selectedDate}`, 150, y);
      y += 6;

      // Bus and Route
      doc.text(`Bus No: ${this.busDetails.busNo}`, 10, y);
      doc.text(`Route No: ${this.form.routeNo}`, 150, y);
      y += 8;

      // ===== Driver / Conductor =====
      autoTable(doc, {
        startY: y,
        head: [[
          'Driver ID', 'Driver Name', 'Driver Phone',
          'Conductor ID', 'Conductor Name', 'Conductor Phone'
        ]],
        body: [[
          this.busDetails.driverId,
          this.busDetails.driverName,
          this.busDetails.driverContactNo,
          this.busDetails.conductorId,
          this.busDetails.conductorName,
          this.busDetails.conductorContactNo
        ]]
      });

      y = (doc as any).lastAutoTable.finalY + 6;

      // ===== SOC & Meter =====
      autoTable(doc, {
        startY: y,
        head: [[
          'Place', 'Opening SOC', 'Closing SOC', 'Consumed SOC',
          'Opening KM', 'Closing KM', 'Covered KM'
        ]],
        body: [[
          this.form.routeDepot,
          this.form.osoc,
          '',
          '',
          this.form.omr,
          '',
          ''
        ]]
      });

      y = (doc as any).lastAutoTable.finalY + 6;

      // ===== Route Trip =====
      autoTable(doc, {
        startY: y,
        head: [['Route No', 'Trip', 'From', 'To']],
        body: [
          [this.form.routeNo, '1', this.form.routeDepot, this.form.routeStart],
          [this.form.routeNo, '2', this.form.routeStart, this.form.routeEnd],
          [this.form.routeNo, '3', this.form.routeEnd, this.form.routeStart],
          [this.form.routeNo, '4', this.form.routeStart, this.form.routeEnd],
        ]
      });

      y = (doc as any).lastAutoTable.finalY + 6;

      // ===== Earnings =====
      autoTable(doc, {
        startY: y,
        head: [[
          'Way Bill', 'Ticket Count', 'Pass Count',
          'Ticket Amt', 'PhonePe', 'Cash', 'Wallet'
        ]],
        body: [['', '', '', '', '', '', '']]
      });

      y = (doc as any).lastAutoTable.finalY + 10;

      // ===== Signatures =====
      doc.text('Cashier Signature', 20, y);
      doc.text('Auditor Signature', 90, y);
      doc.text('Operation Manager Signature', 150, y);

      // ===== Save PDF =====
      doc.save(`Bus_Earning_Log_${this.busDetails.busNo}_${this.selectedDate}.pdf`);
    };
  }









  // later will use it


  // Helper function to load image and return a Promise
  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => reject(`Image not found: ${src}`);
    });
  }

  async downloadPdfFull(timesheetNo: string) {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 10;

    // ===== Load logos =====
    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Image not found: ${src}`);
      });

    try {
      const logoLeft = await loadImage('../../../assets/image/login/astc.png');
      const logoRight = await loadImage('../../../assets/image/logo.png');

      doc.addImage(logoLeft, 'PNG', 10, y, 30, 30);
      doc.addImage(logoRight, 'PNG', 170, y, 30, 30);
    } catch (err) {
      console.warn(err);
    }

    y += 10;

    // ===== Header =====
    doc.setFontSize(14);
    doc.text('VEHICLE LOG SHEET', 105, y, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Timesheet No: ${timesheetNo}`, 105, y + 6, { align: 'center' });
    y += 14;

    // ===== Log Sheet Info =====
    autoTable(doc, {
      startY: y,
      head: [['LOG SHEET NO', timesheetNo]],
      theme: 'grid',
      styles: { fontSize: 9, halign: 'center' },
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    autoTable(doc, {
      startY: y,
      head: [[
        'Depot Name', 'Date', 'Veh No', 'Alloted Route No', 'Alloted Route Name', 'Time of Departure from Depot'
      ]],
      body: [[
        this.form.routeDepot,
        this.selectedDate,
        this.busDetails.busNo,
        this.form.routeNo,
        this.form.routeName,
        ''
      ]],
      theme: 'grid',
      styles: { fontSize: 9 }
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // ===== Driver / Conductor =====
    autoTable(doc, {
      startY: y,
      head: [[
        'Driver ID', 'Driver Name', 'Driver Ph No', 'Conductor ID', 'Conductor Name', 'Conductor Ph No'
      ]],
      body: [[
        this.busDetails.driverId,
        this.busDetails.driverName,
        this.busDetails.driverContactNo,
        this.busDetails.conductorId,
        this.busDetails.conductorName,
        this.busDetails.conductorContactNo
      ]],
      theme: 'grid',
      styles: { fontSize: 9 }
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // ===== State of Charge & Meter Reading =====
    autoTable(doc, {
      startY: y,
      head: [['Place', 'Opening SOC', 'Closing SOC', 'Consumed SOC', 'Opening KM', 'Closing KM', 'Covered KM']],
      body: [[
        this.form.routeDepot,
        this.form.osoc,
        '',
        '',
        this.form.omr,
        '',
        ''
      ]],
      theme: 'grid',
      styles: { fontSize: 9, halign: 'center' }
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // ===== Route Trip Particulars (8 trips) =====
    const routeBody = [];
    for (let i = 1; i <= 8; i++) {
      let from = i % 2 === 0 ? this.form.routeStart : this.form.routeEnd;
      let to = i % 2 === 0 ? this.form.routeEnd : this.form.routeStart;
      if (i === 8) { from = this.form.routeStart; to = this.form.routeDepot; }

      routeBody.push([this.form.routeNo, i, from, to, '', '', '']);
    }

    autoTable(doc, {
      startY: y,
      head: [['Route No', 'Trip', 'From', 'To', 'Arrival Time', 'Departure Time', 'Booking Asst Signature']],
      body: routeBody,
      theme: 'grid',
      styles: { fontSize: 9 }
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // ===== Earnings Table =====
    autoTable(doc, {
      startY: y,
      head: [[
        'Chalo Way Bill No', 'Chalo Ticket Count', 'Total Pass Count', 'Chalo Ticket Amount',
        'Phone Pe', 'Cash Collection', 'Wallet Card', 'Card Recharge', 'Mobile Pass',
        'Additional Amount Deposited', 'Total Amount Deposited'
      ]],
      body: [['', '', '', '', '', '', '', '', '', '', '']],
      theme: 'grid',
      styles: { fontSize: 9 }
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // ===== Total Deductions =====
    autoTable(doc, {
      startY: y,
      head: [[
        'Trip Allowance', 'GMC Parking', 'Total Deduction', 'Net Amount Deposited After Deductions', 'Fixed Target', 'Balance'
      ]],
      body: [['', '', '', '', 7000, '']],
      theme: 'grid',
      styles: { fontSize: 9 }
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // ===== Remarks =====
    autoTable(doc, {
      startY: y,
      head: [['REMARKS']],
      body: [['']],
      theme: 'grid',
      styles: { fontSize: 9, minCellHeight: 15 }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // ===== Signatures =====
    doc.setFontSize(9);
    doc.text('SIGNATURE OF THE CASHIER\nPM e-bus sewa\nRupnagar, Guwahati-32', 10, y);
    doc.text('SIGNATURE OF THE AUDITOR\nPM e-bus sewa\nRupnagar, Guwahati-32', 70, y);
    doc.text('SIGNATURE OF THE OPERATION MANAGER\nPM e-bus sewa\nRupnagar, Guwahati-32', 140, y);

    // ===== Save PDF =====
    doc.save(`Bus_Earning_Log_${this.busDetails.busNo}_${this.selectedDate}.pdf`);
  }


  formatTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  



}

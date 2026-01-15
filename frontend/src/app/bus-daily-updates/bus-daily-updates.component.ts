import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-bus-daily-updates',
  templateUrl: './bus-daily-updates.component.html',
  styleUrls: ['./bus-daily-updates.component.css'],
})
export class BusDailyUpdatesComponent {
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  date: any= new Date().toISOString().split("T")[0];

  dateFrom : any = new Date().toISOString().split("T")[0];
  dateTo: any = new Date().toISOString().split("T")[0];

  dataList:any;

  form: any = {
    driverName: '',
    conductorName: '',
    tripStartTime: '',
    busNo: '',
    allottedRouteNo: '',
    destinationRoute: '',
    batteryStart: '',
    batteryEnd: '',
    electricChargeUnitConsumption: '',
    tyrePressure: '',
    noOfTrips: '',
    cashCollection: '',
    kpi: '',
    accountCashTally: '',
  };

  selectedData: any = null;



  ngOnInit(): void {
    
    this.search()
    
  }



  viewData(index: number) {
    this.selectedData = this.dataList[index];
  }

  getDailyUpdates = (dateFrom: any, dateTo: any) => {
    // getBusData

    const ENDPOINT = `${environment.BASE_URL}/api/getDailyUpdates`;

    this.http.post(ENDPOINT, { dateFrom, dateTo }).subscribe(
      (response) => {
        console.log('response ', response);
        this.dataList = response;
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

  search = () => {
    this.getDailyUpdates(this.dateFrom, this.dateTo)
  };


  redirectTo=()=>{
    window.location.href = "/buses";

  }
  getTotalEarn=(data:any)=>{
    
     return data
        .map((item: string | number) => Number(item)) // Ensure conversion to number
        .reduce((acc: number, val: number) => acc + val, 0) // Ensure proper summation
    
  }


    // Method to download CSV
    downloadCSV(): void {
      const table = document.getElementById('dataTable') as HTMLTableElement;
      const rows = Array.from(table.rows);
      
      // Extract the header row
      const headerRow = rows[0].cells;
      const headers = Array.from(headerRow).map(cell => cell.innerText);
  
      // Extract the data rows
      const dataRows = rows.slice(1);
      const data = dataRows.map(row => {
        const cells = Array.from(row.cells);
        return cells.map(cell => cell.innerText).join(',');
      });
  
      // Combine header and data rows
      const csvContent = [headers.join(','), ...data].join('\n');
  
      // Create a Blob and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'table-data.csv';  // You can set the desired file name
      link.click();
    }

    toBeDeletedRecord:any = {};
  openDeleteConfirmationDialog=(data:any)=>{
    this.toBeDeletedRecord = data;
    console.log(this.toBeDeletedRecord);
  }

  handleDeleteEarningDetails =()=>{
    if(this.toBeDeletedRecord.id!=''){
      const ENDPOINT = `${environment.BASE_URL}/api/deleteEarningDetails`;
      const requestOptions = {
        requestObject: this.toBeDeletedRecord,
      };
      this.http.post(ENDPOINT, requestOptions).subscribe(
        (response) => {
          this.getDailyUpdates(this.dateFrom, this.dateTo);
          this.toastr.success("Earning details record deleted successfully", "Success Message");
        },
        (error) => {
          console.log("error here ", error);
          this.toastr.error("Something went wrong !", "Warning");
        },
        () => {
          console.log('Observable is now completed.');
        }
      );
    }else{
      this.toastr.warning("Something went wrong! Please try again", "Warning Message");
    }
  }






}

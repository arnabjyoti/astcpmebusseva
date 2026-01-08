import { Component } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'underscore';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from "ngx-toastr";
import { Router } from '@angular/router';

@Component({
  selector: 'app-buses',
  templateUrl: './buses.component.html',
  styleUrls: ['./buses.component.css']
})
export class BusesComponent {
  constructor(
    private appService: AppService, 
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
    ) {}
 


  form: any ={
    busName: '',
    busNo: '',
    driverName:'',
    driverContactNo:'',
    conductorName:'',
    conductorContactNo:'',
    baseDepot: '',
    allotedRouteNo: ''
  }

  busList : any;
  driverList: any;
  conductorList: any;
  routeList:any;

  ngOnInit(): void {
    
    this.getBuses();
    this.getDriver();
    this.getConductor();
    this.getBusRoutes();
    
  }


  saveData=()=>{
    const ENDPOINT = `${environment.BASE_URL}/api/createBus`;
    let selectedDriverDetails = this.driverList.find((ele:any) => {return ele.id === parseInt(this.form?.driverName)});
    let selectedConductorDetails = this.conductorList.find((ele:any) => {return ele.id === parseInt(this.form?.conductorName)});

    this.form.driverName = selectedDriverDetails.driver_name;
    this.form.conductorName = selectedConductorDetails.conductor_name;
    const requestOptions = {
      requestObject: this.form,
    };
    this.http.post(ENDPOINT, requestOptions).subscribe(
      (response) => {
        console.log("response ", response);
        this.getBuses();
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
  }

  updateData=()=>{
    const ENDPOINT = `${environment.BASE_URL}/api/updateBus`;
    let selectedDriverDetails = this.driverList.find((ele:any) => {return ele.id === parseInt(this.form?.driverName)});
    let selectedConductorDetails = this.conductorList.find((ele:any) => {return ele.id === parseInt(this.form?.conductorName)});

    this.form.driverName = selectedDriverDetails.driver_name;
    this.form.conductorName = selectedConductorDetails.conductor_name;
    const requestOptions = {
      requestObject: this.form
    };
    
    this.http.post(ENDPOINT, requestOptions).subscribe(
      (response) => {
        console.log("response ", response);
        this.getBuses();
        this.toastr.success("Updated Successfully", "Success");
      },
      (error) => {
        console.log("error here ", error);
        this.toastr.error("Something went wrong !", "Warning");
        
      },
      () => {
        console.log('Observable is now completed.');
      }
    );
  }


  getBuses=()=>{
    const ENDPOINT = `${environment.BASE_URL}/api/getBusList`;
    
    this.http.get(ENDPOINT).subscribe(
      (response) => {
        console.log("response ", response);
        this.busList = response;

      },
      (error) => {
        console.log("error here ", error);
        this.toastr.error("Something went wrong !", "Warning");
        
      },
      () => {
        console.log('Observable is now completed.');
      }
    );
  }


  
  getDriver=()=>{
    const ENDPOINT = `${environment.BASE_URL}/api/getDriver`;
    
    this.http.get(ENDPOINT).subscribe(
      (response) => {
        console.log("response ", response);
        this.driverList = response;

      },
      (error) => {
        console.log("error here ", error);
        this.toastr.error("Something went wrong !", "Warning");
        
      },
      () => {
        console.log('Observable is now completed.');
      }
    );
  }

  getConductor=()=>{
    const ENDPOINT = `${environment.BASE_URL}/api/getConductor`;
    
    this.http.get(ENDPOINT).subscribe(
      (response) => {
        console.log("response ", response);
        this.conductorList = response;

      },
      (error) => {
        console.log("error here ", error);
        this.toastr.error("Something went wrong !", "Warning");
        
      },
      () => {
        console.log('Observable is now completed.');
      }
    );
  }


  getBusRoutes=()=>{
    const ENDPOINT = `${environment.BASE_URL}/api/getBusRoutes`;
    
    this.http.get(ENDPOINT).subscribe(
      (response) => {
        console.log("response ", response);
        this.routeList = response;

      },
      (error) => {
        console.log("error here ", error);
        this.toastr.error("Something went wrong !", "Warning");
        
      },
      () => {
        console.log('Observable is now completed.');
      }
    );
  }


  selectedConductorId: any;
  manageDrive=()=>{
    const selectedDriverId = parseInt((<HTMLSelectElement>document.querySelector('[name="driverName"]')).value);
    let selectedDriverDetails = this.driverList.find((driver: { id: number; }) => driver.id === selectedDriverId);
    // this.form.driverName = selectedDriverDetails.driver_name;
    this.form.driverContactNo = selectedDriverDetails.contact_no;
  }
  manageConductor=()=>{
    const selectedDriverId = parseInt((<HTMLSelectElement>document.querySelector('[name="conductorName"]')).value);
    let selectedDetails = this.conductorList.find((driver: { id: number; }) => driver.id === selectedDriverId);
    // this.form.conductorName = selectedDetails.conductor_name;
    this.form.conductorContactNo = selectedDetails.contact_no;
  }





  selectedData:any;
  viewData=(id:any)=>{
    this.selectedData =this.busList[id];
    console.log(this.busList[id]);
    
  }

  toBeDeletedRecord:any = {};
  openConfirmationDialog=(data:any)=>{
    this.toBeDeletedRecord = data;
  }

  handleDeleteBus =()=>{
    if(this.toBeDeletedRecord.id!=''){
      const ENDPOINT = `${environment.BASE_URL}/api/deleteBus`;
      const requestOptions = {
        requestObject: this.toBeDeletedRecord,
      };
      this.http.post(ENDPOINT, requestOptions).subscribe(
        (response) => {
          this.getBuses();
          this.toastr.success("Bus deleted successfully", "Success Message");
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
      this.toastr.warning("Please enter data properly before proceed", "Warning Message");
    }
  }

  isEdit:boolean = false;
  openNewDialog=()=>{
    this.isEdit = false;
    this.form ={
      id: '',
      busName: '',
      busNo: '',
      driverName: '',
      driverContactNo: '',
      conductorName:'',
      conductorContactNo:'',
      baseDepot: '',
      allotedRouteNo: ''
    }
  }

  openEditDialog=(data:any)=>{
    this.isEdit = true;
    let selectedDriverDetails = this.driverList.find((ele:any) => ele.driver_name === data?.driverName);
    let selectedConductorDetails = this.conductorList.find((ele:any) => ele.conductor_name === data?.conductorName);
    this.form ={
      id: data?.id,
      busName: data?.busName,
      busNo: data?.busNo,
      driverName: selectedDriverDetails?.id,
      driverContactNo: data?.driverContactNo,
      conductorName:selectedConductorDetails?.id,
      conductorContactNo:data?.conductorContactNo,
      baseDepot: data?.baseDepot,
      allotedRouteNo: data?.allotedRouteNo
    }
  }


  selectedDate:any;
  redirectToAddForm() {
    const dateInput = document.querySelector('input[name="date"]') as HTMLInputElement;
    if (dateInput) {
      this.selectedDate = dateInput.value;
    }

    if (!this.selectedDate) {
      alert("Please select a date!");
      return;
    }

    this.router.navigate(['/daily-update'], {
      queryParams: { date: this.selectedDate, busId: this.selectedData.id, currentStatus:'running', noOfTrip:0 }
    });
  }

  redirectToUpdateForm(data:any) {
    const dateInput = document.querySelector('input[name="date"]') as HTMLInputElement;
    console.log("data ==> ", data);
    

    if (!data.id) {
      alert("Bus id not found!");
      return;
    }

    this.router.navigate(['/daily-update'], {
      queryParams: { busId: data.id, triptId: data.dailyUpdateId, currentStatus:'finished', type:'update' }
    });
  }
}

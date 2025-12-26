import { Component } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'underscore';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from "ngx-toastr";
import { Router } from '@angular/router';

@Component({
  selector: 'app-bus-routes',
  templateUrl: './bus-routes.component.html',
  styleUrls: ['./bus-routes.component.css']
})
export class BusRoutesComponent {
  constructor(
    private appService: AppService, 
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
    ) {}

  busRoutesList : any;
  busRoutes:any={
    routeName:'',
    routeNo:'',
    status:'Active'
  }
  ngOnInit(): void {
    this.getBusRoutes();
  }

 
  handleSaveRoutes=()=>{
    if(this.busRoutes.routeName!='' && this.busRoutes.routeNo!=''){
      const ENDPOINT = `${environment.BASE_URL}/api/createBusRoutes`;
      const requestOptions = {
        requestObject: this.busRoutes,
      };
      this.http.post(ENDPOINT, requestOptions).subscribe(
        (response) => {
          this.getBusRoutes();
          this.toastr.success("Bus route added successfully", "Success Message");
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


  getBusRoutes=()=>{
    const ENDPOINT = `${environment.BASE_URL}/api/getBusRoutes`;
    
    this.http.get(ENDPOINT).subscribe(
      (response) => {
        console.log("response ", response);
        this.busRoutesList = response;

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
  

  isEdit:boolean = false;
  openNewRouteDialog=()=>{
    this.isEdit = false;
    this.busRoutes={
      routeName: '',
      routeNo: '',
      status:'Active'
    }
  }

  openEditDialog=(data:any)=>{
    this.isEdit = true;
    this.busRoutes={
      id: data.id,
      routeName: data.routeName,
      routeNo: data.routeNo,
      status:'Active'
    }
  }

  handleUpdateRoutes =()=>{
    if(this.busRoutes.routeName!='' && this.busRoutes.routeNo!=''){
      const ENDPOINT = `${environment.BASE_URL}/api/updateBusRoutes`;
      const requestOptions = {
        requestObject: this.busRoutes,
      };
      this.http.post(ENDPOINT, requestOptions).subscribe(
        (response) => {
          this.getBusRoutes();
          this.toastr.success("Bus route updated successfully", "Success Message");
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

  toBeDeletedRecord:any = {};
  openConfirmationDialog=(data:any)=>{
    this.toBeDeletedRecord = data;
  }

  handleDeleteRoutes =()=>{
    if(this.toBeDeletedRecord.id!='' && this.toBeDeletedRecord.routeName!='' && this.toBeDeletedRecord.routeNo!=''){
      const ENDPOINT = `${environment.BASE_URL}/api/deleteBusRoutes`;
      const requestOptions = {
        requestObject: this.toBeDeletedRecord,
      };
      this.http.post(ENDPOINT, requestOptions).subscribe(
        (response) => {
          this.getBusRoutes();
          this.toastr.success("Bus route deleted successfully", "Success Message");
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

  selectedData:any;
  viewData=(id:any)=>{
    this.selectedData =this.busRoutesList[id];
    console.log(this.busRoutesList[id]);
    
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
      queryParams: { date: this.selectedDate, busId: this.selectedData.id }
    });
  }
}

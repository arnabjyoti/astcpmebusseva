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
  ) { }

  busRoutesList: any;
  busRoutes: any = {
    id: '',
    depot: '',
    start: '',
    end: '',
    via: '',
    routeNo: '',
    routeDistance: '',
    depot_to_start_distance: '',
    end_to_depot_distance: '',
    status: 'Active'
  };

  depotSuggestions: string[] = [];
  startSuggestions: string[] = [];
  endSuggestions: string[] = [];
  viaSuggestions: string[] = [];
  routeNoSuggestions: string[] = [];


  ngOnInit(): void {
    this.getBusRoutes();
  }


  handleSaveRoutes = () => {
    if (!this.busRoutes.routeNo || !this.busRoutes.start || !this.busRoutes.end || !this.busRoutes.depot || !this.busRoutes.via || !this.busRoutes.routeDistance || !this.busRoutes.depot_to_start_distance || !this.busRoutes.end_to_depot_distance) {
      this.toastr.warning("Please fill required fields", "Warning");
      return;
    }

    const ENDPOINT = `${environment.BASE_URL}/api/createBusRoutes`;
    this.http.post(ENDPOINT, { requestObject: this.busRoutes }).subscribe(
      () => {
        this.getBusRoutes();
        this.toastr.success("Bus route added successfully");
      },
      () => this.toastr.error("Something went wrong")
    );
  };



  getBusRoutes = () => {
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

  getSuggestions(field: string) {
    const ENDPOINT = `${environment.BASE_URL}/api/getRouteSuggestions?field=${field}`;

    this.http.get<string[]>(ENDPOINT).subscribe(res => {
      if (field === 'depot') this.depotSuggestions = res;
      if (field === 'start') this.startSuggestions = res;
      if (field === 'end') this.endSuggestions = res;
      if (field === 'via') this.viaSuggestions = res;
      if (field === 'routeNo') this.routeNoSuggestions = res;
    });
  }


  isEdit: boolean = false;
  openNewRouteDialog = () => {
    this.isEdit = false;

    this.busRoutes = {
      id: '',
      depot: '',
      start: '',
      end: '',
      via: '',
      routeNo: '',
      routeDistance: '',
      depot_to_start_distance: '',
      end_to_depot_distance: '',
      status: 'Active'
    };

    this.loadAllSuggestions();
  };


  loadAllSuggestions() {
    this.getSuggestions('depot');
    this.getSuggestions('start');
    this.getSuggestions('end');
    this.getSuggestions('via');
    this.getSuggestions('routeNo');
  }



  openEditDialog = (data: any) => {
    this.isEdit = true;
    this.busRoutes = { ...data };
  };


  handleUpdateRoutes = () => {
    const ENDPOINT = `${environment.BASE_URL}/api/updateBusRoutes`;

    this.http.post(ENDPOINT, { requestObject: this.busRoutes }).subscribe(
      () => {
        this.getBusRoutes();
        this.toastr.success("Bus route updated successfully");
      },
      () => this.toastr.error("Something went wrong")
    );
  };


  toBeDeletedRecord: any = {};
  openConfirmationDialog = (data: any) => {
    this.toBeDeletedRecord = data;
  }

  handleDeleteRoutes = () => {
    if (this.toBeDeletedRecord.id != '' && this.toBeDeletedRecord.routeName != '' && this.toBeDeletedRecord.routeNo != '') {
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
    } else {
      this.toastr.warning("Please enter data properly before proceed", "Warning Message");
    }
  }

  selectedData: any;
  viewData = (id: any) => {
    this.selectedData = this.busRoutesList[id];
    console.log(this.busRoutesList[id]);

  }



  selectedDate: any;
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

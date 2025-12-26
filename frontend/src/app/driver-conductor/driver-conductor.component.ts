import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../app.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-driver-conductor',
  templateUrl: './driver-conductor.component.html',
  styleUrls: ['./driver-conductor.component.css'],
})
export class DriverConductorComponent {
  constructor(
    private appService: AppService,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  form1: any = {
    driver_name: '',
    contact_no: '',
  };

  form2: any = {
    conductor_name: '',
    contact_no: '',
  };

  busDriverList: any;
  driverList: any;

  busConductorList: any;
  conductorList: any;

  ngOnInit(): void {
    this.getDrivers();
    this.getConductors();
  }

  isEdit: boolean = false;
  openNewDriverDialog = () => {
    this.isEdit = false;
    this.form1 = {
      driver_name: '',
      contact_no: '',
    };
  };

  saveData = () => {
    if (!this.form1.driver_name || !this.form1.contact_no) {
      this.toastr.warning('Please fill-up the form before proceed', 'Warning');
      return;
    }
    const ENDPOINT = `${environment.BASE_URL}/api/saveDriver`;
    const requestOptions = {
      requestObject: this.form1,
    };

    this.http.post(ENDPOINT, requestOptions).subscribe(
      (response) => {
        console.log('response ', response);
        this.getDrivers();
        this.resetForm1();
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

  openEditDriverDialog = (data: any) => {
    console.log(data);
    
    this.isEdit = true;
    this.form1 = {
      id: data?.id,
      driver_name: data?.driver_name,
      contact_no: data?.contact_no,
    };
  };

  updateData = () => {
    if (!this.form1.id) {
      this.toastr.warning('Something went wrong! Please try again', 'Warning');
      return;
    }
    if (!this.form1.driver_name || !this.form1.contact_no) {
      this.toastr.warning('Please fill-up the form before proceed', 'Warning');
      return;
    }
    const ENDPOINT = `${environment.BASE_URL}/api/updateDriver`;
    const requestOptions = {
      requestObject: this.form1,
    };

    this.http.post(ENDPOINT, requestOptions).subscribe(
      (response) => {
        console.log('response ', response);
        this.getDrivers();
        this.resetForm1();
        this.toastr.success('Driver record updated successfully', 'Success');
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

  getDrivers = () => {
    const ENDPOINT = `${environment.BASE_URL}/api/getDriver`;
    this.http.get(ENDPOINT).subscribe(
      (response) => {
        console.log('response ', response);
        this.driverList = response;
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

  toBeDeletedDriverRecord:any = {};
  openConfirmationDialog=(data:any)=>{
    this.toBeDeletedDriverRecord = data;
  }

  handleDeleteDriver =()=>{
    if(this.toBeDeletedDriverRecord.id!=''){
      const ENDPOINT = `${environment.BASE_URL}/api/deleteDriver`;
      const requestOptions = {
        requestObject: this.toBeDeletedDriverRecord,
      };
      this.http.post(ENDPOINT, requestOptions).subscribe(
        (response) => {
          this.getDrivers();
          this.toastr.success("Driver deleted successfully", "Success Message");
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

  selectedData: any;
  viewDriverData = (id: any) => {
    this.selectedData = this.driverList[id];
    console.log(this.driverList[id]);
  };

  activeTabName: any = 'Driver';
  setAddNewButton = (tabName: any) => {
    this.activeTabName = tabName;
  };

  // conductor

  isConductorEdit: boolean = false;
  openNewConductorDialog = () => {
    this.isConductorEdit = false;
    this.form2 = {
      conductor_name: '',
      contact_no: '',
    };
  };

  saveDataConductor = () => {
    if (!this.form2.conductor_name || !this.form2.contact_no) {
      this.toastr.warning('Please fill-up the form before proceed', 'Warning');
      return;
    }
    const ENDPOINT = `${environment.BASE_URL}/api/saveConductor`;
    const requestOptions = {
      requestObject: this.form2,
    };
    console.log('mmmmmmmmmmm', requestOptions);
    this.http.post(ENDPOINT, requestOptions).subscribe(
      (response) => {
        console.log('response ', response);
        this.getConductors();
        this.resetForm2();
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

  openEditConductorDialog = (data: any) => {
    this.isConductorEdit = true;
    this.form2 = {
      id: data?.id,
      conductor_name: data?.conductor_name,
      contact_no: data?.contact_no,
    };
  };

  updateDataConductor = () => {
    if (!this.form2.id) {
      this.toastr.warning('Something went wrong! Please try again', 'Warning');
      return;
    }
    if (!this.form2.conductor_name || !this.form2.contact_no) {
      this.toastr.warning('Please fill-up the form before proceed', 'Warning');
      return;
    }
    const ENDPOINT = `${environment.BASE_URL}/api/updateConductor`;
    const requestOptions = {
      requestObject: this.form2,
    };

    this.http.post(ENDPOINT, requestOptions).subscribe(
      (response) => {
        console.log('response ', response);
        this.getConductors();
        this.resetForm2();
        this.toastr.success('Conductor record updated successfully', 'Success');
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

  getConductors = () => {
    const ENDPOINT = `${environment.BASE_URL}/api/getConductor`;

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
      }
    );
  };

  toBeDeletedConductorRecord:any = {};
  openDeleteConfirmationDialog=(data:any)=>{
    this.toBeDeletedConductorRecord = data;
  }

  handleDeleteConductor =()=>{
    if(this.toBeDeletedConductorRecord.id!=''){
      const ENDPOINT = `${environment.BASE_URL}/api/deleteConductor`;
      const requestOptions = {
        requestObject: this.toBeDeletedConductorRecord,
      };
      this.http.post(ENDPOINT, requestOptions).subscribe(
        (response) => {
          this.getConductors();
          this.toastr.success("Conductor deleted successfully", "Success Message");
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

  selectedDataConductor: any;
  viewConductorData = (id: any) => {
    this.selectedDataConductor = this.conductorList[id];
    console.log(this.conductorList[id]);
  };

  resetForm1() {
    (this.form1.driver_name = ''), (this.form1.contact_no = '');
  }

  resetForm2() {
    (this.form2.conductor_name = ''), (this.form2.contact_no = '');
  }
}

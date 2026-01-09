import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../app.service';
import { environment } from 'src/environments/environment';
import { add } from 'lodash';

@Component({
  selector: 'app-driver-conductor',
  templateUrl: './driver-conductor.component.html',
  styleUrls: ['./driver-conductor.component.css'],
})
export class DriverConductorComponent {
  public endpoint: string;
  constructor(
    private appService: AppService,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.endpoint = environment.BASE_URL;
   }

  imagePreview: string | ArrayBuffer | null = null;

  form1: any = {
    driver_name: '',
    contact_no: '',
    aadhaar: '',
    pan: '',
    voter: '',
    dl: '',
    address: '',
    photo: null,
  };

  form2: any = {
    conductor_name: '',
    contact_no: '',
    aadhaar: '',
    pan: '',
    voter: '',
    dl: '',
    address: '',
    photo: null,
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
      aadhaar: '',
      pan: '',
      voter: '',
      dl: '',
      address: '',
      photo: null,
    };
  };

  onPhotoChange(event: any) {
  const file = event.target.files[0];

  if (!file) return;

  // validate image
  if (!file.type.startsWith('image/')) {
    this.toastr.warning('Only image files allowed');
    return;
  }

  // 🔹 assign based on mode
  
    this.form2.photo = file;
  
    this.form1.photo = file;
  

  // preview
  const reader = new FileReader();
  reader.onload = () => {
    this.imagePreview = reader.result;
  };
  reader.readAsDataURL(file);
}


  saveData = (form: any) => {
  if (form.invalid || !this.form1.photo) {
    this.toastr.warning(
      'Please fill-up all fields and upload photo',
      'Warning'
    );
    return;
  }

  const formData = new FormData();
  formData.append('driver_name', this.form1.driver_name);
  formData.append('contact_no', this.form1.contact_no);
  formData.append('aadhaar', this.form1.aadhaar);
  formData.append('pan', this.form1.pan);
  formData.append('voter', this.form1.voter);
  formData.append('dl', this.form1.dl);
  formData.append('address', this.form1.address);
  formData.append('photo', this.form1.photo); // ✅ IMPORTANT

  const ENDPOINT = `${environment.BASE_URL}/api/saveDriver`;

  // 🔥 SEND FORMDATA — NOT JSON
  this.http.post(ENDPOINT, formData).subscribe(
    (response) => {
      console.log('response ', response);
      this.getDrivers();
      this.resetForm1();
      this.toastr.success('Added Successfully', 'Success');
      this.imagePreview = null;
    },
    (error) => {
      console.log('error here ', error);
      this.toastr.error('Something went wrong !', 'Error');
      this.imagePreview = null;
    }
  );
};

closeForm() {
    this.imagePreview = null;
  }

  openEditDriverDialog = (data: any) => {
  this.isEdit = true;

  this.form1 = {
    id: data?.id,
    driver_name: data?.driver_name,
    contact_no: data?.contact_no,
    aadhaar: data?.aadhaar,
    pan: data?.pan,
    voter: data?.voter,
    dl: data?.dl,
    address: data?.address,
    photo: null,              // NEW FILE (optional)
    old_photo: data?.photo    // EXISTING IMAGE PATH
  };

  // show existing photo preview
  if (data?.photo) {
    this.imagePreview = `${environment.BASE_URL}/docs/${data.photo}`;
  }
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

  const formData = new FormData();
  formData.append('id', this.form1.id);
  formData.append('driver_name', this.form1.driver_name);
  formData.append('contact_no', this.form1.contact_no);
  formData.append('aadhaar', this.form1.aadhaar || '');
  formData.append('pan', this.form1.pan || '');
  formData.append('voter', this.form1.voter || '');
  formData.append('dl', this.form1.dl || '');
  formData.append('address', this.form1.address || '');

  // send old photo path
  formData.append('old_photo', this.form1.old_photo || '');

  // send new photo ONLY if selected
  if (this.form1.photo) {
    formData.append('photo', this.form1.photo);
  }

  const ENDPOINT = `${environment.BASE_URL}/api/updateDriver`;

  this.http.post(ENDPOINT, formData).subscribe(
    () => {
      this.getDrivers();
      this.resetForm1();
      this.imagePreview = null;
      this.isEdit = false;
      this.toastr.success('Driver record updated successfully', 'Success');
    },
    () => {
      this.toastr.error('Something went wrong!', 'Error');
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

  toBeDeletedDriverRecord: any = {};
  openConfirmationDialog = (data: any) => {
    this.toBeDeletedDriverRecord = data;
  }

  handleDeleteDriver = () => {
    if (this.toBeDeletedDriverRecord.id != '') {
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
    } else {
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
      aadhaar: '',
      pan: '',
      voter: '',
      address: '',
      photo: null,
    };
  };

  saveDataConductor(form: any) {
  console.log('FORM VALID:', form.valid);
  console.log('PHOTO:', this.form2.photo);

  if (form.invalid || !this.form2.photo) {
    this.toastr.warning(
      'Please fill-up all fields and upload photo',
      'Warning'
    );
    return;
  }

  const formData = new FormData();
  formData.append('conductor_name', this.form2.conductor_name);
  formData.append('contact_no', this.form2.contact_no);
  formData.append('aadhaar', this.form2.aadhaar);
  formData.append('pan', this.form2.pan);
  formData.append('voter', this.form2.voter);
  formData.append('address', this.form2.address);
  formData.append('photo', this.form2.photo); // ✅ WORKS NOW

  const ENDPOINT = `${environment.BASE_URL}/api/saveConductor`;

  this.http.post(ENDPOINT, formData).subscribe(
    () => {
      this.toastr.success('Added Successfully', 'Success');
      this.getConductors();
      form.resetForm();
      this.imagePreview = null;
    },
    () => {
      this.toastr.error('Something went wrong!', 'Error');
    }
  );
}


  openEditConductorDialog = (data: any) => {
  this.isConductorEdit = true;

  this.form2 = {
    id: data?.id,
    conductor_name: data?.conductor_name,
    contact_no: data?.contact_no,
    aadhaar: data?.aadhaar,
    pan: data?.pan,
    voter: data?.voter,
    address: data?.address,
    photo: null,                 // NEW FILE (optional)
    old_photo: data?.photo       // EXISTING PHOTO PATH
  };

  // show existing photo preview
  if (data?.photo) {
    this.imagePreview = `${environment.BASE_URL}/docs/${data.photo}`;
  }
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

  const formData = new FormData();
  formData.append('id', this.form2.id);
  formData.append('conductor_name', this.form2.conductor_name);
  formData.append('contact_no', this.form2.contact_no);
  formData.append('aadhaar', this.form2.aadhaar);
  formData.append('pan', this.form2.pan);
  formData.append('voter', this.form2.voter);
  formData.append('address', this.form2.address);

  // ✅ Send old photo path
  formData.append('old_photo', this.form2.old_photo);

  // ✅ Send new photo ONLY if selected
  if (this.form2.photo) {
    formData.append('photo', this.form2.photo);
  }

  const ENDPOINT = `${environment.BASE_URL}/api/updateConductor`;

  this.http.post(ENDPOINT, formData).subscribe(
    () => {
      this.toastr.success('Conductor record updated successfully', 'Success');
      this.getConductors();
      this.resetForm2();
      this.imagePreview = null;
      this.isConductorEdit = false;
    },
    () => {
      this.toastr.error('Something went wrong!', 'Error');
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

  toBeDeletedConductorRecord: any = {};
  openDeleteConfirmationDialog = (data: any) => {
    this.toBeDeletedConductorRecord = data;
  }

  handleDeleteConductor = () => {
    if (this.toBeDeletedConductorRecord.id != '') {
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
    } else {
      this.toastr.warning("Please enter data properly before proceed", "Warning Message");
    }
  }


  handleBlockConductor = () => {
    if (this.toBeDeletedConductorRecord.id != '') {
      const ENDPOINT = `${environment.BASE_URL}/api/blockConductor`;
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
    } else {
      this.toastr.warning("Please enter data properly before proceed", "Warning Message");
    }
  }

  

  selectedDataConductor: any;
  viewConductorData = (id: any) => {
    this.selectedDataConductor = this.conductorList[id];
    console.log(this.conductorList[id]);
  };

  resetForm1() {
    this.form1 = {};
  this.isEdit = false;
  }

  resetForm2() {
     this.form2 = {};
    this.isConductorEdit = false;
  }





  attendanceMonth: string = ''; // ex: "2025-09"
  conductorAttendance: any[] = [];
  daysInMonth: string[] = [];
  
  getConductorAttendance = () => {
    if (!this.attendanceMonth) {
      return;
    }
  
    const [year, month] = this.attendanceMonth.split('-').map(Number);
  
    const ENDPOINT = `${environment.BASE_URL}/api/getConductorAttendance?month=${year}-${month}-01`;
  
    this.http.get<any[]>(ENDPOINT).subscribe(
      (response) => {
        console.log('getConductorAttendance ', response);
  
        // 1️⃣ Generate days of selected month
        this.generateMonthDays(year, month - 1);
  
        // 2️⃣ Parse attendance JSON string
        this.conductorAttendance = response.map(item => ({
          ...item,
          attendance: typeof item.attendance === 'string'
            ? JSON.parse(item.attendance)
            : item.attendance
        }));
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
      }
    );
  };
  

  generateMonthDays(year: number, month: number) {
    this.daysInMonth = [];
  
    const daysInSelectedMonth = new Date(year, month + 1, 0).getDate();
  
    for (let day = 1; day <= daysInSelectedMonth; day++) {
      const dd = String(day).padStart(2, '0');
      const mm = String(month + 1).padStart(2, '0');
  
      this.daysInMonth.push(`${year}-${mm}-${dd}`);
    }
  }
  
  

}

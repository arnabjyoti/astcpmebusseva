import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-conductor',
  templateUrl: './conductor.component.html',
  styleUrls: ['./conductor.component.css']
})
export class ConductorComponent {

  isLoading: boolean = false;

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
  
    form2: any = {
    conductor_id: '',
    conductor_name: '',
    license_no: '',
    license_validity: '',
    contact_no: '',
    aadhar: '',
    pan: '',
    voter: '',
    address: '',
    photo: null,
  };

  busConductorList: any;
  conductorList: any;


  ngOnInit(): void {
    this.getConductors();
  }


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

    // preview
  const reader = new FileReader();
  reader.onload = () => {
    this.imagePreview = reader.result;
  };
  reader.readAsDataURL(file);
}

isConductorEdit: boolean = false;
  openNewConductorDialog = () => {
    this.isConductorEdit = false;
    this.form2 = {
      conductor_id: '',
      conductor_name: '',
      license_no: '',
      license_validity: '',
      contact_no: '',
      aadhar: '',
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
  formData.append('conductor_id', this.form2.conductor_id);
  formData.append('license_no', this.form2.license_no);
  formData.append('license_validity', this.form2.license_validity);
  formData.append('conductor_name', this.form2.conductor_name);
  formData.append('contact_no', this.form2.contact_no);
  formData.append('aadhar', this.form2.aadhar);
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
    conductor_id: data?.conductor_id,
    conductor_name: data?.conductor_name,
    license_no: data?.license_no,
    license_validity: data?.license_validity,
    contact_no: data?.contact_no,
    aadhar: data?.aadhar,
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
  formData.append('conductor_id', this.form2.conductor_id);
  formData.append('license_no', this.form2.license_no);
  formData.append('license_validity', this.form2.license_validity);
  formData.append('conductor_name', this.form2.conductor_name);
  formData.append('contact_no', this.form2.contact_no);
  formData.append('aadhar', this.form2.aadhar);
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

    this.isLoading = true;

    this.http.get(ENDPOINT).subscribe(
      (response) => {
        console.log('response ', response);
        this.conductorList = response;
        this.isLoading = false; // hide loader after success
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


  resetForm2() {
     this.form2 = {};
    this.isConductorEdit = false;
  }

  downloadRecords = () => {
    const exportData = this.conductorList.map((conductor: any) => ({
      conductor_id: conductor.conductor_id,
      conductor_name: conductor.conductor_name,
      license_no: conductor.license_no,
      license_validity: conductor.license_validity,
      contact_no: conductor.contact_no,
      aadhar: conductor.aadhar,
      pan: conductor.pan,
      voter: conductor.voter,
      address: conductor.address
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Conductor Records');
    XLSX.writeFile(wb, 'conductor_records.xlsx');
  }

}

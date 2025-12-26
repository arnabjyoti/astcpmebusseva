import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TripLogService {
  constructor(private appService: AppService, private http: HttpClient) {}

  getFilteredTripLogs(req: any, callback: any) {
  const ENDPOINT = `${environment.BASE_URL}/api/getFilteredTripLogs`;
  const requestOptions = {
    headers: this.appService.headers,
    method: 'post',
    requestObject: req,
  };

  this.http.post(ENDPOINT, requestOptions).subscribe(
    (response) => {
      return callback && callback(response);
    },
    (error) => {
      return callback && callback(error);
    },
    () => {
      console.log('Completed fetching filtered trip logs.');
    }
  );
}

createTripLog(req: any, callback: any) {
  const ENDPOINT = `${environment.BASE_URL}/api/createTripLog`;
  const requestOptions = {
    headers: this.appService.headers,
    method: 'post',
    requestObject: req,
  };
console.log("dataaaaaaaaaaa",requestOptions);

  this.http.post(ENDPOINT, requestOptions).subscribe(
    (response) => {
      return callback && callback(response);
    },
    (error) => {
      return callback && callback(error);
    },
    () => {
      console.log('Completed fetching filtered trip logs.');
    }
  );
}

}

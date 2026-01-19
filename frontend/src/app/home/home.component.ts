import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import * as moment from 'moment';
import { LoginService } from '../login/login.service';
import { NgxSpinnerService } from 'ngx-spinner';
// import {userInfo} from '../../helper/userinfo';

import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  totalBus = 0;
  totalDriver = 0;
  totalConductor = 0;
  totalRoute = 0;

  runningBus = 0;
  idleBus: any[] = [];
  idleBusCount = 0;
  finishedBus = 0;
  stillBus = 0;

  todayEarning = 0;
  yesterdayEarning = 0;

  barChart!: Chart;


  public user: any;
  public tokenData: any;

  public userId: any;

  public endpoint: any;

  public isLodaing: boolean = true;
  public userInputData: any = {
    tripId: '',
    station: '',
    std: '',
    etd: '',
    gate: '',
    status: '',
    next_stop: '',
    stations: [],
    schedule_time: '',
  };
  tripList: any[] = [];
  constructor(
    private spinner: NgxSpinnerService,
    private homeService: HomeService,
    private loginService: LoginService,
    private toastr: ToastrService
  ) {
    this.endpoint = environment.BASE_URL;
    this.init();
  }

  init = () => {
    let token = JSON.parse(JSON.stringify(localStorage.getItem('token')));
    token = JSON.parse(token);

    this.tokenData = token;
    console.log('Token=', token);
    this.user = token['usr'];
    this.isLodaing = false;
    if (!token.usr.accessKeyword) {
      console.log('gggggggggggggggggggggg');
      return;
    }
  };

   ngOnInit(): void {
    this.getDashboardData();
  }


  // private getCurrentTime(): string {
  //   const now = new Date();
  //   const hours = now.getHours().toString().padStart(2, '0'); // Pad with leading zero
  //   const minutes = now.getMinutes().toString().padStart(2, '0'); // Pad with leading zero
  //   return `${hours}:${minutes}`;
  // }

 

  spiner() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 5000);
  }

  getCache = async () => {
    const newCache = await caches.open('new-cache');
    const response = await newCache.match('yes');
  };


  getDashboardData() {
    this.homeService.getDashboardCounts((err: any, res: any) => {
      if (err) {
        console.error(err);
        return;
      }

      // Assign API values
      this.totalBus = res.totalBus;
      this.totalDriver = res.totalDriver;
      this.totalConductor = res.totalConductor;
      this.totalRoute = res.totalRoute;

      this.runningBus = res.runningBus;
      this.idleBus = res.idleBus;
      this.idleBusCount = res.idleBusCount;
      this.finishedBus = res.finishedBus;
      this.stillBus = res.stillBus;

      this.todayEarning = 0
      this.yesterdayEarning = 0

      console.log("idle",this.idleBus);
      

      // this.totalBus = res.totalBus;
      // this.totalDriver = res.totalDriver;
      // this.totalConductor = res.totalConductor;
      // this.totalRoute = res.totalRoute;

      // Load chart AFTER data arrives
      setTimeout(() => {
        this.loadBarChart();
        this.loadPieChart();
      }, 0);
    });
  }

   loadBarChart() {
    new Chart('transportBarChart', {
      type: 'bar',
      data: {
        labels: ['Buses', 'Drivers', 'Conductors', 'Routes'],
        datasets: [{
          label: 'Count',
          data: [this.totalBus, this.totalDriver, this.totalConductor, this.totalRoute],
          backgroundColor: [
            '#4e73df',
            '#1cc88a',
            '#f6c23e',
            '#e74a3b'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }


  loadPieChart() {
  new Chart('transportPieChart', {
    type: 'pie',
    data: {
      labels: ['Running Today', 'Idle Today', 'Finished Today', 'Not Started'],
      datasets: [
        {
          data: [
            this.runningBus,
            this.idleBusCount,
            this.finishedBus,
            this.stillBus
          ],
          backgroundColor: [
            '#4e73df',
            '#1cc88a',
            '#f6c23e',
            '#e74a3b'
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

}



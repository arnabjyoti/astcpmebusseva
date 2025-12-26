import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';
import { LoginService } from 'src/app/login/login.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tovnav',
  templateUrl: './tovnav.component.html',
  styleUrls: ['./tovnav.component.css'],
  providers: [DatePipe],
})
export class TovnavComponent implements OnInit {
  public user: any;
  public shortName: any;
  public userId: any;
  public tokenData: any;
  public menuItems: any;

  public myDate: any = new Date();
  constructor(private loginService: LoginService, private datePipe: DatePipe) {
    this.myDate = this.datePipe.transform(this.myDate, 'EEEE, dd-MM-yyyy');
  }

  ngOnInit(): void {
    this.getUserDetails();
    console.log('user ', this.user);
  }

  getUserDetails = () => {
    let token = JSON.parse(JSON.stringify(localStorage.getItem('token')));
    token = JSON.parse(token);

    this.tokenData = token;

    if (token) {
      this.user = token['usr'];
      this.sideMenu(token['usr']);
      this.userId = this.user.id;
      console.log('usr name=', this.user.f_name);
      this.shortName = this.user.f_name.substring(0, 3);
    } else {
      console.log('Token not');
    }
    // console.log("I AM CITIZEN",this.user);
  };

  signout = () => {
    localStorage.removeItem('token');
    const token = localStorage.getItem('token');
    if (!token) {
      // this.router.navigate(['/login']);
      window.location.href = '/login';
      location.reload();
    }
  };

  sideMenu = (user: any) => {
    console.log('role : ', user.role);

    // for operator 
    if (user.role === 'operator') {
      this.menuItems = [
        {
          label: 'Home',
          icon: 'fas fa-home',
          routerLink: '/home',
        },
        {
          label: 'Bus Master',
          icon: 'fas fa-bus',
          routerLink: '/buses',
        },
        {
          label: 'Bus Routes',
          icon: 'fas fa-route',
          routerLink: '/bus-routes',
        },
        {
          label: 'Bus Staff',
          icon: 'fas fa-users',
          routerLink: '/driver-conductor',
        },
        // {
        //   label: 'Trips',
        //   icon: 'fas fa-suitcase',
        //   routerLink: '/trips',
        // },
        // {
        //   label: 'Arrival',
        //   icon: 'fas fa-plane-arrival',
        //   routerLink: '/arrival',
        // },
        // {
        //   label: 'Departure',
        //   icon: 'fas fa-plane-departure',
        //   routerLink: '/departure',
        // },
        // {
        //   label: 'Bus Info',
        //   icon: 'fas fa-bus',
        //   routerLink: '/businfo',
        // },
        // {
        //   label: 'Report',
        //   icon: 'fas fa-book',
        //   routerLink: '/report',
        // },
        {
          label: 'Earnings Book',
          icon: 'fas fa-book',
          routerLink: '/bus-daily-updates',
        },
        // {
        //   label: 'Trip Daily data',
        //   icon: 'fas fa-book',
        //   routerLink: '/trip-logs',
        // },
      ];
    }

    // for admin 
    if (user.role === 'cashier') {
      this.menuItems = [
        {
          label: 'Home',
          icon: 'fas fa-home',
          routerLink: '/home',
        },
        {
          label: 'bus-daily-updates',
          icon: 'fas fa-bus',
          routerLink: '/bus-daily-updates',
        },
        {
          label: 'Trips',
          icon: 'fas fa-suitcase',
          routerLink: '/trips',
        },
        {
          label: 'Arrival',
          icon: 'fas fa-plane-arrival',
          routerLink: '/arrival',
        },
        {
          label: 'Departure',
          icon: 'fas fa-plane-departure',
          routerLink: '/departure',
        },
        {
          label: '56 Ev buses',
          icon: 'fas fa-bus',
          routerLink: '/businfo',
        },
        {
          label: 'Report',
          icon: 'fas fa-book',
          routerLink: '/report',
        },
        {
          label: 'Trip Daily data',
          icon: 'fas fa-book',
          routerLink: '/trip-logs',
        },
      ];
    }


  };



}

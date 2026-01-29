import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuardService as AuthGuard } from "./auth/auth-gaurd.service";
import { LoginComponent } from './login/login.component';
import { BusesComponent } from './buses/buses.component';
import { BusDailyUpdatesComponent } from './bus-daily-updates/bus-daily-updates.component';
import { BusRoutesComponent } from './bus-routes/bus-routes.component';
import { DailyUpdateFormComponent } from './daily-update-form/daily-update-form.component';
import { DriverConductorComponent } from './driver-conductor/driver-conductor.component';
import { TripLogComponent } from './trip-log/trip-log.component';
import { DriverComponent } from './staff/driver/driver.component';
import { ConductorComponent } from './staff/conductor/conductor.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { BreakdownVehicleComponent } from './breakdown-vehicle/breakdown-vehicle.component';

const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
    data: { showTopNav: true },
  },
  {
    path: "home",
    component: HomeComponent,
    data: { showTopNav: true },
    canActivate: [AuthGuard]
  },
  {
    path: "buses",
    component: BusesComponent,
    data: { showTopNav: true },
    canActivate: [AuthGuard]
  },
  {
    path: "driver-conductor",
    component: DriverConductorComponent,
    data: { showTopNav: true },
    canActivate: [AuthGuard]
  },
  {
    path: "attendance",
    component: AttendanceComponent,
    data: { showTopNav: true },
    canActivate: [AuthGuard]
  },
  {
    path: "driver",
    component: DriverComponent,
    data: { showTopNav: true },
    canActivate: [AuthGuard]
  },
  {
    path: "conductor",
    component: ConductorComponent,
    data: { showTopNav: true },
    canActivate: [AuthGuard]
  },
  {
    path: "bus-routes",
    component: BusRoutesComponent,
    data: { showTopNav: true },
    canActivate: [AuthGuard]
  },
  {
    path: "bus-daily-updates",
    component: BusDailyUpdatesComponent,
    data: { showTopNav: true },
    canActivate: [AuthGuard]
  },
  {
    path: "daily-update",
    component: DailyUpdateFormComponent,
    data: { showTopNav: true },
    canActivate: [AuthGuard]
  },
  {
    path: "breakdown-vehicles",
    component: BreakdownVehicleComponent,
    data: { showTopNav: true },
    canActivate: [AuthGuard]
  },
  {
    path: "trip-logs",
    component: TripLogComponent,
    data: { showTopNav: true },
    canActivate: [AuthGuard]
  },
  { path: "**", redirectTo: "home" }
];

const config: ExtraOptions = {
  useHash: true
};

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

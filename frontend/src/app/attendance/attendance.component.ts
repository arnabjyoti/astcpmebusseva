import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { AppService } from '../app.service';

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent {
  public endpoint: string;
  constructor(
    private appService: AppService,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.endpoint = environment.BASE_URL;
  }

  @ViewChild('reportSection') reportSection!: ElementRef;

  isExportingExcel = false;
  isExportingPDF = false;

  downloadExcel() {
    this.isExportingExcel = true;
    const element = this.reportSection.nativeElement;
    element.classList.add('exporting');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${this.attendanceFrom }To${this.attendanceTo}_report.xlsx`);
    element.classList.remove('exporting');
    this.isExportingExcel = false;
  }

  downloadPDF() {
    this.isExportingPDF = true;
    const element = this.reportSection.nativeElement;
    element.classList.add('exporting');

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = 210;
      const pageHeight = 297;

      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      // First page
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Additional pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${this.attendanceFrom }To${this.attendanceTo}_report.pdf`);
      element.classList.remove('exporting');
      this.isExportingPDF = false;
    });
  }

  attendanceMonth: string = ''; // ex: "2025-09"
  conductorAttendance: any[] = [];
  daysInMonth: string[] = [];

  attendanceFrom: string = '';
  attendanceTo: string = '';

  getConductorAttendance = () => {
    // if (!this.attendanceMonth) {
    //   return;
    // }

    const [year, month] = this.attendanceMonth.split('-').map(Number);

    // const ENDPOINT = `${environment.BASE_URL}/api/getConductorAttendance?month=${year}-${month}-01`;
    const ENDPOINT = `${environment.BASE_URL}/api/getConductorAttendance?from=${this.attendanceFrom}&to=${this.attendanceTo}`;

    this.http.get<any[]>(ENDPOINT).subscribe(
      (response) => {
        console.log('getConductorAttendance ', response);

        // 1️⃣ Generate days of selected month
        this.generateMonthDays(this.attendanceFrom, this.attendanceTo);


        // 2️⃣ Parse attendance JSON string
        // this.conductorAttendance = response.map((item) => ({
        //   ...item,
        //   attendance:
        //     typeof item.attendance === 'string'
        //       ? JSON.parse(item.attendance)
        //       : item.attendance,
        // }));

        this.conductorAttendance = response.map((item) => {
          const attendance =
            typeof item.attendance === 'string'
              ? JSON.parse(item.attendance)
              : item.attendance;
        
          const values = Object.values(attendance);
        
          const total_present = values.filter(v => v === 'P').length;
          const total_absent = values.filter(v => v === 'A').length;
        
          return {
            ...item,
            attendance,
            total_present,
            total_absent
          };
        });
        

        console.log(" this.conductorAttendance ==>>", this.conductorAttendance);
        
      },
      (error) => {
        console.log('error here ', error);
        this.toastr.error('Something went wrong !', 'Warning');
      }
    );
  };

  generateMonthDays(from: string, to: string) {
    this.daysInMonth = [];
  
    if (!from || !to) return;
  
    let start = new Date(from);
    let end = new Date(to);
  
    // Normalize time to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
  
    while (start <= end) {
      const yyyy = start.getFullYear();
      const mm = String(start.getMonth() + 1).padStart(2, '0');
      const dd = String(start.getDate()).padStart(2, '0');
  
      this.daysInMonth.push(`${yyyy}-${mm}-${dd}`);
  
      start.setDate(start.getDate() + 1);
    }
  }
  
}

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
  styleUrls: ['./attendance.component.css']
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
    XLSX.writeFile(wb, 'report.xlsx');
    element.classList.remove('exporting');
    this.isExportingExcel = false;
  }

  downloadPDF() {
    this.isExportingPDF = true;
    const element = this.reportSection.nativeElement;
    element.classList.add('exporting');
  
    html2canvas(element, { scale: 2 }).then(canvas => {
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
  
      pdf.save('report.pdf');
      element.classList.remove('exporting');
      this.isExportingPDF = false;
    });
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

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from './student.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  students: any[] = [];
  departments: any[] = [];
  filterDept: string = "";
  selectedTab: string = 'view';

  // For Add Student
  newStudent: any = { name: '', department: '' };

  // For Edit Student Info
  editInfoStudent: any = null;

  // For Stats
  stats = {
    totalStudents: 0,
    totalDepartments: 0,
    avgSemester: 0
  }; 

  // For Edit Marks
  editMarksStudent: any = null;
  editResult: any = null;

  // For View Results
  resultStudent: any = null;
  studentResults: any[] = [];

  // For Activity Log 
  activityLog: { message: string, time: Date }[] = [];

  // For Notification
  notifications: { message: string, type: 'success' | 'error' | 'info' }[] = [];

  constructor(private studentService: StudentService) {}

  ngOnInit() {
    this.loadActivityLog();
    this.loadStudents();
    this.loadDepartments();
    this.computeStats();
  }

  // ----------------- Students -----------------
  loadStudents() {
    this.studentService.getAllStudents().subscribe(data => {
      if (this.filterDept) {
        this.students = data.filter(s => s.department === this.filterDept);
      } else {
        this.students = data || [];
      }
      this.computeStats();
    });
  }

  // ----------------- Departments -----------------
  loadDepartments() {
    this.studentService.getDepartments().subscribe(data => {
      this.departments = data || [];
    });
  }

  // ----------------- Add Student -----------------
  prepareAddStudent() {
    this.newStudent = { name: '', department: '' };
    this.selectedTab = 'add';
  }

  addStudent() {
    if (!this.newStudent.name || !this.newStudent.department) {
      this.showNotification("Name & Department are required", "error");
      return;
    }

    this.studentService.addStudent(this.newStudent).subscribe(() => {
      this.loadStudents();
      this.computeStats();
      this.logActivity(`Added student ${this.newStudent.name} (${this.newStudent.department})`);
      this.showNotification("Student added successfully!", "success");
      this.cancel();
    });
  }

  // ----------------- Edit Info -----------------
  openEditInfo(student: any) {
    this.editInfoStudent = { ...student };
    this.selectedTab = 'editInfo';
  }

  saveStudentInfo() {
    this.studentService.updateStudentByRoll(this.editInfoStudent.roll, this.editInfoStudent)
      .subscribe(() => {
        this.loadStudents();
        this.computeStats();
        this.logActivity(`Updated info for ${this.editInfoStudent.name}`);
        this.showNotification("Student info updated!", "success");
        this.cancel();
      });
  }

  // ----------------- Edit Marks -----------------
  openEditMarks(student: any) {
    this.studentService.getResultsByStudentId(student._id).subscribe(results => {
      if (results.length > 0) {
        this.editMarksStudent = student;
        this.editResult = { ...results[0] };
        this.selectedTab = 'editMarks';
      } else {
        this.showNotification("No result found for this student", "error");
      }
    });
  }

  saveStudentMarks() {
    this.studentService.updateMarksByRoll(
      this.editMarksStudent.roll,
      this.editResult.subjects
    ).subscribe(() => {
      this.loadStudents();
      this.computeStats();
      this.logActivity(`Updated marks for ${this.editMarksStudent.name}`);
      this.showNotification("Marks updated successfully!", "success");
      this.cancel();
    });
  }

  // ----------------- Delete -----------------
  deleteStudent(student: any) {
    if (confirm(`Delete ${student.name}?`)) {
      this.studentService.deleteStudentByRoll(student.roll).subscribe(() => {
        this.loadStudents();
        this.computeStats();
        this.logActivity(`Deleted student ${student.name}`);
        this.showNotification("Student deleted!", "success");
      });
    }
  }

  // ----------------- View Results -----------------
  openResults(student: any) {
    this.resultStudent = student;
    this.studentService.getResultsByStudentId(student._id).subscribe(results => {
      this.studentResults = results;
      this.selectedTab = 'results';
    });
  }

  // ----------------- Cancel -----------------
  cancel() {
    this.selectedTab = 'view';
    this.editInfoStudent = null;
    this.editMarksStudent = null;
    this.resultStudent = null;
    this.newStudent = { name: '', department: '' };
  }

  // ----------------- Search + Sort -----------------
  searchTerm: string = "";
  sortField: string = "roll";
  sortDirection: 'asc' | 'desc' = 'asc';

  get filteredStudents() {
    let data = [...this.students];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(
        s =>
          s.name.toLowerCase().includes(term) ||
          s.roll.toLowerCase().includes(term)
      );
    }

    // Sorting
    data.sort((a, b) => {
      let valA = a[this.sortField];
      let valB = b[this.sortField];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return this.sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return this.sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }

  setSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortField = field;
      this.sortDirection = "asc";
    }
  }

  // ----------------- Export -----------------
  private saveExcel(data: any[], fileName: string) {
    if (!data || data.length === 0) {
      this.showNotification("No data to export!", "error");
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    saveAs(blob, fileName + ".xlsx");

    this.showNotification(`${fileName}.xlsx exported successfully`, "success");
  }

  exportAllStudents() {
    this.saveExcel(this.students, "all-students");
  }

  exportFilteredStudents() {
    this.saveExcel(this.filteredStudents, "filtered-students");
  }

  // ----------------- Stats -----------------
  private computeStats() {
    const list = this.filteredStudents;
    this.stats.totalStudents = list.length;
    this.stats.totalDepartments = new Set(list.map(s => s.department)).size;
    const sumSem = list.reduce((acc, s) => acc + (Number(s.semester) || 0), 0);
    this.stats.avgSemester = list.length ? Math.round((sumSem / list.length) * 10) / 10 : 0;
  }

  // ----------------- Activity Log -----------------
    loadActivityLog() {
      this.studentService.getActivityLogs().subscribe(data => {
        this.activityLog = data || [];
      });
    }

    // Save log
    private logActivity(message: string) {
      this.studentService.addActivityLog(message).subscribe(() => {
        this.loadActivityLog(); // refresh UI after adding
      });
    }

  // ----------------- Notifications -----------------
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const note = { message, type };
    this.notifications.push(note);
    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n !== note);
    }, 3500);
  }
}

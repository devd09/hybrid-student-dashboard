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

  constructor(private studentService: StudentService) {}

  ngOnInit() {
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
      alert("Name & Department are required");
      return;
    }

    this.studentService.addStudent(this.newStudent).subscribe(() => {
      alert("Student added successfully with initial result!");
      this.loadStudents();
      this.computeStats();
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
        alert("Student info updated!");
        this.loadStudents();
        this.computeStats();
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
        alert("No result found for this student");
      }
    });
  }

  saveStudentMarks() {
    this.studentService.updateMarksByRoll(
      this.editMarksStudent.roll,
      this.editResult.subjects
    ).subscribe(() => {
      alert("Marks updated successfully!");
      this.loadStudents();
      this.computeStats();
      this.cancel();
    });
  }

  // ----------------- Delete -----------------
  deleteStudent(student: any) {
    if (confirm(`Delete ${student.name}?`)) {
      this.studentService.deleteStudentByRoll(student.roll).subscribe(() => {
        alert("Student deleted!");
        this.loadStudents();
        this.computeStats();
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

  // ----------------- inside class AdminDashboard -----------------

searchTerm: string = "";
sortField: string = "roll";
sortDirection: 'asc' | 'desc' = 'asc';

// Filter + Sort students
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



private saveExcel(data: any[], fileName: string) {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    saveAs(blob, fileName + ".xlsx");
  }

  // Export All
  exportAllStudents() {
    this.saveExcel(this.students, "all-students");
  }

  // Export Filtered (search + dept filter applied)
  exportFilteredStudents() {
    this.saveExcel(this.filteredStudents, "filtered-students");
  }

  // Compute stats
    private computeStats() {
    const list = this.filteredStudents;
    this.stats.totalStudents = list.length;
    this.stats.totalDepartments = new Set(list.map(s => s.department)).size;
    const sumSem = list.reduce((acc, s) => acc + (Number(s.semester) || 0), 0);
    this.stats.avgSemester = list.length ? Math.round((sumSem / list.length) * 10) / 10 : 0;
}


}

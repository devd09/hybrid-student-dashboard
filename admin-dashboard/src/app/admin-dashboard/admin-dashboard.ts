import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from './student.service';

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
  }

  // ----------------- Students -----------------
  loadStudents() {
    this.studentService.getAllStudents().subscribe(data => {
      if (this.filterDept) {
        this.students = data.filter(s => s.department === this.filterDept);
      } else {
        this.students = data || [];
      }
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
      this.cancel();
    });
  }

  // ----------------- Delete -----------------
  deleteStudent(student: any) {
    if (confirm(`Delete ${student.name}?`)) {
      this.studentService.deleteStudentByRoll(student.roll).subscribe(() => {
        alert("Student deleted!");
        this.loadStudents();
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
}

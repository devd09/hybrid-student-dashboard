import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';     // Needed for *ngIf, *ngFor
import { FormsModule } from '@angular/forms';       // Needed for [(ngModel)]
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
  filteredStudents: any[] = [];
  uniqueDepartments: string[] = [];
  selectedDepartment: string = '';
  selectedRoll: string = '';
  selectedStudent: any = null;

  constructor(private studentService: StudentService) {}

  ngOnInit() {
    this.loadStudents();
  }

  // Load all students and generate department list
  loadStudents() {
    this.studentService.getAllStudents().subscribe(data => {
      this.students = data || [];
      this.uniqueDepartments = [...new Set(this.students.map(s => s.department))];

      this.filterByDepartment(); // Apply any department filter on reload

      // Fetch result for each filtered student
      this.filteredStudents.forEach(student => {
        this.loadResults(student);
      });
    });
  }

  // Filter students by selected department
  filterByDepartment() {
    if (this.selectedDepartment) {
      this.filteredStudents = this.students.filter(
        s => s.department === this.selectedDepartment
      );
    } else {
      this.filteredStudents = this.students;
    }

    // For each filtered student, load their result
    this.filteredStudents.forEach(student => {
      this.loadResults(student);
    });
  }

  // Load results for a student
  loadResults(student: any) {
    this.studentService.getResultsByStudentId(student._id).subscribe(results => {
      student.results = results || [];
    });
  }

  // Edit student by roll
  editStudent(roll: string) {
    this.studentService.getStudentByRoll(roll).subscribe(student => {
      this.selectedStudent = { ...student };
      this.selectedRoll = roll;
    });
  }

  // Save student edits
  saveStudentChanges() {
    this.studentService.updateStudentByRoll(this.selectedRoll, this.selectedStudent).subscribe(res => {
      alert('Student updated!');
      this.selectedStudent = null;
      this.loadStudents(); // Refresh data
    });
  }

  // Delete student and refresh
  deleteStudent(roll: string) {
    if (confirm(`Are you sure you want to delete student ${roll}?`)) {
      this.studentService.deleteStudentByRoll(roll).subscribe(() => {
        alert('Deleted successfully');
        this.loadStudents(); // Reload and apply filters after delete
      });
    }
  }

  
}

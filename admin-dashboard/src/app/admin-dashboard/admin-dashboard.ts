import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { StudentService } from './student.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  activeTab: string = 'dashboard';
  students: any[] = [];
  filteredStudents: any[] = [];
  uniqueDepartments: string[] = [];
  selectedDepartment: string = '';
  selectedRoll: string = '';
  selectedStudent: any = null;
  //activeTab: string = 'dashboard';

  constructor(
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Detect tab change from router
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const child = this.route.snapshot.firstChild;
        this.activeTab = child?.data['tab'] || 'dashboard';
      });
  }

  ngOnInit() {
    this.loadStudents();
  }

  // ----- Student functions -----
  loadStudents() {
    this.studentService.getAllStudents().subscribe(data => {
      this.students = data || [];
      this.uniqueDepartments = [...new Set(this.students.map(s => s.department))];
      this.filterByDepartment();
      this.filteredStudents.forEach(student => this.loadResults(student));
    });
  }

  filterByDepartment() {
    this.filteredStudents = this.selectedDepartment
      ? this.students.filter(s => s.department === this.selectedDepartment)
      : this.students;

    this.filteredStudents.forEach(student => this.loadResults(student));
  }

  loadResults(student: any) {
    this.studentService.getResultsByStudentId(student._id).subscribe(results => {
      student.results = results || [];
    });
  }

  editStudent(roll: string) {
    this.studentService.getStudentByRoll(roll).subscribe(student => {
      this.selectedStudent = { ...student };
      this.selectedRoll = roll;
    });
  }

  saveStudentChanges() {
    this.studentService.updateStudentByRoll(this.selectedRoll, this.selectedStudent).subscribe(() => {
      alert('Student updated!');
      this.selectedStudent = null;
      this.loadStudents();
    });
  }

  deleteStudent(roll: string) {
    if (confirm(`Are you sure you want to delete student ${roll}?`)) {
      this.studentService.deleteStudentByRoll(roll).subscribe(() => {
        alert('Deleted successfully');
        this.loadStudents();
      });
    }
  }
}

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
  // left panel selection
  activeSection: 'students' | 'add' | 'departments' = 'students';

  // lists
  students: any[] = [];
  filteredStudents: any[] = [];
  uniqueDepartments: string[] = [];
  selectedDepartment = '';

  // edit state
  selectedRoll = '';
  selectedStudent: any = null;

  // add student state
  newStudent: any = { name: '', department: '', marks: [] };
  availableCourses: any[] = [];
  lastAddedInfo: { roll: string; email: string; rawPassword: string } | null = null;

  // result viewer
  selectedResult: any = null;

  constructor(private studentService: StudentService) {}

  ngOnInit() {
    this.loadStudents();
  }

  // ---------------- Data loads ----------------
  loadStudents() {
    this.studentService.getAllStudents().subscribe(sts => {
      this.students = sts || [];
      this.uniqueDepartments = [...new Set(this.students.map(s => s.department))];
      this.applyFilter();
    });
  }

  applyFilter() {
    this.filteredStudents = this.selectedDepartment
      ? this.students.filter(s => s.department === this.selectedDepartment)
      : this.students;

    // Attach latest result to each displayed student
    this.filteredStudents.forEach(s => this.loadResults(s));
  }

  loadResults(student: any) {
    this.studentService.getResultsByStudentId(student._id).subscribe(results => {
      // choose the latest (sorted in backend if needed)
      student.results = Array.isArray(results) ? results : [];
    });
  }

  // ---------------- Left panel actions ----------------
  setSection(section: 'students' | 'add' | 'departments') {
    this.activeSection = section;
    if (section === 'add') {
      this.newStudent = { name: '', department: '', marks: [] };
      this.availableCourses = [];
      this.lastAddedInfo = null;
    }
  }

  // ---------------- Edit student ----------------
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

  cancelEdit() {
    this.selectedStudent = null;
  }

  deleteStudent(roll: string) {
    if (!confirm(`Delete student ${roll}?`)) return;
    this.studentService.deleteStudentByRoll(roll).subscribe(() => {
      alert('Deleted successfully');
      this.loadStudents();
    });
  }

  // ---------------- Add student (auto) ----------------
  onDepartmentChangeForAdd() {
    if (!this.newStudent.department) {
      this.availableCourses = [];
      this.newStudent.marks = [];
      return;
    }
    this.studentService.getCourses(this.newStudent.department, 1).subscribe(courses => {
      this.availableCourses = courses || [];
      // preload marks grid
      this.newStudent.marks = this.availableCourses.map(c => ({ name: c.name, marks: '' }));
    });
  }

  addStudent() {
    if (!this.newStudent.name || !this.newStudent.department) {
      alert('Enter name and select department');
      return;
    }

    // convert empty marks to 0
    const payload = {
      name: this.newStudent.name,
      department: this.newStudent.department,
      marks: (this.newStudent.marks || []).map((m: any) => ({
        name: m.name,
        marks: Number(m.marks) || 0
      }))
    };

    this.studentService.addStudentAuto(payload).subscribe(res => {
      // backend returns student & result + we can reconstruct raw password rule
      const rawPassword = `${res.name.replace(/\s+/g, '')}${res.roll}`;
      this.lastAddedInfo = { roll: res.roll, email: res.email, rawPassword };

      alert(
        `✅ Student Added!\n\nName: ${res.name}\nRoll: ${res.roll}\nEmail: ${res.email}\nPassword: ${rawPassword}`
      );

      this.setSection('students');
      this.loadStudents();
    });
  }

  // ---------------- Result viewer ----------------
  viewResult(student: any) {
    this.studentService.getResultsByStudentId(student._id).subscribe(results => {
      this.selectedResult = Array.isArray(results) && results.length > 0 ? results[0] : null;
      if (!this.selectedResult) alert('No result found for this student');
    });
  }
  closeResult() {
    this.selectedResult = null;
  }
}

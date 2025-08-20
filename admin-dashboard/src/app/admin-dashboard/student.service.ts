import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:3000/api'; // API base

  constructor(private http: HttpClient) {}

  // ---------------- Students ----------------
  getAllStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/students`);
  }

  getStudentByRoll(roll: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/students/roll/${roll}`);
  }

  // ✅ Add student with auto roll/email/password/semester/result
  addStudent(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/students/auto`, data);
  }

  updateStudentByRoll(roll: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/students/roll/${roll}`, data);
  }

  deleteStudentByRoll(roll: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/students/roll/${roll}`);
  }

  // ---------------- Results ----------------
  getResultsByStudentId(studentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/results/${studentId}`);
  }

  addResult(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/results`, data);
  }

  updateResult(resultId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/results/${resultId}`, data);
  }

  // ✅ Update marks by roll (recalculate automatically in backend)
  updateMarksByRoll(roll: string, subjects: any[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/students/roll/${roll}/marks`, { subjects });
  }

  // ---------------- Departments ----------------
  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/departments`);
  }

  // ✅ Get courses by department and semester
  getCoursesByDeptAndSem(dept: string, semester: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/courses?department=${dept}&semester=${semester}`);
  }
}

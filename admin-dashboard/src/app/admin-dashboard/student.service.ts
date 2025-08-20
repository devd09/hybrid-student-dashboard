import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private baseUrl = 'http://localhost:3000'; // backend root

  constructor(private http: HttpClient) {}

  // Students
  getAllStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/students`);
  }
  getStudentByRoll(roll: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/students/roll/${roll}`);
  }
  updateStudentByRoll(roll: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/students/roll/${roll}`, data);
  }
  deleteStudentByRoll(roll: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/students/roll/${roll}`);
  }

  // Results
  getResultsByStudentId(studentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/results/${studentId}`);
  }

  // Courses (for department + semester)
  getCourses(department: string, semester: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/api/courses?department=${encodeURIComponent(department)}&semester=${semester}`
    );
  }

  // Add student with auto roll/email/password + auto result
  addStudentAuto(payload: { name: string; department: string; marks?: any[] }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/students/auto`, payload);
  }
}

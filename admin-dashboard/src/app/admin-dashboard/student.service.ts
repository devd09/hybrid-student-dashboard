import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:3000'; // update if needed

  constructor(private http: HttpClient) {}

  // ✅ Get all students
  getAllStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/students`);
  }

  // ✅ Get student results by ID
  getResultsByStudentId(studentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/api/results/${studentId}`);
  }

  // ✅ Delete a student
  deleteStudent(studentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/students/${studentId}`);
  }

  // ✅ Add new result for student
  addResult(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/results`, data);
  }

  // Get student by roll number
getStudentByRoll(roll: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/api/students/roll/${roll}`);
}

// Update student by roll
updateStudentByRoll(roll: string, data: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/api/students/roll/${roll}`, data);
}

// Delete student by roll
deleteStudentByRoll(roll: string): Observable<any> {
  return this.http.delete(`${this.baseUrl}/api/students/roll/${roll}`);
}

}

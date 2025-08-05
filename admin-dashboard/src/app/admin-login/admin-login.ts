// src/app/admin-login/admin-login.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLogin {
  username = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    const credentials = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>('http://localhost:3000/api/admin/login', credentials)
      .subscribe({
        next: res => {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/admin/dashboard']);
        },
        error: () => {
          alert('Invalid credentials');
        }
      });
  }
}

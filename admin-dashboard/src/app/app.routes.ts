import { Routes } from '@angular/router';
import { AdminLogin } from './admin-login/admin-login';
import { AdminDashboard } from './admin-dashboard/admin-dashboard'; 

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AdminLogin },

  {
    path: 'admin',
    component: AdminDashboard,
    children: [
      { path: 'dashboard', component: AdminDashboard, data: { tab: 'dashboard' } },
      { path: 'students', component: AdminDashboard, data: { tab: 'students' } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

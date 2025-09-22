import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AdminGuard } from './admin.guard';
import { UserGuard } from './user.guard';
import { ManagerGuard } from './manager.guard'; // Import the ManagerGuard
import { AdminComponent } from './admin/admin.component';
import { ProjectMasterComponent } from './project-master/project-master.component';
import { AuthRedirectComponent } from './auth-redirect/auth-redirect.component';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { ReportsComponent } from './reports/reports.component';

export const routes: Routes = [
  { path: '', component: AuthRedirectComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Admin Section
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard],
    children: [
      { path: 'adminDashboard', component: AdminDashboardComponent },
      { 
        path: 'kanbanView', 
        loadComponent: () => 
          import('./kanban-view/kanban-view.component').then(
            m => m.KanbanViewComponent
          ) 
      },
      { path: 'listproject', component: ProjectMasterComponent },
      {
        path: 'listemployee',
        loadComponent: () =>
          import('./employee/employee.component').then(
            m => m.EmployeeComponent
          )
      },
      { path: 'registration', component: RegisterComponent },
      {
        path: 'listactivity',
        loadComponent: () =>
          import('./activity-master/activity-master.component').then(
            m => m.ActivityMasterComponent
          )
      },
      { 
        path: 'reports', 
        component: ReportsComponent 
      },
      { path: '', redirectTo: 'adminDashboard', pathMatch: 'full' }
    ]
  },

  // Manager Section (with same functionality as Admin)
  {
    path: 'manager',
    component: AdminComponent, // Using the same component as admin
    canActivate: [ManagerGuard],
    children: [
      { path: 'dashboard', component: ManagerDashboardComponent },
      { 
        path: 'kanbanView', 
        loadComponent: () => 
          import('./kanban-view/kanban-view.component').then(
            m => m.KanbanViewComponent
          ) 
      },
      { path: 'listproject', component: ProjectMasterComponent },
      {
        path: 'listemployee',
        loadComponent: () =>
          import('./employee/employee.component').then(
            m => m.EmployeeComponent
          )
      },
      { path: 'registration', component: RegisterComponent },
      {
        path: 'listactivity',
        loadComponent: () =>
          import('./activity-master/activity-master.component').then(
            m => m.ActivityMasterComponent
          )
      },
      { 
        path: 'reports', 
        component: ReportsComponent 
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // User Section
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
    canActivate: [UserGuard]
  },
  // User Activity Master Route
{
  path: 'user/listactivity',
  loadComponent: () =>
    import('./activity-master/activity-master.component').then(
      m => m.ActivityMasterComponent
    ),
  canActivate: [UserGuard]
},
  // Add User Kanban View Route
  {
    path: 'user/kanbanView',
    loadComponent: () => 
      import('./kanban-view/kanban-view.component').then(
        m => m.KanbanViewComponent
      ),
    canActivate: [UserGuard]
  },

  // Wildcard route
  { path: '**', redirectTo: '' }
];
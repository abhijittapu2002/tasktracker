import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-auth-redirect',
  // imports: [],
  // templateUrl: './auth-redirect.component.html',
  // styleUrl: './auth-redirect.component.css'
   standalone: true,
  template: ``, // empty: we immediately redirect
})
export class AuthRedirectComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  // auth-redirect.component.ts
ngOnInit() {
  if (this.authService.isAuthenticated()) {
    const role = this.authService.getUserRole();
    // Add slight delay to ensure all services are initialized
    setTimeout(() => {
      switch (role) {
        case 'ROLE_ADMIN':
          this.router.navigate(['/admin/adminDashboard']); // Changed from mainpage to adminDashboard
          break;
        case 'ROLE_MANAGER':
          this.router.navigate(['/manager/dashboard']);
          break;
        case 'ROLE_USER':
          this.router.navigate(['/user-dashboard']);
          break;
        default:
          this.router.navigate(['/login']);
      }
    }, 100);
  } else {
    this.router.navigate(['/login']);
  }
}
}
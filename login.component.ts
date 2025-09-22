import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, NgIf, RouterModule,CommonModule]
})
export class LoginComponent {
  loginData = { username: '', password: '' };
  errorMessage: string = '';

  // 👁️ Properties for toggling visibility
  showPassword: boolean = false;
  //showUsername: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Username and password are required!';
      return;
    }

    this.authService.login(this.loginData.username, this.loginData.password).subscribe({
      next: response => {
        if (response.token && response.roles?.length > 0) {
          const role = response.roles[0].toUpperCase();
          this.authService.setUserDetails(response.token, response.username, response.roles);

          switch (role) {
            case 'ROLE_ADMIN':
              this.router.navigate(['/admin/adminDashboard']);
              break;
            case 'ROLE_MANAGER':
              this.router.navigate(['/manager/dashboard']);
              break;
            case 'ROLE_USER':
              this.router.navigate(['/user-dashboard']);
              break;
            default:
              this.errorMessage = 'Unknown role. Contact administrator.';
          }
        } else {
          this.errorMessage = 'Invalid response from server.';
        }
      },
      error: err => {
        this.errorMessage =
          err.status === 401
            ? 'Invalid username or password.'
            : 'Something went wrong. Please try again.';
      }
    });
  }
}

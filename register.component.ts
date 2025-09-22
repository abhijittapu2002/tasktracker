import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, NgIf]
})
export class RegisterComponent {
  registerData = {
    userId: null,
    username: '',
    email: '',
    password: '',
    role: 'USER',
    dob: '', // New field
    employeeCode: '', // New field
    joiningDate: '', // New field
    phone: '' // New field
  };

  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    // Validate all required fields
    if (
      !this.registerData.userId ||
      !this.registerData.username ||
      !this.registerData.email ||
      !this.registerData.password ||
      !this.registerData.dob ||
      !this.registerData.employeeCode ||
      !this.registerData.joiningDate ||
      !this.registerData.phone
    ) {
      this.errorMessage = 'All fields are required!';
      this.successMessage = '';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    console.log('Registering user:', this.registerData);

    this.authService.register(this.registerData).subscribe({
      next: response => {
        console.log('Registration successful:', response);
        this.successMessage = response || '✅ Registration successful! Redirecting to employee list...';
        this.errorMessage = '';
        this.isSubmitting = false;

        setTimeout(() => {
          this.router.navigate(['/admin/listemployee']);
        }, 1000);
      },
      error: err => {
        console.error('Registration failed:', err);
        this.errorMessage = err?.error?.message || err?.message || '❌ Registration failed. Please try again.';
        this.successMessage = '';
        this.isSubmitting = false;
      }
    });
  }
}
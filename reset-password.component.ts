import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  imports: [FormsModule, NgIf, RouterModule]
})
export class ResetPasswordComponent {
  resetData = { email: '', otp: '', newPassword: '' };
  errorMessage: string = '';
  successMessage: string = '';
  otpRequested: boolean = false; // ✅ Controls step change

  constructor(private http: HttpClient, private router: Router) {}

  /** ✅ Request Password Reset */
  onRequestReset() {
    this.errorMessage = '';
    this.successMessage = '';
  
    this.http.post('http://localhost:8080/reset/request-password-reset', { email: this.resetData.email }, { responseType: 'text' }) // ✅ Add `{ responseType: 'text' }`
      .subscribe({
        next: (response: string) => { // ✅ Handle text response
          console.log('✅ OTP Sent:', response);
          this.successMessage = response; // ✅ Display backend response text
          this.otpRequested = true; // ✅ Transition to Step 2
        },
        error: err => {
          this.errorMessage = 'Failed to send reset email. Please try again.';
          console.error('❌ Error:', err);
        }
      });
  }

  /** ✅ Confirm Password Reset */
  onConfirmReset() {
    this.http.post('http://localhost:8080/reset/confirm-password-reset', this.resetData, { responseType: 'text' }) // ✅ Expect text response
      .subscribe({
        next: () => {
          this.successMessage = 'Password successfully reset! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']); // ✅ Instant redirection to login page
          }, 2000);
        },
        error: err => {
          this.errorMessage = 'Failed to reset password. Check OTP or try again.';
          console.error('❌ Error:', err);
        }
      });
  }
}

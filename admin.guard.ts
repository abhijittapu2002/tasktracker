
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const userRole = localStorage.getItem('userRole');
    console.log('AdminGuard - Stored Role:', userRole); // ✅ Log for debugging

    if (userRole === 'ROLE_ADMIN') {
      return true; // Allow access
    } else {
      console.log('AdminGuard - Not authorized, redirecting...');
      this.router.navigate(['/']); // Redirect back to login
      return false;
    }
  }
}

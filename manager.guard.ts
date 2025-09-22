import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ManagerGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const userRole = localStorage.getItem('userRole');
    console.log('ManagerGuard - Stored Role:', userRole);

    if (userRole === 'ROLE_MANAGER') {
      return true; // Allow access
    } else {
      console.log('ManagerGuard - Not authorized, redirecting...');
      this.router.navigate(['/']); // Redirect back to login
      return false;
    }
  }
}
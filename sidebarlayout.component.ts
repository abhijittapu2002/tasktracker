import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebarlayout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebarlayout.component.html',
  styleUrl: './sidebarlayout.component.css'
})
export class SidebarlayoutComponent implements OnInit {

  isLoggedIn = false;
  username: string | null = null;

  isAdmin = false;
  isManager = false;
  isUser = false;
  sidebarOpen = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
  this.authService.isLoggedIn$.subscribe((status: boolean) => {
    this.isLoggedIn = status;
    this.username = this.authService.getUsername();
  });

  // ✅ Listen for user role updates
  this.authService.getUserRole$().subscribe((role: string | null) => {
    this.isAdmin = role === 'ROLE_ADMIN';
    this.isManager = role === 'ROLE_MANAGER';
    this.isUser = role === 'ROLE_USER';
  });
}
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /** ✅ Improved sidebar toggle logic */
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    console.log("Sidebar toggled:", this.sidebarOpen);
  }
}
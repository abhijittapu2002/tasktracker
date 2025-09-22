import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EmployeeComponent implements OnInit {
  employees: any[] = [];
  selectedEmployee: any = null;

  constructor(
    private employeeService: EmployeeService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllEmployees();
  }

  getAllEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (response) => {
        this.employees = response;
        console.log('Employees fetched:', this.employees);
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
      }
    });
  }

  goToAddEmployee(): void {
    this.router.navigate(['/register']);
  }

 confirmDelete(id: number) {
  const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
  if (confirmDelete) {
    this.deleteEmployee(id);
  }
}
deleteEmployee(id: number) {
  console.log("Deleting employee with ID:", id);
  this.employeeService.deleteEmployee(id).subscribe({
    next: () => {
      console.log("Deleted successfully");
      this.employees = this.employees.filter(emp => emp.userId !== id);

    },
    error: err => {
      console.error("Error deleting employee:", err);
    }
  });
}


  onRowDoubleClick(employee: any): void {
    this.selectedEmployee = { ...employee }; // Create a copy to avoid two-way binding on the table
  }

  updateEmployee(): void {
    if (!this.selectedEmployee || !this.selectedEmployee.userId) return;

    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`http://localhost:8080/api/users/${this.selectedEmployee.userId}`, this.selectedEmployee, { headers }).subscribe({
      next: (updated) => {
        const index = this.employees.findIndex(emp => emp.userId === this.selectedEmployee.userId);
        if (index !== -1) {
          this.employees[index] = { ...this.selectedEmployee };
        }
        console.log('Employee updated successfully.');
        this.selectedEmployee = null;
      },
      error: (err) => {
        console.error('Error updating employee:', err);
      }
    });
  }

  cancelEdit(): void {
    this.selectedEmployee = null;
  }
}

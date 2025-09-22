import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-master',
  templateUrl: './project-master.component.html',
  imports: [FormsModule, CommonModule],
})
export class ProjectMasterComponent implements OnInit {
  projects: any[] = [];
  newProject: any = this.initProject();
  isEditing = false;
  showForm = false;
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  paginatedProjects: any[] = [];
  
  // Expose Math to template
  Math = Math;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  initProject() {
    return {
      projId: null,
      projName: '',
      projDesc: '',
      startDate: '',
      endDate: ''
    };
  }

  toggleForm() {
    this.newProject = this.initProject();
    this.isEditing = false;
    this.showForm = !this.showForm;
  }

  loadProjects() {
    this.projectService.getAllProjects().subscribe(data => {
      this.projects = data as any[];
      this.updatePagination(); // Update pagination after loading projects
    });
  }

  submitProject() {
    if (this.isEditing) {
      this.projectService.updateProject(this.newProject.projId, this.newProject).subscribe(() => {
        this.loadProjects();
        this.resetForm();
      });
    } else {
      this.projectService.createProject(this.newProject).subscribe(() => {
        this.loadProjects();
        this.resetForm();
      });
    }
  }

  editProject(project: any) {
    this.newProject = { ...project };
    this.isEditing = true;
    this.showForm = true;
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.newProject = this.initProject();
    this.isEditing = false;
    this.showForm = false;
  }

  deleteProject(id: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe({
        next: (res) => {
          this.loadProjects();
        },
        error: (err) => {
          console.error('Delete Error:', err);
          alert('Failed to delete project. You can not delete this project');
        }
      });
    }
  }

  // Pagination methods
  updatePagination(): void {
    this.totalItems = this.projects.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    
    // Calculate paginated projects
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedProjects = this.projects.slice(startIndex, startIndex + this.pageSize);
  }

  // Page navigation methods
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  // Generate page numbers for pagination controls
  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're at the beginning
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Helper methods for template display
  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }
}
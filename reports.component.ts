import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../services/project.service';
import { ActivityMasterService } from '../services/activity-master.service';
import { DataService } from '../services/data.service';
import { DocumentService } from '../services/document.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentModalComponent } from '../document-modal/document-modal.component';
import { SubActivityService } from '../services/sub-activity.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class ReportsComponent implements OnInit {
  projects: any[] = [];
  activities: any[] = [];
  filteredActivities: any[] = [];
  selectedProject: any = null;
  selectedActivity: any = null;
  activityTasks: any[] = [];
  activityDocuments: any[] = [];

  // Subactivities properties
  subActivities: any[] = [];
  selectedActivityId: number | null = null;
  selectedSubActivity: any = null;
  showSubActivityFormFlag: boolean = false;
  subActivityForm: FormGroup;
  performanceData: any = null;

  constructor(
    private projectService: ProjectService,
    private activityService: ActivityMasterService,
    private dataService: DataService,
    private documentService: DocumentService,
    private subActivityService: SubActivityService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    // Initialize the subactivity form to match Activity Master component
    this.subActivityForm = this.fb.group({
      subActId: [''],
      subActName: ['', Validators.required],
      subActDesc: [''],
      status: ['PENDING'],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadActivities();
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe(data => {
      this.projects = data;
    });
  }

  loadActivities(): void {
    this.activityService.getActivities().subscribe(data => {
      this.activities = data;
    });
  }

  onProjectChange(event: any): void {
    const projectId = event.target.value;
    
    if (!projectId) {
      this.selectedProject = null;
      this.filteredActivities = [];
      return;
    }
    
    this.selectedProject = this.projects.find(p => p.projId == projectId);
    this.filterActivitiesByProject(projectId);
  }

  filterActivitiesByProject(projectId: number): void {
    this.filteredActivities = this.activities.filter(
      activity => activity.project?.projId == projectId
    );
  }

  getActiveActivitiesCount(): number {
    return this.filteredActivities.filter(activity => activity.status).length;
  }

  viewActivityDetails(activity: any): void {
    this.selectedActivity = activity;
    this.loadActivityTasks(activity.actId);
    
    // Using vanilla JS to show modal since we're not importing NgBootstrap
    const modal = document.getElementById('activityDetailModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  viewFileDetails(activityId: number): void {
    console.log('Fetching document for activityId:', activityId);

    this.documentService.getDocumentByActivityId(activityId).subscribe(
      (docArray: any[]) => {
        console.log('Fetched doc:', docArray);

        if (!docArray || docArray.length === 0) {
          alert('No document uploaded for this activity.');
          return;
        }

        const modalRef = this.modalService.open(DocumentModalComponent, { size: 'lg' });
        modalRef.componentInstance.documents = docArray;
      },
      (error) => {
        console.error('Error fetching document:', error);
        alert('Failed to fetch document details.');
      }
    );
  }

  loadActivityTasks(activityId: number): void {
    this.dataService.getData().subscribe(
      (tasks: any[]) => {
        this.activityTasks = tasks.filter(task => task.activity?.actId === activityId);
        console.log('Activity tasks:', this.activityTasks);
      },
      error => {
        console.error('Error fetching tasks:', error);
        this.activityTasks = [];
      }
    );
  }

  getPriorityText(priority: number): string {
    switch(priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Not Set';
    }
  }

  exportToCSV(): void {
    if (this.filteredActivities.length === 0) return;

    const headers = ['Activity ID', 'Name', 'Description', 'Status'];
    const csvData = this.filteredActivities.map(activity => [
      activity.actId,
      activity.actName,
      activity.actDesc,
      activity.status ? 'Active' : 'Inactive'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.selectedProject.projName}_Activities.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /** ========== SUBACTIVITY METHODS ========== */

  // View subactivities for a specific activity
  viewSubActivities(actId: number): void {
    this.selectedActivityId = actId;
    this.showSubActivityFormFlag = false;
    this.selectedSubActivity = null;
    
    // Load subactivities
    this.subActivityService.getSubActivitiesByActivity(actId).subscribe({
      next: (data: any[]) => {
        this.subActivities = data;
        
        // Load performance data
        this.loadPerformanceData(actId);
        
        const modalElement = document.getElementById('subActivityModal');
        if (modalElement) {
          const modal = new (window as any).bootstrap.Modal(modalElement);
          modal.show();
        }
      },
      error: (err: any) => {
        console.error('Error fetching subactivities:', err);
        alert('Failed to load subactivities');
      }
    });
  }

  loadPerformanceData(actId: number): void {
    // Assuming you have a method in your service to get performance data
    // If not, you'll need to implement this in your service
    this.subActivityService.getPerformanceData(actId).subscribe({
      next: (data: any) => {
        this.performanceData = data;
      },
      error: (err: any) => {
        console.error('Error fetching performance data:', err);
        // Set default values if API fails
        this.performanceData = {
          totalSubActivities: this.subActivities.length,
          completedSubActivities: this.subActivities.filter(sa => sa.status === 'COMPLETED').length,
          weightagePercentage: this.subActivities.length > 0 
            ? (this.subActivities.filter(sa => sa.status === 'COMPLETED').length / this.subActivities.length) * 100
            : 0
        };
      }
    });
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 80) return '#28a745'; // Green for high completion
    if (percentage >= 50) return '#ffc107'; // Yellow for medium completion
    if (percentage >= 20) return '#fd7e14'; // Orange for low completion
    return '#dc3545'; // Red for very low completion
  }

  // Show the subactivity form
  showSubActivityForm(): void {
    this.showSubActivityFormFlag = true;
    this.selectedSubActivity = null;
    this.subActivityForm.reset({ 
      status: 'PENDING',
      startDate: null,
      endDate: null
    });
  }

  // Cancel the subactivity form
  cancelSubActivityForm(): void {
    this.showSubActivityFormFlag = false;
    this.selectedSubActivity = null;
  }

  // Handle double-click on subactivity row for editing
  onEditSubActivity(subActivity: any): void {
    this.selectedSubActivity = subActivity;
    
    // Format dates for datetime-local input (same as Activity Master)
    const formattedSubActivity = {
      ...subActivity,
      startDate: this.formatDateForInput(subActivity.startDate),
      endDate: this.formatDateForInput(subActivity.endDate)
    };
    
    this.subActivityForm.patchValue(formattedSubActivity);
    this.showSubActivityFormFlag = true;
  }

  // Submit the subactivity form (create or update)
  submitSubActivityForm(): void {
    if (this.subActivityForm.valid && this.selectedActivityId) {
      const formData = {
        ...this.subActivityForm.value,
        activity: { actId: this.selectedActivityId }
      };

      // Convert datetime-local strings to proper date format (same as Activity Master)
      if (formData.startDate) {
        formData.startDate = new Date(formData.startDate).toISOString();
      }
      if (formData.endDate) {
        formData.endDate = new Date(formData.endDate).toISOString();
      }

      if (this.selectedSubActivity) {
        // Update existing subactivity
        this.subActivityService.updateSubActivity(formData.subActId, formData).subscribe({
          next: (response: any) => {
            this.viewSubActivities(this.selectedActivityId!);
            this.showSubActivityFormFlag = false;
            this.selectedSubActivity = null;
            alert('SubActivity updated successfully!');
          },
          error: (err: any) => {
            console.error('Error updating subactivity:', err);
            alert('Failed to update subactivity: ' + (err.error?.message || err.message));
          }
        });
      } else {
        // Create new subactivity
        this.subActivityService.createSubActivity(formData).subscribe({
          next: (response: any) => {
            this.viewSubActivities(this.selectedActivityId!);
            this.showSubActivityFormFlag = false;
            alert('SubActivity created successfully!');
          },
          error: (err: any) => {
            console.error('Error creating subactivity:', err);
            alert('Failed to create subactivity: ' + (err.error?.message || err.message));
          }
        });
      }
    }
  }

  // Delete a subactivity
  deleteSubActivity(subActId: number): void {
    if (confirm('Are you sure you want to delete this SubActivity?')) {
      this.subActivityService.deleteSubActivity(subActId).subscribe({
        next: () => {
          if (this.selectedActivityId) {
            this.viewSubActivities(this.selectedActivityId);
          }
          alert('SubActivity deleted successfully!');
        },
        error: (err: any) => {
          console.error('Error deleting subactivity:', err);
          alert('Failed to delete SubActivity');
        }
      });
    }
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  // Format date for input fields (datetime-local) - same as Activity Master
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }
}
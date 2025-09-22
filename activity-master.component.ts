import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../services/project.service';
import { ActivityMasterService } from '../services/activity-master.service';
import { SubActivityService } from '../services/sub-activity.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-master',
  standalone: true,
  templateUrl: './activity-master.component.html',
  styleUrls: ['./activity-master.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class ActivityMasterComponent implements OnInit {
  activities: any[] = [];
  projects: any[] = [];
  subActivities: any[] = [];
  selectedActivityId: number | null = null;
  activityForm: FormGroup;
  subActivityForm: FormGroup;
  selectedActivity: any = null;
  selectedSubActivity: any = null;
  showForm: boolean = false;
  showSubActivityFormFlag: boolean = false;
  performanceData: any = null;

  constructor(
    private activityService: ActivityMasterService,
    private projectService: ProjectService,
    private subActivityService: SubActivityService,
    private fb: FormBuilder
  ) {
    this.activityForm = this.fb.group({
      actId: [''],
      actName: [''],
      actDesc: [''],
      status: [true],
      project: this.fb.group({
        projId: ['']
      })
    });

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
    this.loadActivities();
    this.loadProjects();
  }

  loadActivities(): void {
    this.activityService.getActivities().subscribe((data: any[]) => {
      this.activities = data;
    });
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe((data: any[]) => {
      this.projects = data;
    });
  }

  openCreateForm(): void {
    this.resetForm();
    this.showForm = true;
  }

  submitForm(): void {
    const formData = this.activityForm.value;

    if (this.selectedActivity) {
      this.activityService.updateActivity(formData.actId, formData).subscribe(() => {
        this.loadActivities();
        this.resetForm();
      });
    } else {
      this.activityService.createActivity(formData).subscribe(() => {
        this.loadActivities();
        this.resetForm();
      });
    }
  }

  resetForm(): void {
    this.activityForm.reset({ status: true, project: { projId: '' } });
    this.selectedActivity = null;
    this.showForm = false;
  }

  onEdit(activity: any): void {
    this.selectedActivity = activity;
    this.activityForm.patchValue(activity);
    this.showForm = true;
  }

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

  showSubActivityForm(): void {
    this.showSubActivityFormFlag = true;
    this.selectedSubActivity = null;
    this.subActivityForm.reset({ 
      status: 'PENDING',
      startDate: null,
      endDate: null
    });
  }

  cancelSubActivityForm(): void {
    this.showSubActivityFormFlag = false;
    this.selectedSubActivity = null;
  }

  onEditSubActivity(subActivity: any): void {
    this.selectedSubActivity = subActivity;
    
    // Format dates for datetime-local input
    const formattedSubActivity = {
      ...subActivity,
      startDate: this.formatDateForInput(subActivity.startDate),
      endDate: this.formatDateForInput(subActivity.endDate)
    };
    
    this.subActivityForm.patchValue(formattedSubActivity);
    this.showSubActivityFormFlag = true;
  }

  submitSubActivityForm(): void {
    if (this.subActivityForm.valid && this.selectedActivityId) {
      const formData = {
        ...this.subActivityForm.value,
        activity: { actId: this.selectedActivityId }
      };

      // Convert datetime-local strings to proper date format
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

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  deleteActivity(id: number) {
    if (confirm('Are you sure you want to delete this Activity?')) {
      this.activityService.deleteActivity(id).subscribe({
        next: (res: any) => {
          this.loadActivities();
        },
        error: (err: any) => {
          console.error('Delete Error:', err);
          alert('Failed to delete Activity. You cannot delete this Activity');
        }
      });
    }
  }

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
}
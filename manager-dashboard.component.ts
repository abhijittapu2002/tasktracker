import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentModalComponent } from '../document-modal/document-modal.component';
import { AuthService } from '../services/auth.service';
import { DocumentService } from '../services/document.service';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { RemarksService } from '../remarks.service';
import { RemarksModalComponent } from '../remarks-modal/remarks-modal.component';
import { SubActivityService } from '../services/sub-activity.service';

@Component({ 
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ReactiveFormsModule]
})
export class ManagerDashboardComponent implements OnInit {
  title = 'angular-http-example';
  data: any[] = [];
  
  // Categorized task arrays
  importantUrgent: any[] = [];
  importantNotUrgent: any[] = [];
  notImportantUrgent: any[] = [];
  notImportantNotUrgent: any[] = [];

  isModalOpen: boolean = false;
  userLookup: { [key: string]: number } = {};
  username: string = '';            // Logged-in username
  selectedEmployee: string = '';    // Employee selected from dropdown
  _EmpList: any[] = [];             // All users (for manager dropdown)
  isManager: boolean = false;

  // Subactivities properties
  subActivities: any[] = [];
  selectedActivityId: number | null = null;
  selectedSubActivity: any = null;
  showSubActivityFormFlag: boolean = false;
  subActivityForm: FormGroup;
  performanceData: any = null;

  constructor(
    private dataService: DataService,
    private modalService: NgbModal,
    private authService: AuthService,
    private documentService: DocumentService,
    private remarksService: RemarksService,
    private router: Router,
    private subActivityService: SubActivityService,
    private fb: FormBuilder
  ) {
    // Initialize the subactivity form
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
    this.fetchLoggedInUsername();
    this.isManager = this.authService.isManager(); // ✅ Check manager role
    this.loadUsers(); // ✅ Load users if manager

    setTimeout(() => {
      this.selectedEmployee = this.username; // ✅ Default: show own tasks
      this.loadTasks();
    }, 0);
  }

  navigateToKanbanView(): void {
    // Check if an employee is selected
    if (this.selectedEmployee) {
      this.router.navigate(['/manager/kanbanView'], { 
        queryParams: { user: this.selectedEmployee } 
      });
    } else {
      // Navigate without user parameter if no employee is selected
      this.router.navigate(['/manager/kanbanView']);
    }
  }

  fetchLoggedInUsername(): void {
    this.username = this.authService.getUsername() || 'Guest';
    console.log('Logged-in Username:', this.username);
  }

  /** ✅ Load all tasks, filter based on selectedEmployee */
  loadTasks(): void {
    this.dataService.getData().subscribe(
      (response: any[]) => {
        let tasksToDisplay = response;
        console.log('Fetched Tasks:', tasksToDisplay);

        // ✅ Filter tasks by selected employee
        if (this.selectedEmployee) {
          tasksToDisplay = response.filter(
            task => task.user.username === this.selectedEmployee
          );
        } else {
          tasksToDisplay = response.filter(
            task => task.user.username === this.username
          );
        }

        const currentDate = new Date();

        // ✅ Format each task properly
        tasksToDisplay.forEach(task => {
          task.urgent = (task.urgent === true || task.urgent === 'true');
          task.important = (task.important === true || task.important === 'true');

          // ✅ Attach docName if document exists
          if (task.originalFileName && task.docPath) {
            task.docName = task.originalFileName;
          }
        });

        // ✅ Helper to determine urgency by end date
        const isTaskUrgent = (task: any): boolean => {
          return task.urgent || this.isUrgent(task.endtime, currentDate);
        };

        const sortByEndDateAndPriority = (a: any, b: any): number => {
          const dateA = new Date(a.endtime).getTime();
          const dateB = new Date(b.endtime).getTime();

          if (dateA !== dateB) {
            return dateA - dateB; // Earlier end date comes first
          }

          return a.priority - b.priority; // If end dates are equal, sort by priority
        };

        this.importantUrgent = tasksToDisplay
          .filter(task => task.important && isTaskUrgent(task))
          .sort(sortByEndDateAndPriority);

        this.importantNotUrgent = tasksToDisplay
          .filter(task => task.important && !isTaskUrgent(task))
          .sort(sortByEndDateAndPriority);

        this.notImportantUrgent = tasksToDisplay
          .filter(task => !task.important && isTaskUrgent(task))
          .sort(sortByEndDateAndPriority);

        this.notImportantNotUrgent = tasksToDisplay
          .filter(task => !task.important && !isTaskUrgent(task))
          .sort(sortByEndDateAndPriority);
      },
      error => {
        console.error('Error fetching tasks:', error);
      }
    );
  }

  isUrgent(endtime: string, currentDate: Date): boolean {
    const endTime = new Date(endtime);
    const timeDiff = endTime.getTime() - currentDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 7;
  }

  /** ✅ Open modal and pass selectedEmployee for task assignment */
  openModal(task?: any): void {
    this.isModalOpen = true;
    const modalRef = this.modalService.open(TaskModalComponent);

    modalRef.componentInstance.task = task ? { ...task } : null;

    // ✅ Get userId from userLookup using selectedEmployee username
    modalRef.componentInstance.assignedUserId = this.userLookup[this.selectedEmployee] || null;

    modalRef.result.then(
      result => {
        if (result === 'Task updated' || result === 'Task created') {
          this.loadTasks();
        }
        this.isModalOpen = false;
      },
      reason => {
        console.log('Modal dismissed');
        this.isModalOpen = false;
      }
    );
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.dataService.deleteTask(id).subscribe(
        () => {
          console.log('Task deleted');
          this.loadTasks();
        },
        (error: any) => {
          console.error('Error deleting task:', error);
        }
      );
    }
  }

  onTaskDoubleClick(task: any): void {
    this.openModal(task);
  }

  getSerialNumber(index: number, arrayName: string): number {
    return index + 1;
  }

  /** ✅ Manager: Load all usernames */
  loadUsers(): void {
    this.authService.getAllUsers().subscribe(
      (users: any[]) => {
        this._EmpList = users; // ✅ Store full user objects

        // ✅ Create lookup object
        users.forEach(user => {
          this.userLookup[user.username] = user.userId;
        });

        console.log('User List:', this._EmpList);
        console.log('User Lookup:', this.userLookup);
      },
      error => {
        console.error('Error loading users:', error);
      }
    );
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
        modalRef.componentInstance.documents = docArray; // ✅ Pass the full array
      },
      (error) => {
        console.error('Error fetching document:', error);
        alert('Failed to fetch document details.');
      }
    );
  }

  viewRemarks(activityId: number): void {
    this.remarksService.getRemarksByActivityId(activityId).subscribe({
      next: (res) => {
        console.log('Remarks response:', res);
        const modalRef = this.modalService.open(RemarksModalComponent, { size: 'lg' });
        modalRef.componentInstance.remarksList = res;
        modalRef.componentInstance.activityId = activityId;

        const userId = this.userLookup[this.selectedEmployee];
        console.log('Passing userId to modal:', userId); // ✅ Debug log

        modalRef.componentInstance.userId = userId;
      },
      error: (err) => {
        console.error('Failed to load remarks:', err);
        alert('Failed to load remarks.');
      }
    });
  }

  selectedCategory: string | null = null;

  toggleCategoryView(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? null : category;
  }

  // View subactivities for a specific activity
  viewSubActivities(actId: number): void {
    this.selectedActivityId = actId;
    this.showSubActivityFormFlag = false;
    this.selectedSubActivity = null;
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
    
    // Format dates for datetime-local input
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

  // Format date for datetime-local input
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  // Add this method to load performance data
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

  // Add this method to get progress color based on percentage
  getProgressColor(percentage: number): string {
    if (percentage >= 80) return '#28a745'; // Green for high completion
    if (percentage >= 50) return '#ffc107'; // Yellow for medium completion
    if (percentage >= 20) return '#fd7e14'; // Orange for low completion
    return '#dc3545'; // Red for very low completion
  }
}
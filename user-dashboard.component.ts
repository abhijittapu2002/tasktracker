import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentService } from '../services/document.service';
import { DocumentModalComponent } from '../document-modal/document-modal.component';
import { RemarksModalComponent } from '../remarks-modal/remarks-modal.component';
import { RemarksService } from '../remarks.service';
import { Router } from '@angular/router';
import { SubActivityService } from '../services/sub-activity.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  title = 'User Dashboard';

  // Logged-in and selected user info
  username: string = '';
  selectedEmployee: string = '';
  _EmpList: any[] = [];
  userLookup: { [key: string]: number } = {};

  // Categorized tasks
  importantUrgent: any[] = [];
  importantNotUrgent: any[] = [];
  notImportantUrgent: any[] = [];
  notImportantNotUrgent: any[] = [];

  // Subactivities properties
  subActivities: any[] = [];
  selectedActivityId: number | null = null;
  selectedSubActivity: any = null;
  showSubActivityFormFlag: boolean = false;
  subActivityForm: FormGroup;
performanceData: any = null;
  isModalOpen: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private modalService: NgbModal,
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

  navigateToKanbanView(): void {
    this.router.navigate(['/user/kanbanView']);
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    if (this.isAdmin) {
      this.username = this.authService.getUsername() || 'Guest';
      this.selectedEmployee = this.username;
      this.loadUsers();
      this.loadTasks();
    } else {
      this.authService.getCurrentUser().subscribe(
        user => {
          this.username = user.username;
          this.userLookup[user.username] = user.userId;
          this.selectedEmployee = user.username;
          this.loadTasks();
        },
        error => {
          console.error('Error fetching current user:', error);
        }
      );
    }
  }

  fetchLoggedInUsername(): void {
    this.username = this.authService.getUsername() || 'Guest';
    console.log('Logged-in Username:', this.username);
  }

  loadTasks(): void {
    this.dataService.getData().subscribe(
      (response: any[]) => {
        console.log('Fetched Data:', response);

        let tasksToDisplay = response;

        if (this.selectedEmployee) {
          tasksToDisplay = tasksToDisplay.filter(task => task.user?.username === this.selectedEmployee);
        }

        if (!this.isAdmin) {
          tasksToDisplay = tasksToDisplay.filter(task => task.status.sttStatus !== 'Completed');
        }

        tasksToDisplay.forEach(task => {
          task.urgent = (task.urgent === true || task.urgent === 'true');
          task.important = (task.important === true || task.important === 'true');

          if (task.originalFileName && task.docPath) {
            task.docName = task.originalFileName;
          }
        });

        const currentDate = new Date();

        const isTaskUrgent = (task: any): boolean => {
          return task.urgent || this.isUrgent(task.endtime, currentDate);
        };

        const sortByEndDateAndPriority = (a: any, b: any): number => {
          const dateA = new Date(a.endtime).getTime();
          const dateB = new Date(b.endtime).getTime();

          if (dateA !== dateB) {
            return dateA - dateB;
          }

          return a.priority - b.priority;
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
      (error: any) => {
        console.error('Error loading tasks:', error);
      }
    );
  }

  isUrgent(endtime: string, currentDate: Date): boolean {
    const endTime = new Date(endtime);
    const timeDiff = endTime.getTime() - currentDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 7;
  }

  openModal(task?: any): void {
    const modalRef = this.modalService.open(TaskModalComponent);
    modalRef.componentInstance.task = task ? { ...task } : null;
    modalRef.componentInstance.assignedUserId = this.userLookup[this.selectedEmployee] || null;
    modalRef.componentInstance.isUserDashboard = true;
    modalRef.componentInstance.currentUserId = this.userLookup[this.username];
    modalRef.componentInstance.isEditing = !!task;

    modalRef.result.then(
      result => {
        if (result === 'Task updated' || result === 'Task created') {
          this.loadTasks();
        }
      },
      reason => {
        console.log('Modal dismissed');
      }
    );
  }

  onTaskDoubleClick(task: any): void {
    this.openModal(task);
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe(
      (users: any[]) => {
        this._EmpList = users;
        users.forEach(user => {
          this.userLookup[user.username] = user.userId;
        });
        console.log('Users:', this._EmpList);
      },
      error => {
        console.error('Error loading users:', error);
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

  getSerialNumber(index: number, arrayName: string): number {
    return index + 1;
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

  viewRemarks(activityId: number): void {
    this.remarksService.getRemarksByActivityId(activityId).subscribe({
      next: (res) => {
        console.log('Remarks response:', res);
        const modalRef = this.modalService.open(RemarksModalComponent, { size: 'lg' });
        modalRef.componentInstance.remarksList = res;
        modalRef.componentInstance.activityId = activityId;

        const userId = this.userLookup[this.selectedEmployee];
        console.log('Passing userId to modal:', userId);

        modalRef.componentInstance.userId = userId;
      },
      error: (err) => {
        console.error('Failed to load remarks:', err);
        alert('Failed to load remarks.');
      }
    });
  }

  // View subactivities for a specific activity
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

  selectedCategory: string | null = null;

  toggleCategoryView(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? null : category;
  }

  // Add this property to your component class


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
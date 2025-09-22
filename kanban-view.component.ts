import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, CdkDrag, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { DocumentModalComponent } from '../document-modal/document-modal.component';
import { RemarksModalComponent } from '../remarks-modal/remarks-modal.component';
import { DocumentService } from '../services/document.service';
import { RemarksService } from '../remarks.service';
import { SubActivityService } from '../services/sub-activity.service';

@Component({
  selector: 'app-kanban-view',
  templateUrl: './kanban-view.component.html',
  styleUrls: ['./kanban-view.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, CdkDropListGroup, CdkDropList, CdkDrag]
})
export class KanbanViewComponent implements OnInit, OnDestroy {

  // Task containers
  pendingTasks: any[] = [];
  inProgressTasks: any[] = [];
  completedTasks: any[] = [];
  upcomingDeadlines: any[] = [];

  // Subactivities properties
  subActivities: any[] = [];
  selectedActivityId: number | null = null;
  selectedSubActivity: any = null;
  showSubActivityFormFlag: boolean = false;
  subActivityForm: FormGroup;
  performanceData: any = null;

  // Pagination
  tasksPerPage: number = 3;
  pendingPage: number = 0;
  inProgressPage: number = 0;
  completedPage: number = 0;

  // State
  isModalOpen: boolean = false;
  username: string = '';
  selectedEmployee: string = '';
  _EmpList: any[] = [];
  isAdmin: boolean = false;
  userLookup: { [key: string]: number } = {};

  // Rollback tracking
  private originalTaskPositions: {
    task: any,
    sourceArray: any[],
    sourceIndex: number
  } | null = null;

  private dataSubscription: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private modalService: NgbModal,
    private authService: AuthService,
    private documentService: DocumentService,
    private remarksService: RemarksService,
    private route: ActivatedRoute,
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
    this.username = this.authService.getUsername() || 'Guest';
    this.isAdmin = this.authService.isAdmin();
    console.log(
      'Logged-in user:', this.username,
      'Role →', this.authService.getUserRole(),
      'isAdmin →', this.isAdmin
    );

    // ✅ pick up query param
    this.route.queryParams.subscribe(params => {
      if (params['user']) {
        this.selectedEmployee = params['user'];
        console.log('Selected employee from query param:', this.selectedEmployee);
      }
      this.loadUsers();
      this.loadTasks();
    });
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
  }

  /** ========== TASKS ========== */

  loadTasks(): void {
    this.dataSubscription.unsubscribe();

    this.dataSubscription = this.dataService.getData().subscribe({
      next: (tasks: any[]) => {
        console.log('Fetched tasks:', tasks);

        let filteredTasks: any[] = [];

        if (this.isAdmin && this.selectedEmployee) {
          // ✅ Admin viewing a specific employee's tasks
          filteredTasks = tasks.filter(task =>
            task.user?.username?.toLowerCase() === this.selectedEmployee.toLowerCase()
          );
        } else if (this.isAdmin) {
          // ✅ Admin viewing all tasks
          filteredTasks = tasks;
        } else if (this.username) {
          // ✅ Normal user → only own tasks
          filteredTasks = tasks.filter(task =>
            task.user?.username?.toLowerCase() === this.username.toLowerCase()
          );
        }

        // Reset containers
        this.pendingTasks = [];
        this.inProgressTasks = [];
        this.completedTasks = [];
        this.upcomingDeadlines = [];

        filteredTasks.forEach(task => {
          const status = task.status?.sttStatus?.toLowerCase() || 'pending';

          if (status.includes('complete')) {
            this.completedTasks.push(task);
          } else if (status.includes('progress') || status.includes('working')) {
            this.inProgressTasks.push(task);
          } else {
            this.pendingTasks.push(task);
          }

          if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dueDate >= today) {
              const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              this.upcomingDeadlines.push({ ...task, daysLeft });
            }
          }
        });

        this.upcomingDeadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        this.upcomingDeadlines = this.upcomingDeadlines.slice(0, 5);

        console.log(`Tasks loaded → Admin: ${this.isAdmin}, Total: ${filteredTasks.length}`);
      },
      error: err => console.error('Error fetching tasks:', err)
    });
  }

  /** ========== PAGINATION ========== */

  getCurrentPageTasks(tasks: any[], page: number): any[] {
    const startIndex = page * this.tasksPerPage;
    return tasks.slice(startIndex, startIndex + this.tasksPerPage);
  }

  getTotalPages(tasks: any[]): number {
    return Math.ceil(tasks.length / this.tasksPerPage);
  }

  changePage(column: 'pending' | 'inProgress' | 'completed', direction: number): void {
    if (column === 'pending') this.pendingPage += direction;
    if (column === 'inProgress') this.inProgressPage += direction;
    if (column === 'completed') this.completedPage += direction;
  }

  /** ========== USERS ========== */

  loadUsers(): void {
    if (!this.isAdmin) return;

    this.authService.getAllUsers().subscribe({
      next: (users: any[]) => {
        this._EmpList = users;
        users.forEach(user => {
          this.userLookup[user.username] = user.userId;
        });
      },
      error: err => console.error('Error loading users:', err)
    });
  }

  /** ========== DRAG & DROP ========== */

  onDrop(event: CdkDragDrop<any[]>, targetStatus: 'pending' | 'inProgress' | 'completed'): void {
    this.originalTaskPositions = {
      task: event.previousContainer.data[event.previousIndex],
      sourceArray: event.previousContainer.data,
      sourceIndex: event.previousIndex
    };

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      const task = event.container.data[event.currentIndex];
      this.updateTaskStatus(task, targetStatus);
    }
  }

  updateTaskStatus(task: any, targetStatus: string): void {
    let newStatusId = 1;
    if (targetStatus === 'inProgress') newStatusId = 2;
    if (targetStatus === 'completed') newStatusId = 3;

    // Create a complete task object with only the status updated
    const statusUpdate = {
      id: task.id,
      actId: task.activity?.actId,
      userId: task.user?.userId,
      statusId: newStatusId, // This is the only change
      starttime: task.starttime,
      endtime: task.endtime,
      dueDate: task.dueDate,
      priority: task.priority,
      remarks: task.remarks,
      important: task.important,
      urgent: task.urgent,
      reportTo: task.reportTo
    };

    this.dataService.updateTask(statusUpdate).subscribe({
      next: () => {
        task.status.statusId = newStatusId;
        task.status.sttStatus = this.getStatusName(newStatusId);
        this.loadTasks();
        this.originalTaskPositions = null;
      },
      error: (err) => {
        console.error('Error updating task status:', err);
        this.revertTaskPosition();
        this.loadTasks();
      }
    });
  }

  private revertTaskPosition(): void {
    if (!this.originalTaskPositions) return;

    const { task, sourceArray, sourceIndex } = this.originalTaskPositions;
    const currentArray =
      this.pendingTasks.includes(task) ? this.pendingTasks :
      this.inProgressTasks.includes(task) ? this.inProgressTasks :
      this.completedTasks.includes(task) ? this.completedTasks : null;

    if (currentArray && sourceArray !== currentArray) {
      const currentIndex = currentArray.indexOf(task);
      if (currentIndex > -1) currentArray.splice(currentIndex, 1);
      sourceArray.splice(sourceIndex, 0, task);
    }

    this.originalTaskPositions = null;
  }

  getStatusName(statusId: number): string {
    switch (statusId) {
      case 1: return 'Pending';
      case 2: return 'In Progress';
      case 3: return 'Completed';
      default: return 'Pending';
    }
  }

  /** ========== MODALS ========== */

  openTaskModal(task?: any): void {
    this.isModalOpen = true;
    const modalRef = this.modalService.open(TaskModalComponent);

    modalRef.componentInstance.task = task ? { ...task } : null;
    modalRef.componentInstance.assignedUserId = this.userLookup[this.selectedEmployee] || null;

    modalRef.componentInstance.isEditing = !!task;
    modalRef.componentInstance.isUserDashboard = !this.authService.isAdmin();
    modalRef.result.then(
      result => {
        if (['Task updated', 'Task created'].includes(result)) this.loadTasks();
        this.isModalOpen = false;
      },
      () => this.isModalOpen = false
    );
  }

  viewFileDetails(activityId: number): void {
    this.documentService.getDocumentByActivityId(activityId).subscribe({
      next: (docs: any[]) => {
        if (!docs?.length) return alert('No document uploaded for this activity.');
        const modalRef = this.modalService.open(DocumentModalComponent, { size: 'lg' });
        modalRef.componentInstance.documents = docs;
      },
      error: err => {
        console.error('Error fetching document:', err);
        alert('Failed to fetch document details.');
      }
    });
  }

  viewRemarks(activityId: number): void {
    this.remarksService.getRemarksByActivityId(activityId).subscribe({
      next: (res) => {
        const modalRef = this.modalService.open(RemarksModalComponent, { size: 'lg' });
        modalRef.componentInstance.remarksList = res;
        modalRef.componentInstance.activityId = activityId;
        modalRef.componentInstance.userId = this.userLookup[this.selectedEmployee];
      },
      error: err => {
        console.error('Failed to load remarks:', err);
        alert('Failed to load remarks.');
      }
    });
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

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  /** ========== UI HELPERS ========== */

  getPriorityClass(priority: number): string {
    return priority === 1 ? 'priority-high' : priority === 2 ? 'priority-medium' : 'priority-low';
  }

  getPriorityText(priority: number): string {
    return priority === 1 ? 'High' : priority === 2 ? 'Medium' : 'Low';
  }

  getDaysLeftClass(daysLeft: number): string {
    if (daysLeft <= 1) return 'days-critical';
    if (daysLeft <= 3) return 'days-warning';
    return 'days-normal';
  }
}
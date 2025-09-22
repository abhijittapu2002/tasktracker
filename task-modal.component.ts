import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MasterDataService } from '../master-data.service';
import { DocumentService } from '../services/document.service';
import { AuthService } from '../services/auth.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css']
})
export class TaskModalComponent implements OnInit {
  @Input() task: any;
  @Input() assignedUserId: number | null = null;
  @Input() isUserDashboard: boolean = false; // New input
  @Input() currentUserId: number | null = null; // New input
  @Input() isEditing: boolean = false;

  masterActivities: any[] = [];
  userIdList: any[] = [];
  selectedFile: File | null = null;

  filteredActivities: any[] = [];
  projectList: any[] = [];
  statusList: any[] = [];

  constructor(
    private documentService: DocumentService,
    private dataService: DataService,
    private masterDataService: MasterDataService,
    private userIdService: AuthService,
    private projectService: ProjectService,
    public activeModal: NgbActiveModal
  ) { }

 ngOnInit(): void {
    if (this.task && this.task.id) {
      this.isEditing = true; // Set editing mode if task has ID
    }

    if (this.task) {
      if (this.task.activity?.actId) {
        this.task.actId = this.task.activity.actId;
      }
      if (this.task.user?.userId) {
        this.task.userId = this.task.user.userId;
      }
      if (this.task.activity?.project?.projId) {
        this.task.projId = this.task.activity.project.projId;
      }
      if (this.task.status?.statusId) {
        this.task.statusId = this.task.status.statusId;
      }
    } else {
      const now = new Date();
      const formattedNow = this.formatDateTimeLocal(now);
      
      this.task = {
        actId: null,
        projId: null,
        starttime: formattedNow,
        endtime: '',
        dueDate: '',
        statusId: null,
        priority: 0,
        remarks: '',
        important: false,
        urgent: false,
        userId: null,
        reportTo: '',
        docPath: '',
      };
    }

    // For user dashboard, set the user ID to current user and don't load user list
    if (this.isUserDashboard && this.currentUserId) {
      this.task.userId = this.currentUserId;
    } else {
      // Load user list only for admin
      this.userIdService.getAllUsers().subscribe(
        (userIds: any[]) => {
          this.userIdList = userIds;
          console.log('User IDs fetched:', this.userIdList);
          if (this.task.userId) {
            const match = this.userIdList.find(u => u.userId === this.task.userId);
            if (match) this.task.userId = match.userId;
          }
        },
        (error) => console.error('Error fetching user IDs:', error)
      );
    }

    this.masterDataService.getMasterActivities().subscribe(
      (activities: any[]) => {
        this.masterActivities = activities;
        console.log('All Activities:', this.masterActivities);
        this.filterActivitiesByProject();
      },
      (error) => console.error('Error fetching master activities:', error)
    );

    // Fetch projects
    this.projectService.getAllProjects().subscribe(
      (projects: any[]) => {
        this.projectList = projects;
      },
      (error) => console.error('Error fetching projects:', error)
    );
    
    // Fetch status
    this.masterDataService.getAllStatus().subscribe(
      (status: any[]) => {
        this.statusList = status;
      },
      (error) => console.error('Error fetching status:', error)
    );
  }
  // Helper function to format date for datetime-local input
  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  filterActivitiesByProject(): void {
    if (this.task.projId) {
      const projIdNum = Number(this.task.projId); // convert string to number
      console.log('Filtering for project:', projIdNum);
      this.filteredActivities = this.masterActivities.filter(
        activity => activity.project?.projId === projIdNum
      );
      console.log('Filtered activities:', this.filteredActivities);
    } else {
      this.filteredActivities = [];
    }
  }

  fetchActivityDetails(): void {
    if (this.task.actId) {
      this.masterDataService.getActivityById(this.task.actId).subscribe(
        (activity: any) => {
          this.task.projId = activity.project.projId;
        },
        (error) => console.error('Error fetching activity:', error)
      );
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

 onSubmit(): void {
    // For user dashboard, ensure the task is assigned to the current user
    if (this.isUserDashboard && this.currentUserId) {
      this.task.userId = this.currentUserId;
    } else if (!this.task.userId) {
      this.task.userId = this.assignedUserId;
    }

    // Ensure starttime is set to current time if not already set
    if (!this.task.starttime) {
      this.task.starttime = this.formatDateTimeLocal(new Date());
    }

    const uploadAndSubmitTask = () => {
      if (this.task.id == null) {
        this.dataService.createTask(this.task).subscribe(
          () => {
            this.activeModal.close('Task created');
            console.log('✅ Task successfully added');
          },
          (error) => console.error('❌ Error creating task:', error)
        );
      } else {
        this.dataService.updateTask(this.task).subscribe(
          () => {
            this.activeModal.close('Task updated');
            console.log('✅ Task successfully updated');
          },
          (error) => console.error('❌ Error updating task:', error)
        );
      }
    };

    if (this.selectedFile && this.task.actId) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('actId', this.task.actId.toString());

      this.documentService.uploadDocument(formData).subscribe(
        (response: any) => {
          console.log('✅ Document upload successful:', response);
          this.task.docPath = response.docPath;
          uploadAndSubmitTask();
        },
        (error: any) => {
          console.error('❌ Document upload failed:', error);
        }
      );
    } else {
      uploadAndSubmitTask();
    }
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-task-allocated',
  imports: [],
  templateUrl: './task-allocated.component.html',
  styleUrl: './task-allocated.component.css'
})
export class TaskAllocatedComponent {
  taskList: any[] = [
    { taskName: 'Task 1', status: 'In Progress' },
    { taskName: 'Task 2', status: 'Completed' },
    { taskName: 'Task 3', status: 'Not Started' }
  ];
  selectedTask: any = null;}

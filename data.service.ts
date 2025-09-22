import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

interface Data {
  id: number;
  slno: number;
  activityId: number;
  starttime: string;
  endtime: string;
  status: string;
  priority: number;
  remarks: string;
  important: boolean;
  urgent: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://localhost:8080/tasktracker';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('No JWT token found in local storage!');
      return new HttpHeaders();
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // ✅ Get tasks with filter
  getTasksByFilter(important: boolean, urgent: boolean): Observable<Data[]> {
    console.log(`Fetching tasks with important=${important} & urgent=${urgent}`);
    return this.http.get<Data[]>(
      `${this.apiUrl}/filter?important=${important}&urgent=${urgent}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  // ✅ Get all tasks
  getData(): Observable<Data[]> {
    console.log('Fetching all tasks...');
    return this.http.get<Data[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  // ✅ Get single task
  getSingleData(id: number): Observable<Data> {
    console.log(`Fetching task with ID: ${id}`);
    return this.http.get<Data>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Update task (UPDATED to handle any task object)
  updateTask(task: any): Observable<any> {
    console.log(`Updating task with ID: ${task.id}`);
    return this.http.put(`${this.apiUrl}/${task.id}`, task, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Create task (used when no file is uploaded)
  createTask(task: Data): Observable<any> {
    console.log(`Creating new task: ${JSON.stringify(task)}`);
    return this.http.post(this.apiUrl, task, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Delete task
  deleteTask(id: number): Observable<any> {
    console.log(`Deleting task with ID: ${id}`);
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Error Handler
  private handleError(error: HttpErrorResponse) {
    console.error(`HTTP Error (${error.status}):`, error.error);

    if (error.status === 0) {
      return throwError(() => new Error('Network error. Please check your connection.'));
    } else if (error.status === 401) {
      return throwError(() => new Error('Unauthorized request. Please log in again.'));
    } else if (error.status === 403) {
      return throwError(() => new Error('Access forbidden. You may not have permission.'));
    } else {
      return throwError(() => new Error(`Server error: ${error.status}. Please try again later.`));
    }
  }
  // Add this method to your DocumentService in data.service.ts
deleteDocument(documentId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/documents/delete/${documentId}`, { 
    responseType: 'text' 
  });
}
}
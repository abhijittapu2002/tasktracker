import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SubActivityService {
  private apiUrl = 'http://localhost:8080/subactivities';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('No JWT token found in local storage!');
      return new HttpHeaders();
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getSubActivitiesByActivity(actId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activity/${actId}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  createSubActivity(subActivity: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, subActivity, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Add this method to update a subactivity
  updateSubActivity(id: number, subActivity: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, subActivity, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  deleteSubActivity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

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
  // Add this to your SubActivityService
getPerformanceData(actId: number): Observable<any> {
  return this.http.get<any>(`http://localhost:8080/activities/${actId}/performance`);
}
}
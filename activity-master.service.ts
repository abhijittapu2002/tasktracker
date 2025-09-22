import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // ✅ Import AuthService

@Injectable({
  providedIn: 'root'
})
export class ActivityMasterService {
  private apiUrl = 'http://localhost:8080/activitymaster';

  constructor(
    private http: HttpClient,
    private authService: AuthService // ✅ Inject AuthService for JWT token
  ) {}

  /** ✅ Fetch all activities with Authorization header */
  getActivities(): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  /** ✅ Create a new activity */
  createActivity(activity: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<any>(this.apiUrl, activity, { headers });
  }

  /** ✅ Update an existing activity */
  updateActivity(id: number, activity: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<any>(`${this.apiUrl}/${id}`, activity, { headers });
  }

  /** ✅ Delete an activity */
  deleteActivity(id: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
}

import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './services/auth.service'; // ✅ If inside app/services // ✅ If services is one level up // <-- Adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private activityMasterUrl = 'http://localhost:8080/activitymaster';
  private statusUrl='http://localhost:8080/status';

  constructor(private http: HttpClient, @Inject(AuthService) private authService: AuthService) {}

  /** ✅ Generate authorization headers */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  /** ✅ Fetch all master activities */
  getMasterActivities(): Observable<any[]> {
    return this.http.get<any[]>(this.activityMasterUrl, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** ✅ Fetch specific activity details by ID */
  getActivityById(activityId: number): Observable<any> {
    return this.http.get<any>(`${this.activityMasterUrl}/${activityId}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /** ✅ Improved error handling */
  private handleError(error: any) {
    console.error('MasterDataService Error:', error);
    return throwError(() => new Error(`Server error: ${error.status}. Please try again later.`));
  }


  getAllStatus(): Observable<any[]> {
    return this.http.get<any[]>(this.statusUrl, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
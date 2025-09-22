// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class RemarksService {

//   constructor() { }
// }



import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RemarksService {
  private apiUrl = 'http://localhost:8080';
  baseUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.baseUrl = `${this.apiUrl}/remarks`;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }


  getRemarksByActivityId(activityId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/activity/${activityId}`, { headers: this.getAuthHeaders() });
  }

// ✅ POST remark (add new remark)
  addRemark(payload: { remarks: string; activityId: number; userId: number }): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload, {
      headers: this.getAuthHeaders()
    });
  }


}



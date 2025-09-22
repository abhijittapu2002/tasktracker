import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private baseUrl = 'http://localhost:8080/projectmaster';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // assumes it returns only the token string
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // ✅ CORRECTED ENDPOINT
  getAllProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/list`, {
      headers: this.getHeaders()
    });
  }

  createProject(projectData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, projectData, {
      headers: this.getHeaders()
    });
  }

  getProjectById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateProject(id: number, projectData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, projectData, {
      headers: this.getHeaders()
    });
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}

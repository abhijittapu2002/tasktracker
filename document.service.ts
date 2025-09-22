import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8080';
  baseUrl: string;

  constructor(
    private http: HttpClient
  ) {
    this.baseUrl = `${this.apiUrl}/documents`;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/upload`, formData, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Document upload error:', error);
        return throwError(() => error);
      })
    );
  }

  getDocumentByActivityId(activityId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/activity/${activityId}`, { headers: this.getAuthHeaders() });
  }

  /** 
   * Download the document file as a Blob 
   */
  downloadDocument(docId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${docId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  /**
   * Preview the document file as a Blob
   */
  previewDocument(docId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/preview/${docId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  /**
   * Delete document by ID
   */
  deleteDocument(docId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/delete/${docId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(
      catchError(error => {
        console.error('Document delete error:', error);
        return throwError(() => error);
      })
    );
  }
}


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = 'http://localhost:8080/authenticate';
  private registerUrl = 'http://localhost:8080/register';
  private usersUrl = 'http://localhost:8080/api/users/all';
  private currentUserUrl = 'http://localhost:8080/api/users/current-user';

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private username = new BehaviorSubject<string | null>(localStorage.getItem('username'));
  private userRole = new BehaviorSubject<string | null>(localStorage.getItem('userRole'));

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('jwtToken');
  }

  /** ✅ Login method */
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.authUrl, { username, password }).pipe(
      tap(response => {
        if (response.token && response.username && response.roles) {
          this.setUserDetails(response.token, response.username, response.roles);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /** ✅ Register method with responseType fix */
  register(userData: any): Observable<string> {
    return this.http.post(this.registerUrl, userData, {
      responseType: 'text' as 'text' // ⛳ Force text response to avoid JSON parsing error
    }).pipe(
      tap(response => console.log('Register response:', response)),
      catchError(error => this.handleError(error))
    );
  }

  /** ✅ Logout */
  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    this.loggedIn.next(false);
    this.username.next(null);
    this.userRole.next(null);
  }

  /** ✅ Check auth status */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  /** ✅ Username getters */
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getUsername$(): Observable<string | null> {
    return this.username.asObservable();
  }

  /** ✅ Role getters */
  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserRole$(): Observable<string | null> {
    return this.userRole.asObservable();
  }

  /** ✅ Store JWT and user details */
  setUserDetails(token: string, username: string, roles: string[]) {
    const role = roles[0].toUpperCase();
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', role);
    this.loggedIn.next(true);
    this.username.next(username);
    this.userRole.next(role);
  }

  /** ✅ JWT Getter */
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  /** ✅ Fetch all users */
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.usersUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(users => console.log('Fetched users:', users)),
      catchError(error => this.handleError(error))
    );
  }

  /** ✅ Fetch current user */
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(this.currentUserUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => console.log('Current user:', user)),
      catchError(error => this.handleError(error))
    );
  }
   isManager(): boolean {
    return this.getUserRole() === 'MANAGER';
  }

  /** ✅ Check if admin */
  // isAdmin(): boolean {
  //   return this.getUserRole() === 'ADMIN';
  // }
  isAdmin(): boolean {
  const role = this.getUserRole()?.toUpperCase();
  return role === 'ADMIN' || role === 'ROLE_ADMIN';
}


  /** ✅ Auth header generator */
  public getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  /** ✅ Robust error handling */
  private handleError(error: any) {
    console.error('AuthService Error:', error);

    if (error.status === 0) {
      return throwError(() => new Error('❌ Network error. Please check your connection.'));
    } else if (error.status === 401) {
      return throwError(() => new Error('❌ Unauthorized request.'));
    } else if (error.status === 403) {
      return throwError(() => new Error('❌ Forbidden. You don’t have access.'));
    } else if (error.status === 200 && typeof error.error === 'string') {
      // Angular treats plain text 200 responses as errors: this is a workaround
      return throwError(() => new Error(error.error));
    } else {
      return throwError(() => new Error(`❌ Server error ${error.status}: ${error.message || 'Please try again.'}`));
    }
  }

  
}

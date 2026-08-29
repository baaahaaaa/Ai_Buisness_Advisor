import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8080/api/auth';

  private readonly TOKEN_KEY = 'aba_jwt_token';
  private readonly ROLES_KEY = 'aba_roles';
  private readonly USERNAME_KEY = 'aba_username';

  constructor(private http: HttpClient) {}


  /* =====================================================
     LOGIN
  ====================================================== */

  login(payload: LoginPayload): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.API_URL}/login`,
      payload
    ).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setUsername(response.username);
      })
    );

  }


  /* =====================================================
     REGISTER
  ====================================================== */

  register(payload: RegisterPayload): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.API_URL}/register`,
      payload
    ).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setUsername(response.username);
      })
    );

  }


  /* =====================================================
     LOGOUT
  ====================================================== */

  logout(): void {

    this.removeToken();
    localStorage.removeItem(this.ROLES_KEY);
    localStorage.removeItem(this.USERNAME_KEY);

  }


  /* =====================================================
     AUTHENTICATION STATE
  ====================================================== */

  isAuthenticated(): boolean {

    return !!this.getToken();

  }


    getCurrentUsername(): string {

    return this.getUsername() ?? 'Administrateur';

  }


  /* =====================================================
     TOKEN
  ====================================================== */

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }


  /* =====================================================
     USERNAME
  ====================================================== */

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  setUsername(username: string): void {
    localStorage.setItem(this.USERNAME_KEY, username);
  }


  /* =====================================================
     ROLES
  ====================================================== */

  getRoles(): string[] {
    const roles = localStorage.getItem(this.ROLES_KEY);

    if (!roles) {
      return [];
    }

    try {
      return JSON.parse(roles);
    } catch {
      return [];
    }
  }

  setRoles(roles: string[]): void {
    localStorage.setItem(
      this.ROLES_KEY,
      JSON.stringify(roles)
    );
  }

}
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  roles: string[];
}

const TOKEN_KEY = 'aba_jwt_token';
const USERNAME_KEY = 'aba_username';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/api/auth`;

  private readonly tokenSignal = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => this.persistSession(response))
    );
  }

  /**
   * Inscription.
   * Le backend renvoie un token au meme titre que /login (voir
   * AuthController.register cote Spring Boot) : on le stocke de la
   * meme facon pour que l'utilisateur soit reellement connecte
   * immediatement apres son inscription, plutot que d'etre renvoye
   * vers /auth/login par le authGuard faute de token.
   */
  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/register`,
      data
    ).pipe(
      tap(response => this.persistSession(response))
    );
  }

  private persistSession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USERNAME_KEY, response.username);
    this.tokenSignal.set(response.token);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    this.tokenSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  isLoggedIn(): boolean {
    return this.tokenSignal() !== null;
  }

  getCurrentUsername(): string {
    return localStorage.getItem(USERNAME_KEY) ?? 'Admin';
  }

  isAdmin(): boolean {
    return true;
    // Plus tard :
    // return localStorage.getItem('role') === 'ROLE_ADMIN';
  }
}
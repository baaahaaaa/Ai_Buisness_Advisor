import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

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

  // Adapter si nécessaire
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  private readonly tokenSignal = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Connexion
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(

      tap(response => {

        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USERNAME_KEY, response.username);

        this.tokenSignal.set(response.token);

      })

    );

  }

  /**
   * Inscription
   */
  register(data: RegisterRequest): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/register`,
      data
    );

  }

  /**
   * Déconnexion
   */
  logout(): void {

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);

    this.tokenSignal.set(null);

    this.router.navigate(['/auth/login']);

  }

  /**
   * Retourne le JWT
   */
  getToken(): string | null {

    return this.tokenSignal();

  }

  /**
   * Vérifie si connecté
   */
  isLoggedIn(): boolean {

    return this.tokenSignal() !== null;

  }

  /**
   * Nom utilisateur connecté
   */
  getCurrentUsername(): string {

    return localStorage.getItem(USERNAME_KEY) ?? 'Admin';

  }

  /**
   * Vérifie si utilisateur Admin
   */
  isAdmin(): boolean {

    return true;

    // Plus tard :
    // return localStorage.getItem('role') === 'ROLE_ADMIN';

  }

}
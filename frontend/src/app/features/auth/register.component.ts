import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card-wrapper">
        <div class="auth-brand">
          <div class="brand-mark">AI</div>
          <h1>Business Advisor</h1>
          <p>L'intelligence artificielle au service de l'assurance</p>
        </div>

        <mat-card class="auth-card glass-card ai-glow">
          <mat-card-header>
            <mat-card-title>Créer un compte</mat-card-title>
            <mat-card-subtitle>Configurez votre profil de conseiller</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form (ngSubmit)="onRegister()" #regForm="ngForm" class="auth-form">
              <mat-form-field appearance="outline">
                <mat-label>Adresse e-mail</mat-label>
                <input matInput type="email" name="email" [(ngModel)]="email" required email>
                <mat-icon matSuffix fontSet="material-symbols-outlined">mail</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom d'utilisateur</mat-label>
                <input matInput name="username" [(ngModel)]="username" required minlength="4">
                <mat-icon matSuffix fontSet="material-symbols-outlined">person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Mot de passe</mat-label>
                <input matInput [type]="hide() ? 'password' : 'text'" name="password" [(ngModel)]="password" required minlength="6">
                <button type="button" mat-icon-button matSuffix (click)="hide.set(!hide())">
                  <mat-icon fontSet="material-symbols-outlined">{{hide() ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
              </mat-form-field>

              <button mat-flat-button color="primary" class="premium-gradient ai-glow auth-submit" [disabled]="loading() || !regForm.valid">
                {{ loading() ? 'Création du compte...' : 'Créer mon compte' }}
              </button>
            </form>
          </mat-card-content>

          <mat-card-footer class="auth-footer">
            <p>Déjà un compte ? <a routerLink="/auth/login">Se connecter</a></p>
          </mat-card-footer>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      overflow: hidden; position: relative;
    }
    .auth-container::before {
      content: ''; position: absolute; width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
      top: -300px; right: -300px;
    }

    .auth-card-wrapper { width: 440px; animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    .auth-brand { text-align: center; margin-bottom: 40px; }
    .brand-mark {
      width: 50px; height: 50px; background: var(--accent); color: var(--ink);
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 12px; font-family: var(--font-mono); font-weight: 800; font-size: 1.5rem;
      margin-bottom: 16px; box-shadow: 0 8px 16px rgba(184, 134, 58, 0.3);
    }
    .auth-brand h1 { color: white; font-size: 2.25rem; margin: 0; letter-spacing: -0.03em; }
    .auth-brand p { color: #94a3b8; margin-top: 8px; font-size: 1rem; }

    .auth-card { padding: 32px; border-radius: 24px !important; }
    ::ng-deep .auth-card .mat-mdc-card-header { padding: 0 !important; margin-bottom: 32px; }
    ::ng-deep .auth-card .mat-mdc-card-title { font-size: 1.5rem !important; font-weight: 800 !important; margin-bottom: 8px !important; }

    .auth-form { display: flex; flex-direction: column; gap: 20px; }
    .auth-submit { height: 52px !important; font-size: 1.1rem !important; margin-top: 12px; }

    .auth-footer { padding: 24px 0 0; text-align: center; border-top: 1px solid #f1f5f9; margin-top: 32px; }
    .auth-footer p { color: #64748b; font-size: 0.9rem; margin: 0; }
    .auth-footer a { color: var(--primary); font-weight: 700; text-decoration: none; }
  `]
})
export class RegisterComponent {
  email = '';
  username = '';
  password = '';
  hide = signal(true);
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  onRegister() {
    this.loading.set(true);
    this.authService.register({ username: this.username, password: this.password, email: this.email }).subscribe({
      next: () => {
        this.notification.success('Compte créé. Bienvenue sur AI Business Advisor.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.notification.error(err?.error?.detail ?? 'Erreur lors de l\'inscription. Veuillez réessayer.');
        this.loading.set(false);
      }
    });
  }
}
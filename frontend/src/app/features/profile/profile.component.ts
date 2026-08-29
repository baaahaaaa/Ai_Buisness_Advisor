import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <span class="eyebrow">ACCOUNT</span>
        <h1>Mon profil</h1>
        <p>Informations et paramètres de votre compte.</p>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="profile">
            <div class="avatar">AD</div>

            <div>
              <h2>AI Advisor</h2>
              <p>Business Analyst</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page {
      max-width: 1100px;
      margin: auto;
    }

    .page-header {
      margin-bottom: 28px;
    }

    .eyebrow {
      color: var(--primary);
      font-size: .72rem;
      font-weight: 800;
      letter-spacing: .14em;
    }

    h1 {
      margin: 6px 0;
      font-size: 2.4rem;
    }

    .page-header p {
      color: var(--ink-soft);
    }

    mat-card {
      border-radius: 24px !important;
    }

    .profile {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 20px;
    }

    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 18px;
      display: grid;
      place-items: center;
      background: linear-gradient(
        135deg,
        var(--primary),
        var(--secondary)
      );
      color: white;
      font-weight: 800;
    }
  `]
})
export class ProfileComponent {}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="settings-page">

      <div class="page-header">
        <span class="eyebrow">SYSTEM</span>
        <h1>Paramètres</h1>
        <p>Configuration de votre espace AI Business Advisor.</p>
      </div>

      <div class="settings-grid">

        <mat-card>
          <mat-card-content>
            <mat-icon fontSet="material-symbols-outlined">
              security
            </mat-icon>

            <h2>Sécurité</h2>

            <p>
              Authentification JWT et contrôle des accès.
            </p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <mat-icon fontSet="material-symbols-outlined">
              smart_toy
            </mat-icon>

            <h2>AI Engine</h2>

            <p>
              Ollama et Llama 3.1 8B utilisés pour l'analyse locale.
            </p>
          </mat-card-content>
        </mat-card>

      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      max-width: 1200px;
      margin: auto;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .eyebrow {
      color: var(--primary);
      font-size: .72rem;
      font-weight: 800;
      letter-spacing: .14em;
    }

    h1 {
      font-size: 2.4rem;
      margin: 6px 0;
    }

    .page-header p {
      color: var(--ink-soft);
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    mat-card {
      border-radius: 20px !important;
    }

    mat-icon {
      color: var(--primary);
      font-size: 30px;
    }

    @media(max-width: 700px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SettingsComponent {}
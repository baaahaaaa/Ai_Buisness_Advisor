import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  template: `
    <div class="dashboard-container">
      <h1 class="mat-h1">Tableau de Bord</h1>

      <mat-grid-list cols="4" rowHeight="160px" gutterSize="16px">
        <mat-grid-tile>
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Total Clients</mat-card-title>
              <mat-icon mat-card-avatar color="primary">people</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">1,248</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Analyses IA</mat-card-title>
              <mat-icon mat-card-avatar color="accent">psychology</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">452</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Alertes Risque</mat-card-title>
              <mat-icon mat-card-avatar color="warn">warning</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">24</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Opportunités</mat-card-title>
              <mat-icon mat-card-avatar class="success-icon">trending_up</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">156</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>

      <div class="actions-section">
        <h2 class="mat-h2">Actions Rapides</h2>
        <div class="button-row">
          <a mat-raised-button color="primary" routerLink="/customers">
            <mat-icon>list</mat-icon> Voir les clients
          </a>
          <button mat-raised-button color="accent">
            <mat-icon>add</mat-icon> Nouveau client
          </button>
          <button mat-stroked-button>
            <mat-icon>assessment</mat-icon> Générer rapport
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .stat-card {
      width: 100%;
      height: 100%;
    }
    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      text-align: right;
      padding: 10px 0;
    }
    .actions-section {
      margin-top: 32px;
    }
    .button-row {
      display: flex;
      gap: 16px;
      margin-top: 16px;
    }
    .success-icon {
      color: #4caf50;
    }
  `]
})
export class DashboardComponent {}

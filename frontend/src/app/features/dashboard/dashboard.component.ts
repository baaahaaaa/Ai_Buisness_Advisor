import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';

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
              <div class="stat-value">{{ loading() ? '...' : totalClients() }}</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Prime Moyenne</mat-card-title>
              <mat-icon mat-card-avatar color="accent">payments</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ loading() ? '...' : (avgPrime() + ' DT') }}</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Taux de Retard</mat-card-title>
              <mat-icon mat-card-avatar color="warn">warning</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ loading() ? '...' : (retardRate() + '%') }}</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Fraudes Suspectes</mat-card-title>
              <mat-icon mat-card-avatar class="danger-icon">gpp_maybe</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ loading() ? '...' : fraudeCount() }}</div>
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
          <a mat-raised-button color="accent" routerLink="/customers/nouveau">
            <mat-icon>add</mat-icon> Nouveau client
          </a>
          <button mat-stroked-button (click)="generateReport()" [disabled]="reportLoading()">
            <mat-icon>assessment</mat-icon>
            {{ reportLoading() ? 'Generation...' : 'Generer rapport' }}
          </button>
        </div>

        <div class="report-box" *ngIf="insights().length > 0">
          <h3>Rapport Global</h3>
          <ul>
            <li *ngFor="let insight of insights()">{{ insight }}</li>
          </ul>

          <h3>Repartition par segment</h3>
          <table>
            <thead>
              <tr><th>Segment</th><th>Nombre</th><th>%</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let seg of segments()">
                <td>{{ seg.segment }}</td>
                <td>{{ seg.nombre }}</td>
                <td>{{ seg.pourcentage }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1200px; margin: 0 auto; }
    .stat-card { width: 100%; height: 100%; }
    .stat-value { font-size: 2.2rem; font-weight: bold; text-align: right; padding: 10px 0; }
    .actions-section { margin-top: 32px; }
    .button-row { display: flex; gap: 16px; margin-top: 16px; }
    .danger-icon { color: #B14C4C; }
    .report-box {
      margin-top: 24px;
      background: #F7F8FA;
      border: 1px solid #DDE2E8;
      border-radius: 8px;
      padding: 18px 20px;
    }
    .report-box h3 { margin-top: 0; }
    .report-box ul { padding-left: 18px; }
    .report-box table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .report-box th, .report-box td {
      text-align: left; padding: 6px 10px; border-bottom: 1px solid #DDE2E8;
      font-size: 0.88rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  totalClients = signal(0);
  avgPrime = signal(0);
  retardRate = signal(0);
  fraudeCount = signal(0);

  reportLoading = signal(false);
  insights = signal<string[]>([]);
  segments = signal<{ segment: string; nombre: number; pourcentage: number }[]>([]);

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.clientService.getDashboard().subscribe({
      next: (data) => {
        const kpis = data.global_kpis?.kpis ?? {};
        this.totalClients.set(kpis.total_clients ?? 0);
        this.avgPrime.set(kpis.avg_prime ?? 0);
        this.retardRate.set(kpis.retard_rate ?? 0);
        this.fraudeCount.set(kpis.fraude_suspecte ?? 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Dashboard indisponible:', err);
        this.loading.set(false);
      }
    });
  }

  generateReport(): void {
    this.reportLoading.set(true);
    this.clientService.getDashboard().subscribe({
      next: (data) => {
        this.insights.set(data.global_kpis?.insights ?? []);
        this.segments.set(data.segment_distribution ?? []);
        this.reportLoading.set(false);
      },
      error: () => {
        this.insights.set(['Erreur: impossible de generer le rapport.']);
        this.reportLoading.set(false);
      }
    });
  }
}
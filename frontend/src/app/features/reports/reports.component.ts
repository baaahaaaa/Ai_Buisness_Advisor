import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientService } from '../../core/services/client.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="reports-wrapper">
      <div class="header">
        <h1 class="page-title">Rapports</h1>
        <p class="page-subtitle">Génération et téléchargement des rapports d'analyse</p>
      </div>

      <div class="cards-grid">
        <!-- Rapport global -->
        <mat-card class="report-card">
          <mat-card-content>
            <div class="card-icon-box primary">
              <mat-icon fontSet="material-symbols-outlined">summarize</mat-icon>
            </div>
            <h2>Rapport global</h2>
            <p class="card-desc">
              Vue d'ensemble des indicateurs clés (KPIs), répartition des segments
              et sinistres sur l'ensemble du portefeuille client.
            </p>
            <div class="actions">
              <button mat-stroked-button (click)="viewGlobalJson()" [disabled]="loadingGlobalJson()">
                <mat-icon fontSet="material-symbols-outlined">data_object</mat-icon>
                {{ loadingGlobalJson() ? 'Chargement...' : 'Voir en JSON' }}
              </button>
              <button mat-flat-button color="primary" (click)="downloadGlobalPdf()" [disabled]="loadingGlobalPdf()">
                <mat-icon fontSet="material-symbols-outlined">picture_as_pdf</mat-icon>
                {{ loadingGlobalPdf() ? 'Génération...' : 'Télécharger PDF' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Rapport client -->
        <mat-card class="report-card">
          <mat-card-content>
            <div class="card-icon-box accent">
              <mat-icon fontSet="material-symbols-outlined">person_search</mat-icon>
            </div>
            <h2>Rapport client</h2>
            <p class="card-desc">
              Analyse complète d'un client précis : segmentation, risque, pricing,
              recommandations, fraude, conformité et résumé exécutif généré par l'IA.
            </p>

            <mat-form-field appearance="outline" class="client-id-field">
              <mat-label>ID du client</mat-label>
              <input matInput type="number" [(ngModel)]="clientId" placeholder="Ex: 12">
            </mat-form-field>

            <div class="actions">
              <button mat-stroked-button (click)="viewClientJson()" [disabled]="!clientId || loadingClientJson()">
                <mat-icon fontSet="material-symbols-outlined">data_object</mat-icon>
                {{ loadingClientJson() ? 'Chargement...' : 'Voir en JSON' }}
              </button>
              <button mat-flat-button color="primary" (click)="downloadClientPdf()" [disabled]="!clientId || loadingClientPdf()">
                <mat-icon fontSet="material-symbols-outlined">picture_as_pdf</mat-icon>
                {{ loadingClientPdf() ? 'Génération...' : 'Télécharger PDF' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="json-preview" *ngIf="jsonPreview()">
        <mat-card-content>
          <div class="preview-header">
            <h3>Aperçu JSON</h3>
            <button mat-icon-button (click)="jsonPreview.set(null)">
              <mat-icon fontSet="material-symbols-outlined">close</mat-icon>
            </button>
          </div>
          <pre>{{ jsonPreview() | json }}</pre>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reports-wrapper { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .header { margin-bottom: 24px; }
    .page-title { font-size: 26px; font-weight: 700; margin: 0; color: var(--primary, #1B2A4A); }
    .page-subtitle { color: #64748b; margin-top: 4px; }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 20px;
    }

    .report-card { border-radius: 16px; }
    .report-card mat-card-content { padding: 24px; display: flex; flex-direction: column; }

    .card-icon-box {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 12px;
    }
    .card-icon-box.primary { background: #EAF0FF; color: #1B2A4A; }
    .card-icon-box.accent { background: #FFF4E0; color: #B8860B; }

    .report-card h2 { margin: 0 0 8px 0; font-size: 18px; font-weight: 600; }
    .card-desc { color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 16px; }

    .client-id-field { width: 100%; margin-bottom: 8px; }

    .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: auto; }
    .actions button mat-icon { margin-right: 6px; }

    .json-preview { margin-top: 24px; border-radius: 16px; }
    .preview-header { display: flex; justify-content: space-between; align-items: center; }
    .json-preview pre {
      background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 8px;
      overflow-x: auto; font-size: 12px; max-height: 500px; overflow-y: auto;
    }
  `]
})
export class ReportsComponent {
  clientId: number | null = null;

  jsonPreview = signal<any>(null);
  loadingGlobalJson = signal(false);
  loadingGlobalPdf = signal(false);
  loadingClientJson = signal(false);
  loadingClientPdf = signal(false);

  constructor(
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  viewGlobalJson(): void {
    this.loadingGlobalJson.set(true);
    this.clientService.getReportGlobalJson().subscribe({
      next: (data) => {
        this.jsonPreview.set(data);
        this.loadingGlobalJson.set(false);
      },
      error: () => {
        this.notificationService.error('Impossible de générer le rapport global');
        this.loadingGlobalJson.set(false);
      }
    });
  }

  downloadGlobalPdf(): void {
    this.loadingGlobalPdf.set(true);
    this.clientService.downloadReportGlobalPdf().subscribe({
      next: (blob) => {
        this.triggerDownload(blob, 'rapport_global.pdf');
        this.loadingGlobalPdf.set(false);
      },
      error: () => {
        this.notificationService.error('Impossible de télécharger le PDF global');
        this.loadingGlobalPdf.set(false);
      }
    });
  }

  viewClientJson(): void {
    if (!this.clientId) return;
    this.loadingClientJson.set(true);
    this.clientService.getReportClientJson(this.clientId).subscribe({
      next: (data) => {
        this.jsonPreview.set(data);
        this.loadingClientJson.set(false);
      },
      error: () => {
        this.notificationService.error('Impossible de générer le rapport client');
        this.loadingClientJson.set(false);
      }
    });
  }

  downloadClientPdf(): void {
    if (!this.clientId) return;
    this.loadingClientPdf.set(true);
    const id = this.clientId;
    this.clientService.downloadReportClientPdf(id).subscribe({
      next: (blob) => {
        this.triggerDownload(blob, `rapport_client_${id}.pdf`);
        this.loadingClientPdf.set(false);
      },
      error: () => {
        this.notificationService.error('Impossible de télécharger le PDF client');
        this.loadingClientPdf.set(false);
      }
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    this.notificationService.success('Téléchargement lancé');
  }
}

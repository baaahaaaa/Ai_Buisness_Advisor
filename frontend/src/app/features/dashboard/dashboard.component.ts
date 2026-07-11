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
    <div class="dashboard-wrapper">
      <div class="dashboard-header">
        <div class="header-main">
          <h1 class="page-title">Executive Overview</h1>
          <p class="page-subtitle">AI-Driven Business Intelligence Dashboard</p>
        </div>
        <div class="header-actions-group">
          <button mat-stroked-button class="date-picker-btn">
            <mat-icon fontSet="material-symbols-outlined">calendar_today</mat-icon>
            <span>Derniers 30 jours</span>
            <mat-icon fontSet="material-symbols-outlined">expand_more</mat-icon>
          </button>
          <button mat-flat-button color="primary" class="premium-gradient ai-glow" (click)="generateReport()" [disabled]="reportLoading()">
            <mat-icon fontSet="material-symbols-outlined">{{ reportLoading() ? 'sync' : 'auto_awesome' }}</mat-icon>
            <span>{{ reportLoading() ? 'Analyse...' : 'Générer Insights IA' }}</span>
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <div class="stat-icon-box primary">
                <mat-icon fontSet="material-symbols-outlined">group</mat-icon>
              </div>
              <div class="stat-trend positive">
                <mat-icon fontSet="material-symbols-outlined">trending_up</mat-icon>
                <span>+2.5%</span>
              </div>
            </div>
            <div class="stat-main">
              <span class="stat-label">Total Clients</span>
              <div class="stat-value-container">
                <div class="stat-value">{{ loading() ? '...' : totalClients() }}</div>
                <div class="stat-mini-chart">
                  <div class="bar" style="height: 40%"></div>
                  <div class="bar" style="height: 60%"></div>
                  <div class="bar" style="height: 50%"></div>
                  <div class="bar" style="height: 80%"></div>
                  <div class="bar active" style="height: 100%"></div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <div class="stat-icon-box accent">
                <mat-icon fontSet="material-symbols-outlined">payments</mat-icon>
              </div>
              <div class="stat-trend positive">
                <mat-icon fontSet="material-symbols-outlined">trending_up</mat-icon>
                <span>+1.2%</span>
              </div>
            </div>
            <div class="stat-main">
              <span class="stat-label">Prime Moyenne</span>
              <div class="stat-value-container">
                <div class="stat-value">{{ loading() ? '...' : (avgPrime() | number:'1.0-0') }} <small>DT</small></div>
                <div class="stat-mini-chart">
                  <div class="bar" style="height: 30%"></div>
                  <div class="bar" style="height: 40%"></div>
                  <div class="bar" style="height: 70%"></div>
                  <div class="bar active" style="height: 90%"></div>
                  <div class="bar" style="height: 60%"></div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <div class="stat-icon-box warn">
                <mat-icon fontSet="material-symbols-outlined">warning</mat-icon>
              </div>
              <div class="stat-trend negative">
                <mat-icon fontSet="material-symbols-outlined">trending_down</mat-icon>
                <span>-0.4%</span>
              </div>
            </div>
            <div class="stat-main">
              <span class="stat-label">Taux de Retard</span>
              <div class="stat-value-container">
                <div class="stat-value">{{ loading() ? '...' : (retardRate() | number:'1.1-1') }}<small>%</small></div>
                <div class="stat-mini-chart">
                  <div class="bar" style="height: 80%"></div>
                  <div class="bar active" style="height: 100%"></div>
                  <div class="bar" style="height: 70%"></div>
                  <div class="bar" style="height: 50%"></div>
                  <div class="bar" style="height: 40%"></div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <div class="stat-icon-box danger">
                <mat-icon fontSet="material-symbols-outlined">gpp_maybe</mat-icon>
              </div>
              <div class="stat-trend neutral">
                <span>0%</span>
              </div>
            </div>
            <div class="stat-main">
              <span class="stat-label">Risque Fraude</span>
              <div class="stat-value-container">
                <div class="stat-value">{{ loading() ? '...' : fraudeCount() }}</div>
                <div class="stat-risk-meter">
                  <div class="meter-fill" [style.width.%]="fraudeCount() * 10"></div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="dashboard-content-grid">
        <div class="main-column">
          <section class="ai-report-section ai-glow">
            <div class="section-header">
              <div class="title-with-icon">
                <div class="ai-icon-bg">
                  <mat-icon fontSet="material-symbols-outlined">smart_toy</mat-icon>
                </div>
                <div>
                  <h2 class="section-title">Analyse Cognitive Multimodale</h2>
                  <p class="section-subtitle">Rapport généré par les 10 agents spécialisés</p>
                </div>
              </div>
              <button mat-icon-button><mat-icon fontSet="material-symbols-outlined">share</mat-icon></button>
            </div>

            <div class="insights-scroll-area" *ngIf="insights().length > 0; else noReport">
              <div class="insight-premium-card" *ngFor="let insight of insights(); let i = index" [style.animation-delay]="i * 100 + 'ms'">
                <div class="insight-tag" [ngClass]="{'tag-risk': i === 0, 'tag-growth': i === 1, 'tag-info': i > 1}">
                  {{ i === 0 ? 'RISQUE' : i === 1 ? 'CROISSANCE' : 'CONSEIL' }}
                </div>
                <p class="insight-content">{{ insight }}</p>
              </div>
            </div>

            <ng-template #noReport>
              <div class="empty-ai-state">
                <div class="ai-pulse-ring">
                  <mat-icon fontSet="material-symbols-outlined">query_stats</mat-icon>
                </div>
                <h3>Prêt pour l'analyse</h3>
                <p>Nos agents IA attendent votre signal pour analyser les données du portefeuille.</p>
                <button mat-flat-button color="primary" class="premium-gradient" (click)="generateReport()" [disabled]="reportLoading()">
                  Lancer l'orchestration IA
                </button>
              </div>
            </ng-template>
          </section>

          <section class="recent-activity-section">
            <div class="section-header">
              <h2 class="section-title">Distribution des Segments</h2>
              <button mat-button color="primary">Voir Détails</button>
            </div>
            <mat-card class="glass-card">
              <mat-card-content>
                <div class="segment-grid">
                  <div class="segment-card" *ngFor="let seg of segments()">
                    <div class="segment-info">
                      <span class="seg-name">{{ seg.segment }}</span>
                      <span class="seg-count">{{ seg.nombre }} dossiers</span>
                    </div>
                    <div class="seg-progress-container">
                      <div class="seg-progress-bar" [style.width.%]="seg.pourcentage"></div>
                    </div>
                    <span class="seg-pct">{{ seg.pourcentage }}%</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </section>
        </div>

        <div class="side-column">
          <section class="quick-nav-section">
            <h2 class="section-title">Navigation Rapide</h2>
            <div class="nav-cards">
              <a [routerLink]="['/customers']" class="nav-card">
                <div class="nav-icon primary"><mat-icon fontSet="material-symbols-outlined">group</mat-icon></div>
                <div class="nav-label">Portefeuille</div>
                <mat-icon fontSet="material-symbols-outlined" class="nav-arrow">chevron_right</mat-icon>
              </a>
              <a [routerLink]="['/customers/nouveau']" class="nav-card">
                <div class="nav-icon accent"><mat-icon fontSet="material-symbols-outlined">person_add</mat-icon></div>
                <div class="nav-label">Nouveau Dossier</div>
                <mat-icon fontSet="material-symbols-outlined" class="nav-arrow">chevron_right</mat-icon>
              </a>
              <a class="nav-card disabled">
                <div class="nav-icon warn"><mat-icon fontSet="material-symbols-outlined">security</mat-icon></div>
                <div class="nav-label">Conformité GRC</div>
                <mat-icon fontSet="material-symbols-outlined" class="nav-arrow">chevron_right</mat-icon>
              </a>
            </div>
          </section>

          <section class="ai-status-card ai-glow">
            <div class="ai-card-content">
              <div class="ai-header">
                <span class="ai-badge">ORCHESTRATOR v2</span>
                <div class="live-dot"></div>
              </div>
              <h3 class="ai-title">Système Multi-Agents</h3>
              <p class="ai-desc">10 agents spécialisés analysent vos données en temps réel pour détecter les opportunités.</p>
              <div class="agent-stack">
                <div class="agent-pill">Risk</div>
                <div class="agent-pill">Fraud</div>
                <div class="agent-pill">Pricing</div>
                <div class="agent-pill">+7</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 40px;
    }
    .page-title { font-size: 2.5rem; font-weight: 800; margin: 0; letter-spacing: -0.03em; color: var(--ink); }
    .page-subtitle { color: var(--ink-soft); font-size: 1.1rem; margin: 4px 0 0; }

    .header-actions-group { display: flex; gap: 12px; }
    .date-picker-btn { border-radius: 12px !important; height: 48px !important; color: #475569 !important; border-color: var(--border) !important; }
    .date-picker-btn mat-icon { font-size: 20px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .stat-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid var(--border) !important;
    }
    .stat-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg) !important;
      border-color: var(--primary-soft) !important;
    }

    .stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .stat-icon-box {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .stat-icon-box mat-icon { font-size: 24px; }
    .stat-icon-box.primary { background: #eff6ff; color: #2563eb; }
    .stat-icon-box.accent { background: #fffbeb; color: #b8863b; }
    .stat-icon-box.warn { background: #fefce8; color: #ca8a04; }
    .stat-icon-box.danger { background: #fef2f2; color: #dc2626; }

    .stat-trend {
      display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;
    }
    .stat-trend.positive { background: #f0fdf4; color: #166534; }
    .stat-trend.negative { background: #fef2f2; color: #991b1b; }
    .stat-trend.neutral { background: #f8fafc; color: #64748b; }
    .stat-trend mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .stat-label { font-size: 0.9rem; color: #64748b; font-weight: 600; display: block; margin-bottom: 8px; }
    .stat-value-container { display: flex; align-items: flex-end; justify-content: space-between; }
    .stat-value { font-size: 2.25rem; font-weight: 800; font-family: var(--font-display); color: var(--ink); line-height: 1; }
    .stat-value small { font-size: 1rem; color: #94a3b8; margin-left: 4px; font-weight: 600; }

    .stat-mini-chart { display: flex; align-items: flex-end; gap: 3px; height: 32px; }
    .stat-mini-chart .bar { width: 4px; background: #e2e8f0; border-radius: 2px; }
    .stat-mini-chart .bar.active { background: var(--primary); }

    .stat-risk-meter { width: 100px; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; margin-bottom: 12px; }
    .meter-fill { height: 100%; background: var(--danger); border-radius: 3px; }

    .dashboard-content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; }

    .ai-report-section {
      background: white; border-radius: 24px; padding: 32px; border: 1px solid var(--border);
      position: relative; overflow: hidden; margin-bottom: 32px;
    }
    .ai-report-section::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
    }

    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .title-with-icon { display: flex; gap: 16px; align-items: center; }
    .ai-icon-bg {
      width: 48px; height: 48px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary);
    }
    .section-title { font-size: 1.35rem; font-weight: 700; margin: 0; color: var(--ink); }
    .section-subtitle { font-size: 0.85rem; color: #64748b; margin: 2px 0 0; }

    .insights-scroll-area { display: flex; flex-direction: column; gap: 16px; }
    .insight-premium-card {
      background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9;
      animation: slideUp 0.4s ease-out both;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .insight-tag {
      display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 12px;
    }
    .tag-risk { background: #fef2f2; color: #dc2626; }
    .tag-growth { background: #f0fdf4; color: #16a34a; }
    .tag-info { background: #eff6ff; color: #2563eb; }
    .insight-content { margin: 0; line-height: 1.6; font-size: 0.95rem; color: #334155; }

    .empty-ai-state {
      padding: 60px 0; display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .ai-pulse-ring {
      width: 80px; height: 80px; border-radius: 50%; background: #eff6ff; display: flex; align-items: center; justify-content: center;
      color: var(--primary); margin-bottom: 24px; position: relative;
    }
    .ai-pulse-ring::after {
      content: ''; position: absolute; width: 100%; height: 100%; border: 2px solid var(--primary);
      border-radius: 50%; animation: pulse 2s infinite;
    }
    @keyframes pulse { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }

    .recent-activity-section .section-header { margin-bottom: 20px; }
    .segment-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .segment-card {
      background: rgba(255,255,255,0.5); padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9;
    }
    .seg-name { display: block; font-weight: 700; font-size: 0.9rem; color: var(--ink); }
    .seg-count { font-size: 0.75rem; color: #94a3b8; }
    .seg-progress-container { height: 6px; background: #f1f5f9; border-radius: 3px; margin: 12px 0 8px; overflow: hidden; }
    .seg-progress-bar { height: 100%; background: var(--primary); border-radius: 3px; }
    .seg-pct { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--ink); }

    .nav-cards { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .nav-card {
      display: flex; align-items: center; gap: 16px; padding: 16px; background: white; border: 1px solid var(--border);
      border-radius: 16px; transition: all 0.2s ease; cursor: pointer;
    }
    .nav-card:hover { border-color: var(--primary); transform: translateX(4px); box-shadow: var(--shadow-sm); }
    .nav-card.disabled { opacity: 0.6; cursor: not-allowed; }
    .nav-icon {
      width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
    }
    .nav-icon.primary { background: #eff6ff; color: var(--primary); }
    .nav-icon.accent { background: #fffbeb; color: var(--accent); }
    .nav-icon.warn { background: #f8fafc; color: #64748b; }
    .nav-label { flex: 1; font-weight: 600; font-size: 0.95rem; }
    .nav-arrow { color: #cbd5e1; }

    .ai-status-card {
      background: var(--ink); color: white; border-radius: 24px; padding: 28px; position: relative; overflow: hidden;
    }
    .ai-status-card::after {
      content: ''; position: absolute; top: -50%; right: -50%; width: 100%; height: 100%;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%);
    }
    .ai-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .ai-badge { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; font-family: var(--font-mono); }
    .live-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; }
    .ai-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
    .ai-desc { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; margin-bottom: 20px; }
    .agent-stack { display: flex; gap: 8px; }
    .agent-pill { background: #1e293b; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 600; color: #e2e8f0; }

    @media (max-width: 1200px) {
      .dashboard-content-grid { grid-template-columns: 1fr; }
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
    this.loadDashboardData();
  }

  loadDashboardData(): void {
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

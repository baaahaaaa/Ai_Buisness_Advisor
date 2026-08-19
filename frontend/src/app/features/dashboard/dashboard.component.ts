import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';

interface SegmentDist { segment: string; nombre: number; pourcentage: number; }
interface SinistreSeg { segment: string; nombre_sinistres: number; montant_moyen: number; montant_total: number; }

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
            <span>{{ reportLoading() ? 'Analyse...' : 'Generer Insights IA' }}</span>
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
            </div>
            <div class="stat-main">
              <span class="stat-label">Total Clients</span>
              <div class="stat-value-container">
                <div class="stat-value">{{ loading() ? '...' : totalClients() }}</div>
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
            </div>
            <div class="stat-main">
              <span class="stat-label">Prime Moyenne</span>
              <div class="stat-value-container">
                <div class="stat-value">{{ loading() ? '...' : (avgPrime() | number:'1.0-0') }} <small>DT</small></div>
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
            </div>
            <div class="stat-main">
              <span class="stat-label">Taux de Retard</span>
              <div class="stat-value-container">
                <div class="stat-value">{{ loading() ? '...' : (retardRate() | number:'1.1-1') }}<small>%</small></div>
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
            </div>
            <div class="stat-main">
              <span class="stat-label">Risque Fraude</span>
              <div class="stat-value-container">
                <div class="stat-value">{{ loading() ? '...' : fraudeCount() }}</div>
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
                  <p class="section-subtitle">Rapport genere par les agents specialises</p>
                </div>
              </div>
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
                <h3>Pret pour l'analyse</h3>
                <p>Nos agents IA attendent votre signal pour analyser les donnees du portefeuille.</p>
                <button mat-flat-button color="primary" class="premium-gradient" (click)="generateReport()" [disabled]="reportLoading()">
                  Lancer l'orchestration IA
                </button>
              </div>
            </ng-template>
          </section>

          <section class="recent-activity-section" *ngIf="segments().length > 0">
            <div class="section-header">
              <h2 class="section-title">Distribution des Segments</h2>
            </div>
            <mat-card class="glass-card chart-card">
              <mat-card-content>
                <div class="donut-layout">
                  <div class="donut-chart" [style.background]="donutGradient()">
                    <div class="donut-hole">
                      <span class="donut-total">{{ totalClients() }}</span>
                      <span class="donut-total-label">clients</span>
                    </div>
                  </div>
                  <div class="donut-legend">
                    <div class="legend-item" *ngFor="let seg of segments(); let i = index">
                      <span class="legend-dot" [style.background]="segmentColor(i)"></span>
                      <span class="legend-name">{{ seg.segment }}</span>
                      <span class="legend-count">{{ seg.nombre }}</span>
                      <span class="legend-pct">{{ seg.pourcentage }}%</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </section>

          <section class="claims-section" *ngIf="sinistresSegment().length > 0">
            <div class="section-header">
              <h2 class="section-title">Sinistres par Segment</h2>
            </div>
            <mat-card class="glass-card chart-card">
              <mat-card-content>
                <div class="bar-chart">
                  <div class="bar-row" *ngFor="let s of sinistresSegment(); let i = index">
                    <span class="bar-label">{{ s.segment }}</span>
                    <div class="bar-track">
                      <div class="bar-fill" [style.width.%]="barWidth(s.nombre_sinistres)" [style.background]="segmentColor(i)">
                        <span class="bar-value">{{ s.nombre_sinistres }}</span>
                      </div>
                    </div>
                    <span class="bar-montant">{{ s.montant_moyen | number:'1.0-0' }} DT moy.</span>
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
            </div>
          </section>

          <section class="ai-status-card ai-glow">
            <div class="ai-card-content">
              <div class="ai-header">
                <span class="ai-badge">ORCHESTRATOR v2</span>
                <div class="live-dot"></div>
              </div>
              <h3 class="ai-title">Systeme Multi-Agents</h3>
              <p class="ai-desc">Les agents specialises analysent vos donnees en temps reel pour detecter les opportunites.</p>
              <div class="agent-stack">
                <div class="agent-pill">Risk</div>
                <div class="agent-pill">Fraud</div>
                <div class="agent-pill">Pricing</div>
                <div class="agent-pill">+6</div>
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

    .stat-label { font-size: 0.9rem; color: #64748b; font-weight: 600; display: block; margin-bottom: 8px; }
    .stat-value-container { display: flex; align-items: flex-end; justify-content: space-between; }
    .stat-value { font-size: 2.25rem; font-weight: 800; font-family: var(--font-display); color: var(--ink); line-height: 1; }
    .stat-value small { font-size: 1rem; color: #94a3b8; margin-left: 4px; font-weight: 600; }

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
    .chart-card { padding: 8px; }

    .donut-layout { display: flex; align-items: center; gap: 40px; flex-wrap: wrap; padding: 12px; }
    .donut-chart {
      width: 180px; height: 180px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .donut-hole {
      width: 120px; height: 120px; border-radius: 50%; background: white;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      box-shadow: inset 0 0 0 1px #f1f5f9;
    }
    .donut-total { font-size: 1.6rem; font-weight: 800; color: var(--ink); font-family: var(--font-display); }
    .donut-total-label { font-size: 0.7rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }

    .donut-legend { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 12px; }
    .legend-item { display: grid; grid-template-columns: 12px 1fr auto auto; align-items: center; gap: 10px; font-size: 0.9rem; }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; }
    .legend-name { font-weight: 600; color: var(--ink); }
    .legend-count { color: #94a3b8; font-size: 0.8rem; }
    .legend-pct { font-weight: 700; font-family: var(--font-mono); color: var(--ink); min-width: 48px; text-align: right; }

    .claims-section { margin-top: 32px; }
    .bar-chart { display: flex; flex-direction: column; gap: 18px; padding: 12px; }
    .bar-row { display: grid; grid-template-columns: 110px 1fr 100px; align-items: center; gap: 16px; }
    .bar-label { font-weight: 700; font-size: 0.85rem; color: var(--ink); }
    .bar-track { height: 28px; background: #f1f5f9; border-radius: 8px; overflow: hidden; position: relative; }
    .bar-fill {
      height: 100%; border-radius: 8px; display: flex; align-items: center; justify-content: flex-end;
      padding-right: 10px; transition: width 0.6s ease-out; min-width: 32px;
    }
    .bar-value { color: white; font-size: 0.75rem; font-weight: 800; }
    .bar-montant { font-size: 0.8rem; color: #64748b; font-weight: 600; text-align: right; }

    .nav-cards { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .nav-card {
      display: flex; align-items: center; gap: 16px; padding: 16px; background: white; border: 1px solid var(--border);
      border-radius: 16px; transition: all 0.2s ease; cursor: pointer;
    }
    .nav-card:hover { border-color: var(--primary); transform: translateX(4px); box-shadow: var(--shadow-sm); }
    .nav-icon {
      width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
    }
    .nav-icon.primary { background: #eff6ff; color: var(--primary); }
    .nav-icon.accent { background: #fffbeb; color: var(--accent); }
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
    @media (max-width: 600px) {
      .donut-layout { flex-direction: column; }
      .bar-row { grid-template-columns: 90px 1fr; }
      .bar-montant { grid-column: 2; text-align: left; }
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
  segments = signal<SegmentDist[]>([]);
  sinistresSegment = signal<SinistreSeg[]>([]);

  private colors = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'];

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
        this.sinistresSegment.set(data.sinistres_par_segment?.sinistres_par_segment ?? []);
        this.reportLoading.set(false);
      },
      error: () => {
        this.insights.set(['Erreur: impossible de generer le rapport.']);
        this.reportLoading.set(false);
      }
    });
  }

  segmentColor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  donutGradient(): string {
    const segs = this.segments();
    if (!segs.length) return 'conic-gradient(#e2e8f0 0deg 360deg)';

    let cumulative = 0;
    const stops: string[] = [];
    segs.forEach((seg, i) => {
      const start = cumulative;
      const end = cumulative + (seg.pourcentage / 100) * 360;
      stops.push(`${this.segmentColor(i)} ${start}deg ${end}deg`);
      cumulative = end;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  barWidth(value: number): number {
    const max = Math.max(...this.sinistresSegment().map(s => s.nombre_sinistres), 1);
    return Math.max((value / max) * 100, 4);
  }
}
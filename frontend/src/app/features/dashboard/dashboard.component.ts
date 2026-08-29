import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

interface DashboardKpis {
  total_clients: number;
  avg_age: number;
  total_sinistres: number;
  avg_prime: number;
  retard_rate: number;
  fraude_suspecte: number;
}

interface SegmentDistribution {
  segment: string;
  nombre: number;
  pourcentage: number;
}

interface SinistresSegment {
  segment: string;
  nombre_sinistres: number;
  montant_moyen: number;
  montant_total: number;
  clients_concernes: number;
  pourcentage: number;
}

interface DashboardResponse {
  global_kpis?: {
    date?: string;
    kpis?: Partial<DashboardKpis>;
    insights?: string[];
  };

  segment_distribution?: SegmentDistribution[];

  sinistres_par_segment?: {
    sinistres_par_segment?: SinistresSegment[];
    insights?: string[];
  };

  last_updated?: string;
}

interface KpiCard {
  label: string;
  value: string;
  description: string;
  icon: string;
  tone: 'blue' | 'gold' | 'orange' | 'red' | 'green';
}

interface DonutSlice {
  segment: string;
  pourcentage: number;
  colorClass: string;
  cssColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],

  template: `
    <div class="dashboard-page">

      <!-- =========================================================
           PAGE HEADER (HERO BANNER)
      ========================================================== -->

      <header class="dashboard-header">

        <div class="hero-pattern"></div>
        <div class="hero-glow"></div>

        <div class="header-copy">

          <div class="eyebrow">
            <span class="eyebrow-dot"></span>
            BUSINESS INTELLIGENCE
          </div>

          <h1>
            Tableau de bord
          </h1>

          <p>
            Vue consolidee de votre portefeuille d'assurance automobile
            et de ses principaux indicateurs operationnels.
          </p>

        </div>


        <div class="header-actions">

          <div class="last-update" *ngIf="lastUpdated()">
            <mat-icon fontSet="material-symbols-outlined">
              schedule
            </mat-icon>

            <span>
              Mis a jour {{ lastUpdated() }}
            </span>
          </div>


          <button
            mat-flat-button
            class="refresh-button"
            type="button"
            (click)="refresh()"
            [disabled]="loading()"
          >

            <mat-icon
              fontSet="material-symbols-outlined"
              [class.spin]="loading()"
            >
              refresh
            </mat-icon>

            <span>
              {{ loading() ? 'Actualisation...' : 'Actualiser' }}
            </span>

          </button>

        </div>

      </header>


      <!-- =========================================================
           ERROR
      ========================================================== -->

      @if (error()) {

        <section class="error-state">

          <div class="error-icon">
            <mat-icon fontSet="material-symbols-outlined">
              cloud_off
            </mat-icon>
          </div>

          <div class="error-content">

            <strong>
              Impossible de charger les indicateurs
            </strong>

            <span>
              Verifiez que le service IA est disponible puis reessayez.
            </span>

          </div>

          <button
            mat-stroked-button
            type="button"
            (click)="refresh()"
          >
            Reessayer
          </button>

        </section>

      }


      <!-- =========================================================
           LOADING
      ========================================================== -->

      @if (loading() && !hasData()) {

        <section class="kpi-grid">

          @for (item of skeletonCards; track item) {

            <article class="kpi-card skeleton-card">

              <div class="skeleton skeleton-icon"></div>
              <div class="skeleton skeleton-label"></div>
              <div class="skeleton skeleton-value"></div>
              <div class="skeleton skeleton-description"></div>

            </article>

          }

        </section>

      }


      @if (hasData()) {

        <!-- =======================================================
             KPI GRID
        ======================================================== -->

        <section class="kpi-grid">

          @for (card of kpiCards(); track card.label; let i = $index) {

            <article
              class="kpi-card"
              [class]="'tone-' + card.tone"
              [style.animation-delay.ms]="i * 70"
            >

              <div class="kpi-top">

                <div class="kpi-icon">

                  <mat-icon fontSet="material-symbols-outlined">
                    {{ card.icon }}
                  </mat-icon>

                </div>

                <span class="kpi-category">
                  INDICATEUR
                </span>

              </div>


              <div class="kpi-main">

                <span class="kpi-label">
                  {{ card.label }}
                </span>

                <strong class="kpi-value">
                  {{ card.value }}
                </strong>

                <span class="kpi-description">
                  {{ card.description }}
                </span>

              </div>

            </article>

          }

        </section>


        <!-- =======================================================
             MAIN ANALYTICS
        ======================================================== -->

        <section class="analytics-grid">

          <!-- =====================================================
               PORTFOLIO DISTRIBUTION (DONUT)
          ====================================================== -->

          <article class="panel portfolio-panel">

            <header class="panel-header">

              <div>

                <span class="panel-kicker">
                  PORTEFEUILLE
                </span>

                <h2>
                  Repartition des profils clients
                </h2>

                <p>
                  Distribution du portefeuille selon les categories
                  actuellement calculees par le service d'analyse.
                </p>

              </div>

              <div class="panel-icon">
                <mat-icon fontSet="material-symbols-outlined">
                  donut_large
                </mat-icon>
              </div>

            </header>


            <div
              class="donut-layout"
              *ngIf="segments().length > 0; else noSegments"
            >

              <div class="donut-wrapper">

                <div
                  class="donut-ring"
                  [style.background]="donutGradient()"
                >
                  <div class="donut-hole">
                    <strong>{{ formatNumber(animatedTotalClients()) }}</strong>
                    <span>clients</span>
                  </div>
                </div>

              </div>

              <div class="segment-list">

                @for (
                  segment of segments();
                  track segment.segment;
                  let i = $index
                ) {

                  <div
                    class="segment-row"
                    [style.animation-delay.ms]="i * 70"
                  >

                    <div class="segment-meta">

                      <div class="segment-name">

                        <span
                          class="segment-dot"
                          [class]="getSegmentClass(segment.segment)"
                        ></span>

                        <strong>
                          {{ segment.segment }}
                        </strong>

                      </div>

                      <div class="segment-numbers">

                        <strong>
                          {{ formatNumber(segment.nombre) }}
                        </strong>

                        <span>
                          {{ formatPercent(segment.pourcentage) }}
                        </span>

                      </div>

                    </div>


                    <div class="progress-track">

                      <div
                        class="progress-fill"
                        [class]="getSegmentClass(segment.segment)"
                        [style.width.%]="segment.pourcentage"
                      ></div>

                    </div>

                  </div>

                }

              </div>

            </div>


            <ng-template #noSegments>

              <div class="empty-state">

                <mat-icon fontSet="material-symbols-outlined">
                  bar_chart
                </mat-icon>

                <span>
                  Aucune donnee de segmentation disponible.
                </span>

              </div>

            </ng-template>

          </article>


          <!-- =====================================================
               OPERATIONAL INDICATORS
          ====================================================== -->

          <article class="panel indicators-panel">

            <header class="panel-header">

              <div>

                <span class="panel-kicker">
                  PERFORMANCE
                </span>

                <h2>
                  Indicateurs operationnels
                </h2>

                <p>
                  Synthese des principaux signaux du portefeuille.
                </p>

              </div>

              <div class="panel-icon green-icon">
                <mat-icon fontSet="material-symbols-outlined">
                  monitoring
                </mat-icon>
              </div>

            </header>


            <div class="indicator-list">


              <!-- RETARD -->

              <div class="indicator-item">

                <div class="indicator-icon orange">

                  <mat-icon fontSet="material-symbols-outlined">
                    schedule
                  </mat-icon>

                </div>

                <div class="indicator-copy">

                  <strong>
                    Paiements en retard
                  </strong>

                  <span>
                    Taux observe dans le portefeuille
                  </span>

                </div>

                <strong class="indicator-value">
                  {{ formatPercent(animatedRetardRate()) }}
                </strong>

              </div>


              <!-- SINISTRES -->

              <div class="indicator-item">

                <div class="indicator-icon red">

                  <mat-icon fontSet="material-symbols-outlined">
                    car_crash
                  </mat-icon>

                </div>

                <div class="indicator-copy">

                  <strong>
                    Sinistres enregistres
                  </strong>

                  <span>
                    Nombre total dans les donnees
                  </span>

                </div>

                <strong class="indicator-value">
                  {{ formatNumber(animatedTotalSinistres()) }}
                </strong>

              </div>


              <!-- FRAUDE -->

              <div class="indicator-item">

                <div class="indicator-icon purple">

                  <mat-icon fontSet="material-symbols-outlined">
                    shield
                  </mat-icon>

                </div>

                <div class="indicator-copy">

                  <strong>
                    Clients signales
                  </strong>

                  <span>
                    Signal detecte par les regles disponibles
                  </span>

                </div>

                <strong class="indicator-value">
                  {{ formatNumber(animatedFraude()) }}
                </strong>

              </div>


              <!-- AGE -->

              <div class="indicator-item">

                <div class="indicator-icon blue">

                  <mat-icon fontSet="material-symbols-outlined">
                    groups
                  </mat-icon>

                </div>

                <div class="indicator-copy">

                  <strong>
                    Age moyen
                  </strong>

                  <span>
                    Profil demographique moyen
                  </span>

                </div>

                <strong class="indicator-value">
                  {{ formatNumber(animatedAvgAge(), 1) }} ans
                </strong>

              </div>

            </div>

          </article>

        </section>


        <!-- =======================================================
             CLAIMS ANALYSIS
        ======================================================== -->

        <section class="panel claims-panel">

          <header class="panel-header">

            <div>

              <span class="panel-kicker">
                SINISTRALITE
              </span>

              <h2>
                Sinistres par profil client
              </h2>

              <p>
                Volume et cout moyen des sinistres observes pour chaque
                categorie du portefeuille.
              </p>

            </div>

            <div class="claims-summary">

              <span>
                Total sinistres
              </span>

              <strong>
                {{ formatNumber(kpis().total_sinistres) }}
              </strong>

            </div>

          </header>


          @if (claims().length > 0) {

            <div class="claims-table-wrapper">

              <table class="claims-table">

                <thead>

                  <tr>
                    <th>Profil</th>
                    <th>Sinistres</th>
                    <th>Part</th>
                    <th>Montant moyen</th>
                    <th>Clients concernes</th>
                    <th>Repartition</th>
                  </tr>

                </thead>


                <tbody>

                  @for (
                    claim of claims();
                    track claim.segment;
                    let i = $index
                  ) {

                    <tr [style.animation-delay.ms]="i * 60">

                      <td>

                        <div class="table-segment">

                          <span
                            class="segment-dot"
                            [class]="getSegmentClass(claim.segment)"
                          ></span>

                          <strong>
                            {{ claim.segment }}
                          </strong>

                        </div>

                      </td>


                      <td class="numeric">
                        {{ formatNumber(claim.nombre_sinistres) }}
                      </td>


                      <td>

                        <span class="percentage-badge">
                          {{ formatPercent(claim.pourcentage) }}
                        </span>

                      </td>


                      <td class="numeric">
                        {{ formatMoney(claim.montant_moyen) }}
                      </td>


                      <td class="numeric">
                        {{ formatNumber(claim.clients_concernes) }}
                      </td>


                      <td class="bar-cell">

                        <div class="mini-bar-track">

                          <div
                            class="mini-bar-fill"
                            [class]="getSegmentClass(claim.segment)"
                            [style.width.%]="claim.pourcentage"
                          ></div>

                        </div>

                      </td>

                    </tr>

                  }

                </tbody>

              </table>

            </div>

          } @else {

            <div class="empty-state large">

              <mat-icon fontSet="material-symbols-outlined">
                analytics
              </mat-icon>

              <strong>
                Analyse de sinistralite indisponible
              </strong>

              <span>
                Aucune donnee de sinistre par profil n'a ete retournee.
              </span>

            </div>

          }

        </section>


        <!-- =======================================================
             AI ENGINE
        ======================================================== -->

        <section class="ai-engine-card">

          <div class="ai-engine-main">

            <div class="ai-engine-icon">

              <mat-icon fontSet="material-symbols-outlined">
                auto_awesome
              </mat-icon>

            </div>


            <div class="ai-engine-copy">

              <div class="ai-engine-title">

                <span>
                  Intelligence multi-agents
                </span>

                <span class="online-badge">
                  <span></span>
                  OPERATIONNEL
                </span>

              </div>


              <p>
                Le portefeuille peut etre analyse par les agents specialises
                du systeme pour produire une decision metier contextualisee.
              </p>


              <div class="agent-list">

                <span>
                  <mat-icon fontSet="material-symbols-outlined">
                    category
                  </mat-icon>
                  Segmentation
                </span>

                <span>
                  <mat-icon fontSet="material-symbols-outlined">
                    query_stats
                  </mat-icon>
                  Risque
                </span>

                <span>
                  <mat-icon fontSet="material-symbols-outlined">
                    payments
                  </mat-icon>
                  Pricing
                </span>

                <span>
                  <mat-icon fontSet="material-symbols-outlined">
                    recommend
                  </mat-icon>
                  Recommandation
                </span>

                <span>
                  <mat-icon fontSet="material-symbols-outlined">
                    shield
                  </mat-icon>
                  Fraude
                </span>

                <span>
                  <mat-icon fontSet="material-symbols-outlined">
                    verified
                  </mat-icon>
                  Conformite
                </span>

              </div>

            </div>

          </div>


          <a
            mat-flat-button
            class="analysis-button"
            routerLink="/customers"
          >

            <span>
              Ouvrir le centre d'analyse
            </span>

            <mat-icon fontSet="material-symbols-outlined">
              arrow_forward
            </mat-icon>

          </a>

        </section>


        <!-- =======================================================
             DATA QUALITY NOTE
        ======================================================== -->

        <section class="data-quality">

          <div class="data-quality-icon">

            <mat-icon fontSet="material-symbols-outlined">
              verified
            </mat-icon>

          </div>

          <div>

            <strong>
              Indicateurs issus du service d'analyse
            </strong>

            <span>
              Les valeurs affichees sont chargees dynamiquement depuis
              l'API du projet. Aucune valeur de demonstration n'est ajoutee
              au dashboard.
            </span>

          </div>

        </section>

      }

    </div>
  `,

  styles: [`

    /* =========================================================
       PAGE
    ========================================================== */

    :host {
      display: block;
      width: 100%;
    }


    .dashboard-page {
      min-height: 100vh;
      padding: 34px;
      background: #f5f7fb;
      color: #0f172a;

      animation: page-fade-in .5s ease-out both;
    }


    @keyframes page-fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }


    /* =========================================================
       HEADER — HERO BANNER
    ========================================================== */

    .dashboard-header {
      position: relative;
      overflow: hidden;

      max-width: 1500px;
      margin: 0 auto 28px;

      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 30px;

      padding: 40px 44px;

      border-radius: 24px;

      background:
        linear-gradient(
          135deg,
          #071a2f 0%,
          #0b2442 45%,
          #123761 100%
        );

      box-shadow:
        0 20px 50px rgba(7, 26, 47, .28),
        0 4px 14px rgba(7, 26, 47, .18);
    }


    .hero-pattern {
      position: absolute;
      inset: 0;

      background-image:
        radial-gradient(
          rgba(255, 255, 255, .07) 1px,
          transparent 1px
        );

      background-size: 22px 22px;

      opacity: .5;

      pointer-events: none;
    }


    .hero-glow {
      position: absolute;

      top: -55%;
      right: -8%;

      width: 380px;
      height: 380px;

      border-radius: 50%;

      background:
        radial-gradient(
          circle,
          rgba(196, 154, 74, .22),
          transparent 70%
        );

      pointer-events: none;
    }


    .header-copy {
      position: relative;
      z-index: 1;

      min-width: 0;
    }


    .eyebrow {
      display: flex;
      align-items: center;
      gap: 8px;

      margin-bottom: 10px;

      color: #d8b56b;

      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 800;

      letter-spacing: .12em;
    }


    .eyebrow-dot {
      width: 7px;
      height: 7px;

      border-radius: 50%;

      background: #c49a4a;

      box-shadow: 0 0 0 4px rgba(196, 154, 74, .18);

      animation: pulse-dot 2.2s ease-in-out infinite;
    }


    @keyframes pulse-dot {
      0%, 100% {
        box-shadow: 0 0 0 4px rgba(196, 154, 74, .18);
      }
      50% {
        box-shadow: 0 0 0 7px rgba(196, 154, 74, .26);
      }
    }


    h1 {
      margin: 0;

      font-family: 'Space Grotesk', 'Manrope', 'Inter', sans-serif;

      color: #ffffff;

      font-size: clamp(32px, 4vw, 48px);
      line-height: 1.05;

      font-weight: 700;

      letter-spacing: -.045em;
    }


    .header-copy p {
      max-width: 640px;

      margin: 12px 0 0;

      color: rgba(255, 255, 255, .68);

      font-family: 'Inter', sans-serif;
      font-size: 14px;
      line-height: 1.7;
    }


    .header-actions {
      position: relative;
      z-index: 1;

      display: flex;
      align-items: center;
      gap: 12px;

      flex-shrink: 0;
    }


    .last-update {
      display: flex;
      align-items: center;
      gap: 7px;

      padding: 8px 12px;

      border-radius: 10px;

      background: rgba(255, 255, 255, .06);
      border: 1px solid rgba(255, 255, 255, .10);

      color: rgba(255, 255, 255, .72);

      font-family: 'Inter', sans-serif;
      font-size: 11px;
      white-space: nowrap;
    }


    .last-update mat-icon {
      width: 17px;
      height: 17px;

      font-size: 17px;
    }


    .refresh-button {
      min-height: 44px !important;

      padding: 0 18px !important;

      border-radius: 11px !important;

      background:
        linear-gradient(135deg, #d8b56b, #c49a4a) !important;
      color: #071a2f !important;

      font-weight: 700 !important;

      box-shadow: 0 10px 24px rgba(196, 154, 74, .30);

      transition: transform .18s ease, box-shadow .18s ease !important;
    }


    .refresh-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 14px 30px rgba(196, 154, 74, .40);
    }


    .refresh-button:active:not(:disabled) {
      transform: translateY(0) scale(.96);
    }


    .refresh-button mat-icon {
      margin-right: 7px;
    }


    /* =========================================================
       KPI
    ========================================================== */

    .kpi-grid {
      max-width: 1500px;

      margin: 0 auto 22px;

      display: grid;

      grid-template-columns:
        repeat(4, minmax(0, 1fr));

      gap: 16px;
    }


    .kpi-card {
      min-height: 175px;

      position: relative;

      padding: 21px;

      overflow: hidden;

      border: 1px solid #e2e8f0;
      border-radius: 17px;
      border-top: 3px solid transparent;

      background: #ffffff;

      box-shadow:
        0 5px 20px rgba(15, 23, 42, .045);

      transition:
        transform .2s ease,
        box-shadow .2s ease;

      animation: kpi-rise .45s ease-out backwards;
    }


    @keyframes kpi-rise {
      from {
        opacity: 0;
        transform: translateY(14px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }


    .kpi-card:hover {
      transform: translateY(-3px);

      box-shadow:
        0 14px 32px rgba(15, 23, 42, .09);
    }


    .kpi-card::after {
      content: "";

      position: absolute;

      right: -30px;
      bottom: -45px;

      width: 110px;
      height: 110px;

      border-radius: 50%;

      opacity: .08;
    }


    .tone-blue { border-top-color: #2563eb; }
    .tone-gold { border-top-color: #c49a4a; }
    .tone-orange { border-top-color: #d97706; }
    .tone-red { border-top-color: #dc2626; }
    .tone-green { border-top-color: #16a34a; }


    .tone-blue::after {
      background: #2563eb;
    }


    .tone-gold::after {
      background: #c49a4a;
    }


    .tone-orange::after {
      background: #d97706;
    }


    .tone-red::after {
      background: #dc2626;
    }


    .tone-green::after {
      background: #16a34a;
    }


    /* Premium colored resting shadow per tone (two-class selector
       so specificity safely beats the generic .kpi-card / :hover rules
       regardless of source order). */

    .kpi-card.tone-blue {
      box-shadow:
        0 5px 20px rgba(15, 23, 42, .045),
        0 10px 26px rgba(37, 99, 235, .08);
    }

    .kpi-card.tone-gold {
      box-shadow:
        0 5px 20px rgba(15, 23, 42, .045),
        0 10px 26px rgba(196, 154, 74, .10);
    }

    .kpi-card.tone-orange {
      box-shadow:
        0 5px 20px rgba(15, 23, 42, .045),
        0 10px 26px rgba(217, 119, 6, .09);
    }

    .kpi-card.tone-red {
      box-shadow:
        0 5px 20px rgba(15, 23, 42, .045),
        0 10px 26px rgba(220, 38, 38, .09);
    }

    .kpi-card.tone-green {
      box-shadow:
        0 5px 20px rgba(15, 23, 42, .045),
        0 10px 26px rgba(22, 163, 74, .09);
    }


    .kpi-card.tone-blue:hover {
      box-shadow:
        0 14px 32px rgba(15, 23, 42, .09),
        0 16px 36px rgba(37, 99, 235, .18);
    }

    .kpi-card.tone-gold:hover {
      box-shadow:
        0 14px 32px rgba(15, 23, 42, .09),
        0 16px 36px rgba(196, 154, 74, .22);
    }

    .kpi-card.tone-orange:hover {
      box-shadow:
        0 14px 32px rgba(15, 23, 42, .09),
        0 16px 36px rgba(217, 119, 6, .20);
    }

    .kpi-card.tone-red:hover {
      box-shadow:
        0 14px 32px rgba(15, 23, 42, .09),
        0 16px 36px rgba(220, 38, 38, .20);
    }

    .kpi-card.tone-green:hover {
      box-shadow:
        0 14px 32px rgba(15, 23, 42, .09),
        0 16px 36px rgba(22, 163, 74, .20);
    }


    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-bottom: 22px;
    }


    .kpi-icon {
      width: 39px;
      height: 39px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 11px;

      transition: transform .2s ease;
    }


    .kpi-card:hover .kpi-icon {
      transform: scale(1.08) rotate(-4deg);
    }


    .tone-blue .kpi-icon {
      background: #eff6ff;
      color: #2563eb;
    }


    .tone-gold .kpi-icon {
      background: #f8f1df;
      color: #a67c2f;
    }


    .tone-orange .kpi-icon {
      background: #fff7ed;
      color: #d97706;
    }


    .tone-red .kpi-icon {
      background: #fef2f2;
      color: #dc2626;
    }


    .tone-green .kpi-icon {
      background: #f0fdf4;
      color: #16a34a;
    }


    .kpi-icon mat-icon {
      font-size: 20px;
    }


    .kpi-category {
      color: #94a3b8;

      font-family: 'Inter', sans-serif;
      font-size: 9px;
      font-weight: 800;

      letter-spacing: .11em;
    }


    .kpi-main {
      display: flex;
      flex-direction: column;
    }


    .kpi-label {
      order: 1;

      color: #64748b;

      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 600;
    }


    .kpi-value {
      order: 2;

      margin-top: 4px;

      color: #0f172a;

      font-family: 'Space Grotesk', 'Manrope', sans-serif;

      font-size: 31px;
      line-height: 1.1;

      font-weight: 700;

      letter-spacing: -.03em;

      font-variant-numeric: tabular-nums;
    }


    .kpi-description {
      order: 3;

      margin-top: 6px;

      color: #94a3b8;

      font-family: 'Inter', sans-serif;
      font-size: 11px;
    }


    /* =========================================================
       PANELS
    ========================================================== */

    .analytics-grid {
      max-width: 1500px;

      margin: 0 auto 22px;

      display: grid;

      grid-template-columns:
        minmax(0, 1.45fr)
        minmax(360px, .85fr);

      gap: 18px;
    }


    .panel {
      min-width: 0;

      padding: 25px;

      border: 1px solid #e2e8f0;
      border-radius: 17px;

      background: #ffffff;

      box-shadow:
        0 5px 20px rgba(15, 23, 42, .045);

      transition: box-shadow .2s ease;
    }


    .panel:hover {
      box-shadow:
        0 10px 30px rgba(15, 23, 42, .07);
    }


    /* Accent colore par panel, coherent avec le reste de la page
       (meme logique que les bordures de tonalite des cartes KPI). */

    .portfolio-panel {
      border-top: 3px solid #2563eb;
    }

    .indicators-panel {
      border-top: 3px solid #16a34a;
    }

    .claims-panel {
      border-top: 3px solid #dc2626;
    }


    .portfolio-panel:hover {
      box-shadow:
        0 10px 30px rgba(15, 23, 42, .07),
        0 14px 32px rgba(37, 99, 235, .10);
    }

    .indicators-panel:hover {
      box-shadow:
        0 10px 30px rgba(15, 23, 42, .07),
        0 14px 32px rgba(22, 163, 74, .10);
    }

    .claims-panel:hover {
      box-shadow:
        0 10px 30px rgba(15, 23, 42, .07),
        0 14px 32px rgba(220, 38, 38, .10);
    }


    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      gap: 20px;

      margin-bottom: 25px;
    }


    .panel-kicker {
      color: #94a3b8;

      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 800;

      letter-spacing: .12em;
    }


    .panel h2 {
      margin: 5px 0 5px;

      color: #0f172a;

      font-family: 'Space Grotesk', 'Manrope', sans-serif;

      font-size: 21px;
      line-height: 1.25;

      font-weight: 700;

      letter-spacing: -.02em;
    }


    .panel-header p {
      margin: 0;

      color: #94a3b8;

      font-family: 'Inter', sans-serif;
      font-size: 12px;
      line-height: 1.55;
    }


    .panel-icon {
      width: 42px;
      height: 42px;

      display: flex;
      align-items: center;
      justify-content: center;

      flex-shrink: 0;

      border-radius: 12px;

      background: #eff6ff;

      color: #2563eb;
    }


    .green-icon {
      background: #f0fdf4;
      color: #16a34a;
    }


    /* =========================================================
       DONUT
    ========================================================== */

    .donut-layout {
      display: flex;
      align-items: center;
      gap: 32px;
    }


    .donut-wrapper {
      flex-shrink: 0;

      animation: donut-in .7s cubic-bezier(.16,1,.3,1) both;
    }


    @keyframes donut-in {
      from {
        opacity: 0;
        transform: scale(.82) rotate(-8deg);
      }
      to {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }
    }


    .donut-ring {
      width: 168px;
      height: 168px;

      border-radius: 50%;

      display: flex;
      align-items: center;
      justify-content: center;

      box-shadow:
        0 10px 26px rgba(15, 23, 42, .10);

      transition: background 0.6s ease;
    }


    .donut-hole {
      width: 112px;
      height: 112px;

      border-radius: 50%;

      background: #ffffff;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      box-shadow: inset 0 0 0 1px #f1f5f9;
    }


    .donut-hole strong {
      font-family: 'Space Grotesk', 'Manrope', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -.02em;
    }


    .donut-hole span {
      margin-top: 2px;
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: .06em;
    }


    .segment-list {
      flex: 1;
      min-width: 0;

      display: flex;
      flex-direction: column;
      gap: 18px;
    }


    .segment-row {
      width: 100%;

      animation: row-slide-in .45s ease-out backwards;
    }


    @keyframes row-slide-in {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }


    .segment-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      margin-bottom: 8px;
    }


    .segment-name {
      display: flex;
      align-items: center;
      gap: 9px;

      color: #334155;

      font-family: 'Inter', sans-serif;
      font-size: 13px;
    }


    .segment-numbers {
      display: flex;
      align-items: center;
      gap: 9px;
    }


    .segment-numbers strong {
      color: #0f172a;

      font-family: 'Inter', sans-serif;
      font-size: 13px;
    }


    .segment-numbers span {
      min-width: 47px;

      padding: 3px 7px;

      border-radius: 7px;

      background: #f8fafc;

      color: #64748b;

      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 700;

      text-align: center;
    }


    .segment-dot {
      width: 9px;
      height: 9px;

      flex-shrink: 0;

      border-radius: 50%;

      display: inline-block;
    }


    .segment-dot.famille,
    .progress-fill.famille,
    .mini-bar-fill.famille {
      background: #2563eb;
    }


    .segment-dot.jeune,
    .progress-fill.jeune,
    .mini-bar-fill.jeune {
      background: #c49a4a;
    }


    .segment-dot.professionnel,
    .progress-fill.professionnel,
    .mini-bar-fill.professionnel {
      background: #7c3aed;
    }


    .segment-dot.senior,
    .progress-fill.senior,
    .mini-bar-fill.senior {
      background: #16a34a;
    }


    .progress-track {
      height: 8px;

      overflow: hidden;

      border-radius: 999px;

      background: #eef2f7;
    }


    .progress-fill {
      height: 100%;

      border-radius: inherit;

      min-width: 3px;

      transition: width .6s cubic-bezier(.4,0,.2,1);
    }


    /* =========================================================
       INDICATORS
    ========================================================== */

    .indicator-list {
      display: flex;
      flex-direction: column;
    }


    .indicator-item {
      min-height: 69px;

      display: flex;
      align-items: center;

      gap: 12px;

      border-bottom: 1px solid #f1f5f9;

      transition: padding-left .18s ease;
    }


    .indicator-item:hover {
      padding-left: 4px;
    }


    .indicator-item:last-child {
      border-bottom: 0;
    }


    .indicator-icon {
      width: 37px;
      height: 37px;

      display: flex;
      align-items: center;
      justify-content: center;

      flex-shrink: 0;

      border-radius: 10px;
    }


    .indicator-icon mat-icon {
      font-size: 19px;
    }


    .indicator-icon.orange {
      background: #fff7ed;
      color: #d97706;
    }


    .indicator-icon.red {
      background: #fef2f2;
      color: #dc2626;
    }


    .indicator-icon.purple {
      background: #f5f3ff;
      color: #7c3aed;
    }


    .indicator-icon.blue {
      background: #eff6ff;
      color: #2563eb;
    }


    .indicator-copy {
      min-width: 0;

      display: flex;
      flex-direction: column;

      flex: 1;
    }


    .indicator-copy strong {
      color: #334155;

      font-family: 'Inter', sans-serif;
      font-size: 12px;
    }


    .indicator-copy span {
      margin-top: 2px;

      color: #94a3b8;

      font-family: 'Inter', sans-serif;
      font-size: 10px;

      line-height: 1.4;
    }


    .indicator-value {
      color: #0f172a;

      font-family: 'Space Grotesk', 'Manrope', sans-serif;

      font-size: 15px;
      font-weight: 700;

      white-space: nowrap;

      font-variant-numeric: tabular-nums;
    }


    /* =========================================================
       CLAIMS
    ========================================================== */

    .claims-panel {
      max-width: 1500px;

      margin: 0 auto 22px;
    }


    .claims-summary {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      padding: 9px 13px;

      border: 1px solid #e2e8f0;
      border-radius: 11px;

      background: #f8fafc;

      white-space: nowrap;
    }


    .claims-summary span {
      color: #94a3b8;

      font-family: 'Inter', sans-serif;
      font-size: 9px;
      font-weight: 700;

      text-transform: uppercase;

      letter-spacing: .06em;
    }


    .claims-summary strong {
      margin-top: 2px;

      color: #0f172a;

      font-family: 'Space Grotesk', 'Manrope', sans-serif;
      font-size: 16px;
      font-weight: 700;
    }


    .claims-table-wrapper {
      overflow-x: auto;
    }


    .claims-table {
      width: 100%;

      border-collapse: collapse;
    }


    .claims-table th {
      padding: 11px 12px;

      border-bottom: 1px solid #e2e8f0;

      color: #94a3b8;

      font-family: 'Inter', sans-serif;
      font-size: 9px;
      font-weight: 800;

      letter-spacing: .07em;

      text-align: left;

      text-transform: uppercase;

      white-space: nowrap;
    }


    .claims-table td {
      padding: 14px 12px;

      border-bottom: 1px solid #f1f5f9;

      color: #475569;

      font-family: 'Inter', sans-serif;
      font-size: 12px;

      white-space: nowrap;
    }


    .claims-table tbody tr:last-child td {
      border-bottom: 0;
    }


    .claims-table tbody tr {
      transition: background .15s ease;

      animation: row-slide-in .4s ease-out backwards;
    }


    .claims-table tbody tr:hover {
      background: #f8fafc;
    }


    .table-segment {
      display: flex;
      align-items: center;
      gap: 8px;

      color: #334155;
    }


    .numeric {
      font-variant-numeric: tabular-nums;

      color: #0f172a !important;

      font-weight: 600;
    }


    .percentage-badge {
      display: inline-flex;

      padding: 4px 8px;

      border-radius: 7px;

      background: #f8fafc;

      color: #64748b;

      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 700;
    }


    .bar-cell {
      width: 160px;
    }


    .mini-bar-track {
      width: 100%;
      height: 7px;

      overflow: hidden;

      border-radius: 999px;

      background: #eef2f7;
    }


    .mini-bar-fill {
      height: 100%;

      min-width: 3px;

      border-radius: inherit;

      transition: width .6s cubic-bezier(.4,0,.2,1);
    }


    /* =========================================================
       AI ENGINE
    ========================================================== */

    .ai-engine-card {
      max-width: 1500px;

      margin: 0 auto 18px;

      padding: 25px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 25px;

      border: 1px solid #dbe5f2;
      border-top: 3px solid #c49a4a;
      border-radius: 17px;

      background:
        linear-gradient(
          135deg,
          #ffffff 0%,
          #f8fbff 100%
        );

      box-shadow:
        0 10px 30px rgba(37, 99, 235, .07),
        0 8px 28px rgba(15, 23, 42, .055);

      transition: box-shadow .2s ease;

      position: relative;
      overflow: hidden;
    }


    .ai-engine-card:hover {
      box-shadow:
        0 14px 36px rgba(196, 154, 74, .14),
        0 8px 28px rgba(15, 23, 42, .07);
    }


    .ai-engine-card::before {
      content: "";
      position: absolute;
      top: -60%;
      right: -10%;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(37,99,235,.10), transparent 70%);
      pointer-events: none;
    }


    .ai-engine-main {
      min-width: 0;

      display: flex;
      align-items: flex-start;

      gap: 17px;

      position: relative;
      z-index: 1;
    }


    .ai-engine-icon {
      width: 48px;
      height: 48px;

      display: flex;
      align-items: center;
      justify-content: center;

      flex-shrink: 0;

      border-radius: 14px;

      background:
        linear-gradient(
          135deg,
          #2563eb,
          #4f46e5
        );

      color: white;

      box-shadow:
        0 9px 20px rgba(37, 99, 235, .20);
    }


    .ai-engine-icon mat-icon {
      font-size: 24px;
    }


    .ai-engine-copy {
      min-width: 0;
    }


    .ai-engine-title {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      color: #0f172a;

      font-family: 'Space Grotesk', 'Manrope', sans-serif;

      font-size: 18px;
      font-weight: 700;
    }


    .online-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;

      padding: 4px 8px;

      border-radius: 999px;

      background: #f0fdf4;

      color: #15803d;

      font-family: 'Inter', sans-serif;

      font-size: 8px;
      font-weight: 800;

      letter-spacing: .07em;
    }


    .online-badge span {
      width: 5px;
      height: 5px;

      border-radius: 50%;

      background: #16a34a;

      animation: pulse-dot 2.2s ease-in-out infinite;
    }


    .ai-engine-copy p {
      max-width: 760px;

      margin: 5px 0 13px;

      color: #64748b;

      font-family: 'Inter', sans-serif;
      font-size: 12px;
      line-height: 1.55;
    }


    .agent-list {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }


    .agent-list span {
      display: inline-flex;
      align-items: center;
      gap: 5px;

      padding: 6px 9px;

      border: 1px solid #e2e8f0;
      border-radius: 8px;

      background: #ffffff;

      color: #64748b;

      font-family: 'Inter', sans-serif;
      font-size: 9px;
      font-weight: 700;

      transition: border-color .15s ease, color .15s ease, transform .15s ease;

      animation: pill-pop .35s ease-out backwards;
    }


    .agent-list span:nth-child(1) { animation-delay: .05s; }
    .agent-list span:nth-child(2) { animation-delay: .10s; }
    .agent-list span:nth-child(3) { animation-delay: .15s; }
    .agent-list span:nth-child(4) { animation-delay: .20s; }
    .agent-list span:nth-child(5) { animation-delay: .25s; }
    .agent-list span:nth-child(6) { animation-delay: .30s; }


    @keyframes pill-pop {
      from {
        opacity: 0;
        transform: scale(.8) translateY(4px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }


    .agent-list span:hover {
      border-color: #2563eb;
      color: #2563eb;
      transform: translateY(-1px);
    }


    .agent-list mat-icon {
      width: 14px;
      height: 14px;

      font-size: 14px;

      color: #2563eb;
    }


    .analysis-button {
      min-height: 43px !important;

      flex-shrink: 0;

      border-radius: 10px !important;

      background:
        linear-gradient(135deg, #0f172a, #1e293b) !important;
      color: #ffffff !important;

      box-shadow: 0 10px 22px rgba(15, 23, 42, .22);

      position: relative;
      z-index: 1;

      transition: transform .18s ease, box-shadow .18s ease !important;
    }


    .analysis-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 28px rgba(15, 23, 42, .30);
    }


    .analysis-button:active {
      transform: translateY(0) scale(.97);
    }


    .analysis-button mat-icon {
      margin-left: 7px;
    }


    /* =========================================================
       DATA QUALITY
    ========================================================== */

    .data-quality {
      max-width: 1500px;

      margin: 0 auto;

      padding: 13px 15px;

      display: flex;
      align-items: center;

      gap: 11px;

      border: 1px solid #e2e8f0;
      border-left: 3px solid #16a34a;
      border-radius: 11px;

      background: #ffffff;

      box-shadow: 0 3px 12px rgba(15, 23, 42, .03);
    }


    .data-quality-icon {
      width: 30px;
      height: 30px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 8px;

      background: #f0fdf4;
      color: #16a34a;
    }


    .data-quality-icon mat-icon {
      font-size: 17px;
    }


    .data-quality div:last-child {
      display: flex;
      flex-direction: column;
    }


    .data-quality strong {
      color: #334155;

      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 800;
    }


    .data-quality span {
      margin-top: 2px;

      color: #94a3b8;

      font-family: 'Inter', sans-serif;
      font-size: 10px;
      line-height: 1.4;
    }


    /* =========================================================
       EMPTY / ERROR
    ========================================================== */

    .empty-state {
      min-height: 180px;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      gap: 8px;

      color: #94a3b8;

      text-align: center;
    }


    .empty-state mat-icon {
      width: 38px;
      height: 38px;

      font-size: 38px;

      opacity: .55;
    }


    .empty-state.large {
      min-height: 220px;
    }


    .empty-state strong {
      color: #475569;

      font-family: 'Inter', sans-serif;
      font-size: 13px;
    }


    .empty-state span {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
    }


    .error-state {
      max-width: 1500px;

      margin: 0 auto 20px;

      padding: 15px 17px;

      display: flex;
      align-items: center;

      gap: 12px;

      border: 1px solid #fecaca;
      border-radius: 12px;

      background: #fff7f7;
    }


    .error-icon {
      width: 38px;
      height: 38px;

      display: flex;
      align-items: center;
      justify-content: center;

      flex-shrink: 0;

      border-radius: 10px;

      background: #fee2e2;

      color: #dc2626;
    }


    .error-icon mat-icon {
      font-size: 19px;
    }


    .error-content {
      min-width: 0;

      display: flex;
      flex-direction: column;

      flex: 1;
    }


    .error-content strong {
      color: #991b1b;

      font-family: 'Inter', sans-serif;
      font-size: 12px;
    }


    .error-content span {
      color: #b91c1c;

      font-family: 'Inter', sans-serif;
      font-size: 10px;
    }


    /* =========================================================
       SKELETON
    ========================================================== */

    .skeleton-card {
      pointer-events: none;
    }


    .skeleton {
      position: relative;
      overflow: hidden;

      background:
        linear-gradient(
          90deg,
          #f1f5f9 25%,
          #e2e8f0 37%,
          #f1f5f9 63%
        );

      background-size: 400% 100%;

      animation: skeleton-loading 1.4s ease infinite;

      border-radius: 7px;
    }


    .skeleton-icon {
      width: 39px;
      height: 39px;

      margin-bottom: 20px;
    }


    .skeleton-label {
      width: 90px;
      height: 10px;
    }


    .skeleton-value {
      width: 125px;
      height: 28px;

      margin-top: 7px;
    }


    .skeleton-description {
      width: 160px;
      height: 9px;

      margin-top: 8px;
    }


    @keyframes skeleton-loading {
      0% {
        background-position: 100% 0;
      }

      100% {
        background-position: 0 0;
      }
    }


    .spin {
      animation: spin .8s linear infinite;
    }


    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }


    /* =========================================================
       RESPONSIVE
    ========================================================== */

    @media (max-width: 1200px) {

      .dashboard-page {
        padding: 27px;
      }

      .dashboard-header {
        padding: 32px;
      }

      .kpi-grid {
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
      }

      .analytics-grid {
        grid-template-columns: 1fr;
      }

      .donut-layout {
        flex-direction: column;
        align-items: flex-start;
      }

    }


    @media (max-width: 800px) {

      .dashboard-page {
        padding: 20px 16px;
      }

      .dashboard-header {
        align-items: flex-start;

        flex-direction: column;

        padding: 26px 22px;

        border-radius: 20px;
      }

      .header-actions {
        width: 100%;

        justify-content: space-between;
      }

      .last-update {
        white-space: normal;
      }

      .ai-engine-card {
        align-items: flex-start;

        flex-direction: column;
      }

      .analysis-button {
        width: 100%;
      }

      .donut-layout {
        gap: 20px;
      }

    }


    @media (max-width: 600px) {

      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .kpi-card {
        min-height: 155px;
      }

      .panel {
        padding: 18px;
      }

      .panel-header {
        flex-direction: column;
      }

      .claims-summary {
        align-items: flex-start;
      }

      .data-quality {
        align-items: flex-start;
      }

      .donut-ring {
        width: 140px;
        height: 140px;
      }

      .donut-hole {
        width: 94px;
        height: 94px;
      }

    }

  `],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {

  private readonly http = inject(HttpClient);

  /*
   * IMPORTANT :
   * Le backend expose actuellement /api/advisor/dashboard sur le port 8080.
   * On garde cette URL pour ne pas casser le backend existant.
   */
  private readonly apiUrl =
    `${environment.apiUrl}/api/advisor/dashboard`;

  loading = signal<boolean>(false);

  error = signal<boolean>(false);

  dashboard = signal<DashboardResponse | null>(null);


  skeletonCards = [1, 2, 3, 4];


  /* ---------------------------------------------------------
     Compteurs animes : chaque valeur KPI "monte" en douceur
     vers sa cible reelle au lieu de s'afficher brutalement.
     --------------------------------------------------------- */

  animatedTotalClients = signal(0);
  animatedAvgPrime = signal(0);
  animatedRetardRate = signal(0);
  animatedTotalSinistres = signal(0);
  animatedFraude = signal(0);
  animatedAvgAge = signal(0);


  private readonly segmentColors: Record<string, string> = {
    famille: '#2563eb',
    jeune: '#c49a4a',
    professionnel: '#7c3aed',
    senior: '#16a34a'
  };


  constructor() {

    /*
     * A chaque changement des KPI reels (nouveau chargement ou
     * rafraichissement), on relance une interpolation douce de
     * chaque compteur vers la nouvelle valeur. `untracked` evite
     * que la lecture de la valeur de depart ne cree une dependance
     * circulaire sur le signal anime lui-meme.
     */

    effect(() => {

      const k = this.kpis();

      this.tween(
        untracked(() => this.animatedTotalClients()),
        k.total_clients,
        v => this.animatedTotalClients.set(v)
      );

      this.tween(
        untracked(() => this.animatedAvgPrime()),
        k.avg_prime,
        v => this.animatedAvgPrime.set(v)
      );

      this.tween(
        untracked(() => this.animatedRetardRate()),
        k.retard_rate,
        v => this.animatedRetardRate.set(v)
      );

      this.tween(
        untracked(() => this.animatedTotalSinistres()),
        k.total_sinistres,
        v => this.animatedTotalSinistres.set(v)
      );

      this.tween(
        untracked(() => this.animatedFraude()),
        k.fraude_suspecte,
        v => this.animatedFraude.set(v)
      );

      this.tween(
        untracked(() => this.animatedAvgAge()),
        k.avg_age,
        v => this.animatedAvgAge.set(v)
      );

    });

  }


  /**
   * Interpolation ease-out d'une valeur numerique vers sa cible,
   * via requestAnimationFrame. Utilise pour l'effet "compteur qui
   * monte" sur les cartes KPI et les indicateurs.
   */
  private tween(
    from: number,
    to: number,
    setter: (value: number) => void,
    duration = 750
  ): void {

    const start = performance.now();
    const delta = to - from;

    if (Math.abs(delta) < 0.0001) {
      setter(to);
      return;
    }

    const step = (now: number) => {

      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      setter(from + delta * eased);

      if (t < 1) {
        requestAnimationFrame(step);
      }

    };

    requestAnimationFrame(step);

  }


  kpis = computed<DashboardKpis>(() => {

    const data = this.dashboard();

    const raw = data?.global_kpis?.kpis ?? {};

    return {
      total_clients: Number(raw.total_clients ?? 0),
      avg_age: Number(raw.avg_age ?? 0),
      total_sinistres: Number(raw.total_sinistres ?? 0),
      avg_prime: Number(raw.avg_prime ?? 0),
      retard_rate: Number(raw.retard_rate ?? 0),
      fraude_suspecte: Number(raw.fraude_suspecte ?? 0)
    };

  });


  segments = computed<SegmentDistribution[]>(() => {

    const data = this.dashboard();

    return [...(data?.segment_distribution ?? [])]
      .filter(item => item && item.segment)
      .sort((a, b) => b.nombre - a.nombre);

  });


  claims = computed<SinistresSegment[]>(() => {

    const data = this.dashboard();

    return [
      ...(data?.sinistres_par_segment?.sinistres_par_segment ?? [])
    ]
      .filter(item => item && item.segment)
      .sort(
        (a, b) =>
          Number(b.nombre_sinistres ?? 0) -
          Number(a.nombre_sinistres ?? 0)
      );

  });


  hasData = computed<boolean>(() => {

    const data = this.dashboard();

    return !!data &&
      (
        !!data.global_kpis ||
        (data.segment_distribution?.length ?? 0) > 0 ||
        (data.sinistres_par_segment?.sinistres_par_segment?.length ?? 0) > 0
      );

  });


  kpiCards = computed<KpiCard[]>(() => {

    return [

      {
        label: 'Clients',
        value: this.formatNumber(this.animatedTotalClients()),
        description: 'Portefeuille total analyse',
        icon: 'groups',
        tone: 'blue'
      },

      {
        label: 'Prime moyenne',
        value: this.formatMoney(this.animatedAvgPrime()),
        description: 'Prime actuelle moyenne',
        icon: 'payments',
        tone: 'gold'
      },

      {
        label: 'Paiements en retard',
        value: this.formatPercent(this.animatedRetardRate()),
        description: 'Taux observe dans le portefeuille',
        icon: 'schedule',
        tone: 'orange'
      },

      {
        label: 'Sinistres',
        value: this.formatNumber(this.animatedTotalSinistres()),
        description: 'Sinistres enregistres',
        icon: 'car_crash',
        tone: 'red'
      }

    ];

  });


  donutSlices = computed<DonutSlice[]>(() => {

    return this.segments().map(segment => {

      const colorClass = this.getSegmentClass(segment.segment);

      return {
        segment: segment.segment,
        pourcentage: segment.pourcentage,
        colorClass,
        cssColor: this.segmentColors[colorClass] ?? '#94a3b8'
      };

    });

  });


  /**
   * Construit un degrade conique CSS pur (aucune dependance graphique)
   * pour dessiner le donut de repartition des segments.
   */
  donutGradient = computed<string>(() => {

    const slices = this.donutSlices();

    if (slices.length === 0) {
      return '#eef2f7';
    }

    let cumulative = 0;

    const stops: string[] = [];

    for (const slice of slices) {

      const start = cumulative;
      const end = cumulative + slice.pourcentage;

      stops.push(`${slice.cssColor} ${start}% ${end}%`);

      cumulative = end;

    }

    if (cumulative < 100) {
      stops.push(`#eef2f7 ${cumulative}% 100%`);
    }

    return `conic-gradient(${stops.join(', ')})`;

  });


  lastUpdated = computed<string>(() => {

    const value =
      this.dashboard()?.last_updated ??
      this.dashboard()?.global_kpis?.date;

    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);

  });


  ngOnInit(): void {
    this.loadDashboard();
  }


  refresh(): void {
    this.loadDashboard();
  }


  private loadDashboard(): void {

    this.loading.set(true);
    this.error.set(false);

    this.http
      .get<DashboardResponse>(this.apiUrl)
      .subscribe({

        next: response => {

          this.dashboard.set(response);

          this.loading.set(false);

        },

        error: err => {

          console.error(
            '[Dashboard] Impossible de charger /api/advisor/dashboard',
            err
          );

          this.error.set(true);

          this.loading.set(false);

        }

      });

  }


  formatNumber(
    value: number | null | undefined,
    decimals = 0
  ): string {

    const number = Number(value ?? 0);

    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    }).format(number);

  }


  formatPercent(
    value: number | null | undefined
  ): string {

    const number = Number(value ?? 0);

    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(number) + ' %';

  }


  formatMoney(
    value: number | null | undefined
  ): string {

    const number = Number(value ?? 0);

    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number) + ' DT';

  }


  getSegmentClass(segment: string): string {

    const normalized = (segment ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalized.includes('famille')) {
      return 'famille';
    }

    if (normalized.includes('jeune')) {
      return 'jeune';
    }

    if (normalized.includes('professionnel')) {
      return 'professionnel';
    }

    if (normalized.includes('senior')) {
      return 'senior';
    }

    return 'famille';

  }

}
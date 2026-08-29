import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],

  template: `
    <main class="auth-page">

      <!-- =========================================================
           BACKGROUND
      ========================================================== -->

      <div class="page-background">
        <div class="background-orb orb-one"></div>
        <div class="background-orb orb-two"></div>
        <div class="background-grid"></div>
      </div>


      <!-- =========================================================
           MAIN CONTAINER
      ========================================================== -->

      <section class="auth-container">


        <!-- =======================================================
             LEFT / BRAND EXPERIENCE
        ======================================================== -->

        <section class="brand-panel">

          <div class="brand-panel-inner">


            <!-- BRAND -->

            <header class="brand-header">

              <a class="brand" routerLink="/">

                <div class="brand-logo">
                  <span>AI</span>
                </div>

                <div class="brand-info">

                  <strong>
                    Business Advisor
                  </strong>

                  <span>
                    INSURANCE INTELLIGENCE
                  </span>

                </div>

              </a>

              <div class="brand-status">
                <span class="status-indicator"></span>
                Intelligence Platform
              </div>

            </header>


            <!-- HERO -->

            <div class="brand-hero">

              <div class="hero-kicker">

                <span class="kicker-icon">
                  <mat-icon fontSet="material-symbols-outlined">
                    auto_awesome
                  </mat-icon>
                </span>

                AI-POWERED DECISION PLATFORM

              </div>


              <h1>

                L'intelligence artificielle

                <span>
                  au service de votre portefeuille.
                </span>

              </h1>


              <p class="hero-description">

                Une plateforme intelligente conçue pour transformer
                les données de votre portefeuille en décisions métier
                rapides, explicables et exploitables.

              </p>

            </div>


            <!-- FEATURES -->

            <div class="features-grid">


              <article class="feature-card">

                <div class="feature-icon blue">

                  <mat-icon fontSet="material-symbols-outlined">
                    hub
                  </mat-icon>

                </div>

                <div class="feature-content">

                  <strong>
                    Segmentation intelligente
                  </strong>

                  <span>
                    Identification automatique des profils
                    et comportements clients.
                  </span>

                </div>

              </article>


              <article class="feature-card">

                <div class="feature-icon purple">

                  <mat-icon fontSet="material-symbols-outlined">
                    query_stats
                  </mat-icon>

                </div>

                <div class="feature-content">

                  <strong>
                    Scoring de risque
                  </strong>

                  <span>
                    Analyse prédictive et facteurs de risque
                    interprétables.
                  </span>

                </div>

              </article>


              <article class="feature-card">

                <div class="feature-icon green">

                  <mat-icon fontSet="material-symbols-outlined">
                    shield
                  </mat-icon>

                </div>

                <div class="feature-content">

                  <strong>
                    Détection de fraude
                  </strong>

                  <span>
                    Identification des anomalies et signaux
                    comportementaux suspects.
                  </span>

                </div>

              </article>


              <article class="feature-card">

                <div class="feature-icon orange">

                  <mat-icon fontSet="material-symbols-outlined">
                    smart_toy
                  </mat-icon>

                </div>

                <div class="feature-content">

                  <strong>
                    Conseiller IA
                  </strong>

                  <span>
                    Analyse conversationnelle contextualisée
                    pour vos décisions métier.
                  </span>

                </div>

              </article>

            </div>


            <!-- AI DASHBOARD PREVIEW -->

            <div class="ai-preview">

              <div class="preview-topbar">

                <div class="preview-title">

                  <span class="live-dot"></span>

                  Intelligence Engine

                </div>

                <span class="live-badge">
                  LIVE
                </span>

              </div>


              <div class="preview-metrics">


                <div class="metric">

                  <div class="metric-icon blue">

                    <mat-icon fontSet="material-symbols-outlined">
                      trending_up
                    </mat-icon>

                  </div>

                  <div class="metric-content">

                    <span>
                      RISK SCORE
                    </span>

                    <strong>
                      32.7%
                    </strong>

                  </div>

                </div>


                <div class="metric">

                  <div class="metric-icon purple">

                    <mat-icon fontSet="material-symbols-outlined">
                      category
                    </mat-icon>

                  </div>

                  <div class="metric-content">

                    <span>
                      SEGMENT
                    </span>

                    <strong>
                      Premium
                    </strong>

                  </div>

                </div>


                <div class="metric">

                  <div class="metric-icon green">

                    <mat-icon fontSet="material-symbols-outlined">
                      verified
                    </mat-icon>

                  </div>

                  <div class="metric-content">

                    <span>
                      COMPLIANCE
                    </span>

                    <strong>
                      Valid
                    </strong>

                  </div>

                </div>

              </div>


              <div class="preview-footer">

                <span>
                  <i></i>
                  9 agents actifs
                </span>

                <span>
                  Analyse temps réel
                </span>

                <span>
                  Explainable AI
                </span>

              </div>

            </div>


            <!-- LEFT FOOTER -->

            <footer class="brand-footer">

              <span>
                © 2026 Business Advisor
              </span>

              <span class="separator"></span>

              <span>
                Enterprise Intelligence
              </span>

            </footer>

          </div>

        </section>


        <!-- =======================================================
             RIGHT / LOGIN
        ======================================================== -->

        <section class="login-panel">

          <div class="login-wrapper">


            <!-- MOBILE BRAND -->

            <div class="mobile-brand">

              <div class="mobile-logo">
                AI
              </div>

              <div>

                <strong>
                  Business Advisor
                </strong>

                <span>
                  Insurance Intelligence
                </span>

              </div>

            </div>


            <!-- HEADER -->

            <header class="login-header">

              <div class="secure-label">

                <span class="secure-icon">

                  <mat-icon fontSet="material-symbols-outlined">
                    lock
                  </mat-icon>

                </span>

                ESPACE SÉCURISÉ

              </div>


              <h2>
                Bienvenue.
              </h2>


              <p>
                Connectez-vous à votre espace conseiller
                pour accéder à votre portefeuille intelligent.
              </p>

            </header>


            <!-- FORM -->

            <form
              #loginForm="ngForm"
              class="login-form"
              (ngSubmit)="onLogin()"
              novalidate
            >


              <!-- USERNAME -->

              <mat-form-field
                appearance="outline"
                class="professional-field"
              >

                <mat-label>
                  Nom d'utilisateur
                </mat-label>

                <input
                  matInput
                  name="username"
                  [(ngModel)]="username"
                  required
                  autocomplete="username"
                  placeholder="Votre identifiant"
                />

                <mat-icon
                  matSuffix
                  fontSet="material-symbols-outlined"
                >
                  person
                </mat-icon>

              </mat-form-field>


              <!-- PASSWORD -->

              <mat-form-field
                appearance="outline"
                class="professional-field"
              >

                <mat-label>
                  Mot de passe
                </mat-label>

                <input
                  matInput
                  name="password"
                  [(ngModel)]="password"
                  [type]="hide() ? 'password' : 'text'"
                  required
                  autocomplete="current-password"
                  placeholder="Votre mot de passe"
                />


                <button
                  type="button"
                  mat-icon-button
                  matSuffix
                  class="password-button"
                  (click)="togglePassword()"
                  [attr.aria-label]="
                    hide()
                      ? 'Afficher le mot de passe'
                      : 'Masquer le mot de passe'
                  "
                >

                  <mat-icon
                    fontSet="material-symbols-outlined"
                  >
                    {{ hide() ? 'visibility' : 'visibility_off' }}
                  </mat-icon>

                </button>

              </mat-form-field>


              <!-- ERROR -->

              @if (errorMessage()) {

                <div class="error-message">

                  <div class="error-symbol">

                    <mat-icon
                      fontSet="material-symbols-outlined"
                    >
                      error
                    </mat-icon>

                  </div>

                  <div class="error-content">

                    <strong>
                      Connexion impossible
                    </strong>

                    <span>
                      {{ errorMessage() }}
                    </span>

                  </div>

                </div>

              }


              <!-- OPTIONS -->

              <div class="form-options">

                <label class="remember">

                  <input
                    type="checkbox"
                    name="rememberMe"
                    [(ngModel)]="rememberMe"
                  />

                  <span class="custom-checkbox"></span>

                  <span>
                    Se souvenir de moi
                  </span>

                </label>


                <a
                  routerLink="/auth/forgot-password"
                  class="forgot-password"
                >
                  Mot de passe oublié ?
                </a>

              </div>


              <!-- SUBMIT -->

              <button
                mat-flat-button
                type="submit"
                class="submit-button"
                [disabled]="loginForm.invalid || loading()"
              >

                @if (loading()) {

                  <mat-icon
                    fontSet="material-symbols-outlined"
                    class="loading-icon"
                  >
                    progress_activity
                  </mat-icon>

                  <span>
                    Connexion...
                  </span>

                } @else {

                  <span>
                    Se connecter
                  </span>

                  <mat-icon
                    fontSet="material-symbols-outlined"
                  >
                    arrow_forward
                  </mat-icon>

                }

              </button>

            </form>


            <!-- REGISTER -->

            <div class="register-block">

              <span>
                Vous n'avez pas encore de compte ?
              </span>

              <a routerLink="/auth/register">
                Créer un compte
              </a>

            </div>


            <!-- SECURITY -->

            <div class="security-card">

              <div class="security-icon">

                <mat-icon fontSet="material-symbols-outlined">
                  verified_user
                </mat-icon>

              </div>

              <div class="security-content">

                <strong>
                  Connexion sécurisée
                </strong>

                <span>
                  Authentification JWT · Données protégées
                </span>

              </div>

              <mat-icon
                class="security-arrow"
                fontSet="material-symbols-outlined"
              >
                chevron_right
              </mat-icon>

            </div>


            <!-- FOOTER -->

            <footer class="login-footer">

              <span>
                © 2026 Business Advisor
              </span>

              <span>
                •
              </span>

              <span>
                Enterprise Intelligence
              </span>

            </footer>

          </div>

        </section>

      </section>

    </main>
  `,

  styles: [`

    /* =========================================================
       RESET
    ========================================================== */

    :host {
      display: block;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
    }

    * {
      box-sizing: border-box;
    }


    /* =========================================================
       PAGE
    ========================================================== */

    .auth-page {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
      background: #f7f9fc;
      color: #0f172a;
    }


    .page-background {
      position: fixed;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }


    .background-grid {
      position: absolute;
      inset: 0;

      background-image:
        linear-gradient(
          rgba(15, 23, 42, 0.025) 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          rgba(15, 23, 42, 0.025) 1px,
          transparent 1px
        );

      background-size: 40px 40px;
    }


    .background-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: .35;
    }


    .orb-one {
      width: 500px;
      height: 500px;
      top: -250px;
      right: -150px;
      background: rgba(37, 99, 235, .15);
    }


    .orb-two {
      width: 450px;
      height: 450px;
      bottom: -250px;
      left: -150px;
      background: rgba(99, 102, 241, .10);
    }


    /* =========================================================
       MAIN LAYOUT
    ========================================================== */

    .auth-container {
      position: relative;
      z-index: 1;

      min-height: 100vh;

      display: grid;

      grid-template-columns:
        minmax(560px, 1.08fr)
        minmax(460px, .92fr);

      background: #ffffff;

      box-shadow:
        0 30px 80px rgba(15, 23, 42, .08);
    }


    /* =========================================================
       BRAND PANEL
    ========================================================== */

    .brand-panel {
      position: relative;
      overflow: hidden;

      color: #ffffff;

      background:
        radial-gradient(
          circle at 80% 10%,
          rgba(59, 130, 246, .18),
          transparent 30%
        ),
        radial-gradient(
          circle at 0% 100%,
          rgba(99, 102, 241, .12),
          transparent 35%
        ),
        linear-gradient(
          145deg,
          #071a33 0%,
          #0a2445 45%,
          #06152a 100%
        );
    }


    .brand-panel::before {
      content: '';
      position: absolute;
      inset: 0;

      background:
        linear-gradient(
          120deg,
          transparent 0%,
          rgba(255,255,255,.025) 45%,
          transparent 70%
        );

      pointer-events: none;
    }


    .brand-panel-inner {
      position: relative;
      z-index: 2;

      min-height: 100vh;

      display: flex;
      flex-direction: column;

      padding:
        42px
        clamp(42px, 6vw, 90px)
        28px;

      justify-content: space-between;
    }


    /* =========================================================
       BRAND
    ========================================================== */

    .brand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }


    .brand {
      display: flex;
      align-items: center;
      gap: 14px;

      color: #ffffff;
      text-decoration: none;
    }


    .brand-logo,
    .mobile-logo {
      display: flex;
      align-items: center;
      justify-content: center;

      background:
        linear-gradient(
          145deg,
          #f0cf83,
          #bd8b3d
        );

      color: #071a33;

      font-weight: 900;
    }


    .brand-logo {
      width: 48px;
      height: 48px;

      border-radius: 14px;

      box-shadow:
        0 12px 30px rgba(213, 170, 87, .24);
    }


    .brand-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }


    .brand-info strong {
      font-size: 17px;
      line-height: 1;
      letter-spacing: -.03em;
    }


    .brand-info span {
      color: #7f9abb;

      font-size: 9px;
      font-weight: 700;

      letter-spacing: 1.4px;
    }


    .brand-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;

      padding: 8px 12px;

      border:
        1px solid
        rgba(96, 165, 250, .15);

      border-radius: 999px;

      background:
        rgba(37, 99, 235, .07);

      color: #8bbcff;

      font-size: 9px;
      font-weight: 700;

      letter-spacing: .7px;
      text-transform: uppercase;
    }


    .status-indicator {
      width: 6px;
      height: 6px;

      border-radius: 50%;

      background: #60a5fa;

      box-shadow:
        0 0 0 4px rgba(96,165,250,.08),
        0 0 12px rgba(96,165,250,.8);
    }


    /* =========================================================
       HERO
    ========================================================== */

    .brand-hero {
      width: min(680px, 100%);

      margin:
        45px
        0
        30px;
    }


    .hero-kicker {
      display: inline-flex;
      align-items: center;
      gap: 8px;

      padding: 7px 11px;

      border:
        1px solid
        rgba(96,165,250,.18);

      border-radius: 999px;

      background:
        rgba(37,99,235,.08);

      color: #8fc1ff;

      font-size: 9px;
      font-weight: 800;

      letter-spacing: 1px;
    }


    .kicker-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }


    .kicker-icon mat-icon {
      width: 14px;
      height: 14px;

      font-size: 14px;
    }


    .brand-hero h1 {
      max-width: 700px;

      margin:
        22px
        0
        20px;

      color: #ffffff;

      font-family:
        'Manrope',
        'Inter',
        sans-serif;

      font-size:
        clamp(2.6rem, 4vw, 4.25rem);

      font-weight: 800;

      line-height: 1.03;

      letter-spacing: -.065em;
    }


    .brand-hero h1 span {
      display: block;

      background:
        linear-gradient(
          90deg,
          #ffffff 0%,
          #a9c9ff 75%,
          #8db6ff 100%
        );

      -webkit-background-clip: text;
      background-clip: text;

      -webkit-text-fill-color: transparent;
    }


    .hero-description {
      max-width: 610px;

      margin: 0;

      color: #a8bbd4;

      font-size: 15px;

      line-height: 1.75;

      letter-spacing: -.01em;
    }


    /* =========================================================
       FEATURES
    ========================================================== */

    .features-grid {
      display: grid;

      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      gap: 12px 28px;

      width: min(690px, 100%);
    }


    .feature-card {
      display: flex;
      align-items: flex-start;

      gap: 12px;

      padding: 10px 0;

      transition:
        transform .25s ease;
    }


    .feature-card:hover {
      transform: translateX(4px);
    }


    .feature-icon {
      width: 40px;
      height: 40px;

      flex: 0 0 40px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 11px;

      border:
        1px solid
        rgba(255,255,255,.08);
    }


    .feature-icon mat-icon {
      width: 19px;
      height: 19px;

      font-size: 19px;
    }


    .feature-icon.blue {
      color: #60a5fa;
      background: rgba(37,99,235,.12);
    }


    .feature-icon.purple {
      color: #a78bfa;
      background: rgba(124,58,237,.12);
    }


    .feature-icon.green {
      color: #34d399;
      background: rgba(16,185,129,.12);
    }


    .feature-icon.orange {
      color: #fbbf24;
      background: rgba(245,158,11,.12);
    }


    .feature-content {
      display: flex;
      flex-direction: column;

      gap: 4px;
    }


    .feature-content strong {
      color: #f8fafc;

      font-size: 13px;
      font-weight: 750;

      letter-spacing: -.01em;
    }


    .feature-content span {
      color: #7891af;

      font-size: 11px;

      line-height: 1.45;
    }


    /* =========================================================
       AI PREVIEW
    ========================================================== */

    .ai-preview {
      width: min(700px, 100%);

      margin-top: 30px;

      padding: 18px;

      border:
        1px solid
        rgba(255,255,255,.09);

      border-radius: 20px;

      background:
        linear-gradient(
          145deg,
          rgba(255,255,255,.075),
          rgba(255,255,255,.025)
        );

      backdrop-filter: blur(20px);

      box-shadow:
        0 25px 70px rgba(0,0,0,.20);
    }


    .preview-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-bottom: 14px;
    }


    .preview-title {
      display: flex;
      align-items: center;
      gap: 8px;

      color: #b9c9dc;

      font-size: 10px;
      font-weight: 750;

      letter-spacing: .04em;
    }


    .live-dot {
      width: 7px;
      height: 7px;

      border-radius: 50%;

      background: #34d399;

      box-shadow:
        0 0 12px rgba(52,211,153,.9);

      animation: livePulse 2s infinite;
    }


    .live-badge {
      padding: 4px 8px;

      border-radius: 6px;

      background: rgba(52,211,153,.09);

      color: #6ee7b7;

      font-size: 8px;
      font-weight: 800;

      letter-spacing: .8px;
    }


    .preview-metrics {
      display: grid;

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

      gap: 10px;
    }


    .metric {
      display: flex;
      align-items: center;

      gap: 10px;

      padding: 12px;

      border:
        1px solid
        rgba(255,255,255,.055);

      border-radius: 12px;

      background:
        rgba(3,15,31,.42);

      transition:
        transform .2s ease,
        border-color .2s ease;
    }


    .metric:hover {
      transform: translateY(-2px);

      border-color:
        rgba(255,255,255,.13);
    }


    .metric-icon {
      width: 34px;
      height: 34px;

      flex: 0 0 34px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 9px;
    }


    .metric-icon mat-icon {
      width: 17px;
      height: 17px;

      font-size: 17px;
    }


    .metric-icon.blue {
      color: #60a5fa;
      background: rgba(37,99,235,.13);
    }


    .metric-icon.purple {
      color: #a78bfa;
      background: rgba(124,58,237,.13);
    }


    .metric-icon.green {
      color: #34d399;
      background: rgba(16,185,129,.13);
    }


    .metric-content {
      display: flex;
      flex-direction: column;

      gap: 3px;
    }


    .metric-content span {
      color: #7188a5;

      font-size: 8px;
      font-weight: 600;

      letter-spacing: .8px;
    }


    .metric-content strong {
      color: #f8fafc;

      font-size: 13px;
      font-weight: 800;
    }


    .preview-footer {
      display: flex;
      align-items: center;

      gap: 20px;

      margin-top: 14px;
      padding-top: 13px;

      border-top:
        1px solid
        rgba(255,255,255,.06);

      color: #7188a5;

      font-size: 9px;
    }


    .preview-footer span {
      display: flex;
      align-items: center;
      gap: 5px;
    }


    .preview-footer i {
      width: 5px;
      height: 5px;

      border-radius: 50%;

      background: #34d399;
    }


    /* =========================================================
       BRAND FOOTER
    ========================================================== */

    .brand-footer {
      display: flex;
      align-items: center;

      gap: 10px;

      padding-top: 20px;

      border-top:
        1px solid
        rgba(255,255,255,.07);

      color: #68809d;

      font-size: 10px;
    }


    .separator {
      width: 3px;
      height: 3px;

      border-radius: 50%;

      background: #526b89;
    }


    /* =========================================================
       LOGIN PANEL
    ========================================================== */

    .login-panel {
      display: flex;
      align-items: center;
      justify-content: center;

      min-height: 100vh;

      padding:
        50px
        clamp(42px, 7vw, 100px);

      background:
        linear-gradient(
          180deg,
          #ffffff 0%,
          #fbfcfe 100%
        );
    }


    .login-wrapper {
      width: 100%;
      max-width: 430px;
    }


    /* =========================================================
       HEADER
    ========================================================== */

    .login-header {
      margin-bottom: 32px;
    }


    .secure-label {
      display: inline-flex;
      align-items: center;
      gap: 7px;

      margin-bottom: 18px;

      color: #2563eb;

      font-size: 10px;
      font-weight: 800;

      letter-spacing: .8px;
      text-transform: uppercase;
    }


    .secure-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }


    .secure-icon mat-icon {
      width: 16px;
      height: 16px;

      font-size: 16px;
    }


    .login-header h2 {
      margin: 0;

      color: #0b1220;

      font-family:
        'Manrope',
        'Inter',
        sans-serif;

      font-size: clamp(2.2rem, 3vw, 3rem);

      font-weight: 800;

      line-height: 1.05;

      letter-spacing: -.055em;
    }


    .login-header p {
      max-width: 410px;

      margin:
        13px
        0
        0;

      color: #64748b;

      font-size: 14px;

      line-height: 1.7;
    }


    /* =========================================================
       FORM
    ========================================================== */

    .login-form {
      display: flex;
      flex-direction: column;

      gap: 15px;
    }


    .professional-field {
      width: 100%;
    }


    ::ng-deep
    .professional-field
    .mat-mdc-text-field-wrapper {
      min-height: 58px;

      border-radius: 12px !important;

      background: #ffffff;
    }


    ::ng-deep
    .professional-field
    .mdc-notched-outline {
      border-radius: 12px !important;
    }


    ::ng-deep
    .professional-field
    .mdc-notched-outline__leading,
    ::ng-deep
    .professional-field
    .mdc-notched-outline__notch,
    ::ng-deep
    .professional-field
    .mdc-notched-outline__trailing {
      border-color: #d7dee8 !important;
    }


    ::ng-deep
    .professional-field.mat-focused
    .mdc-notched-outline__leading,
    ::ng-deep
    .professional-field.mat-focused
    .mdc-notched-outline__notch,
    ::ng-deep
    .professional-field.mat-focused
    .mdc-notched-outline__trailing {
      border-color: #2563eb !important;
      border-width: 2px !important;
    }


    ::ng-deep
    .professional-field
    .mat-mdc-form-field-flex {
      min-height: 58px;
    }


    ::ng-deep
    .professional-field
    input {
      color: #0f172a !important;

      font-size: 14px !important;
      font-weight: 500;
    }


    ::ng-deep
    .professional-field
    .mat-mdc-form-field-icon-suffix {
      color: #94a3b8;
    }


    .password-button {
      color: #94a3b8 !important;
    }


    .password-button:hover {
      color: #2563eb !important;
    }


    /* =========================================================
       ERROR
    ========================================================== */

    .error-message {
      display: flex;
      align-items: flex-start;

      gap: 11px;

      padding: 13px 14px;

      border:
        1px solid
        #fecaca;

      border-radius: 12px;

      background: #fff7f7;

      animation: errorIn .25s ease;
    }


    .error-symbol {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 30px;
      height: 30px;

      flex: 0 0 30px;

      border-radius: 8px;

      color: #dc2626;
      background: #fee2e2;
    }


    .error-symbol mat-icon {
      width: 16px;
      height: 16px;

      font-size: 16px;
    }


    .error-content {
      display: flex;
      flex-direction: column;

      gap: 3px;
    }


    .error-content strong {
      color: #991b1b;

      font-size: 12px;
      font-weight: 750;
    }


    .error-content span {
      color: #b45353;

      font-size: 11px;

      line-height: 1.5;
    }


    /* =========================================================
       OPTIONS
    ========================================================== */

    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-top: 1px;
    }


    .remember {
      position: relative;

      display: inline-flex;
      align-items: center;

      gap: 9px;

      cursor: pointer;

      color: #64748b;

      font-size: 12px;
    }


    .remember input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }


    .custom-checkbox {
      width: 17px;
      height: 17px;

      border:
        1px solid
        #cbd5e1;

      border-radius: 5px;

      background: #ffffff;

      transition:
        .2s ease;
    }


    .remember input:checked + .custom-checkbox {
      border-color: #2563eb;

      background:
        linear-gradient(
          135deg,
          #2563eb,
          #4338ca
        );

      box-shadow:
        0 4px 10px
        rgba(37,99,235,.20);
    }


    .remember input:checked + .custom-checkbox::after {
      content: '✓';

      display: block;

      color: #ffffff;

      font-size: 11px;
      font-weight: 800;

      line-height: 15px;

      text-align: center;
    }


    .forgot-password {
      color: #2563eb;

      font-size: 12px;
      font-weight: 700;

      text-decoration: none;
    }


    .forgot-password:hover {
      text-decoration: underline;
    }


    /* =========================================================
       SUBMIT
    ========================================================== */

    .submit-button {
      width: 100%;

      min-height: 56px;

      margin-top: 8px;

      display: flex !important;
      align-items: center;
      justify-content: center;

      gap: 9px;

      border-radius: 12px !important;

      background:
        linear-gradient(
          135deg,
          #2563eb 0%,
          #4338ca 100%
        ) !important;

      color: #ffffff !important;

      font-size: 14px !important;
      font-weight: 750 !important;

      box-shadow:
        0 15px 35px
        rgba(37,99,235,.20);

      transition:
        transform .2s ease,
        box-shadow .2s ease;
    }


    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);

      box-shadow:
        0 20px 42px
        rgba(37,99,235,.28);
    }


    .submit-button:active:not(:disabled) {
      transform: translateY(0);
    }


    .submit-button:disabled {
      opacity: .55;
    }


    .submit-button mat-icon {
      width: 18px;
      height: 18px;

      font-size: 18px;
    }


    .loading-icon {
      animation:
        spin 1s linear infinite;
    }


    /* =========================================================
       REGISTER
    ========================================================== */

    .register-block {
      display: flex;
      align-items: center;
      justify-content: center;

      gap: 5px;

      margin-top: 24px;

      color: #64748b;

      font-size: 12px;
    }


    .register-block a {
      color: #2563eb;

      font-weight: 750;

      text-decoration: none;
    }


    .register-block a:hover {
      text-decoration: underline;
    }


    /* =========================================================
       SECURITY CARD
    ========================================================== */

    .security-card {
      display: flex;
      align-items: center;

      gap: 12px;

      margin-top: 26px;

      padding: 15px 16px;

      border:
        1px solid
        #e2e8f0;

      border-radius: 13px;

      background:
        linear-gradient(
          145deg,
          #ffffff,
          #f8fafc
        );

      transition:
        border-color .2s ease,
        box-shadow .2s ease;
    }


    .security-card:hover {
      border-color: #cbd5e1;

      box-shadow:
        0 8px 25px
        rgba(15,23,42,.05);
    }


    .security-icon {
      width: 34px;
      height: 34px;

      flex: 0 0 34px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 9px;

      color: #059669;

      background: #ecfdf5;
    }


    .security-icon mat-icon {
      width: 17px;
      height: 17px;

      font-size: 17px;
    }


    .security-content {
      display: flex;
      flex-direction: column;

      gap: 3px;

      min-width: 0;
    }


    .security-content strong {
      color: #334155;

      font-size: 12px;
      font-weight: 750;
    }


    .security-content span {
      color: #94a3b8;

      font-size: 10px;
    }


    .security-arrow {
      margin-left: auto;

      color: #cbd5e1;
    }


    /* =========================================================
       FOOTER
    ========================================================== */

    .login-footer {
      display: flex;
      align-items: center;
      justify-content: center;

      gap: 7px;

      margin-top: 27px;

      color: #a1aab8;

      font-size: 10px;
    }


    /* =========================================================
       MOBILE BRAND
    ========================================================== */

    .mobile-brand {
      display: none;
    }


    /* =========================================================
       ANIMATIONS
    ========================================================== */

    .brand-header,
    .brand-hero,
    .features-grid,
    .ai-preview,
    .brand-footer,
    .login-header,
    .login-form,
    .register-block,
    .security-card,
    .login-footer {
      animation:
        fadeUp .65s cubic-bezier(.16,1,.3,1) both;
    }


    .brand-header {
      animation-delay: .04s;
    }


    .brand-hero {
      animation-delay: .10s;
    }


    .features-grid {
      animation-delay: .17s;
    }


    .ai-preview {
      animation-delay: .24s;
    }


    .brand-footer {
      animation-delay: .30s;
    }


    .login-header {
      animation-delay: .08s;
    }


    .login-form {
      animation-delay: .14s;
    }


    .register-block {
      animation-delay: .20s;
    }


    .security-card {
      animation-delay: .26s;
    }


    .login-footer {
      animation-delay: .32s;
    }


    @keyframes fadeUp {

      from {
        opacity: 0;
        transform: translateY(14px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }

    }


    @keyframes spin {

      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }

    }


    @keyframes livePulse {

      0%,
      100% {
        box-shadow:
          0 0 10px
          rgba(52,211,153,.7);
      }

      50% {
        box-shadow:
          0 0 18px
          rgba(52,211,153,1);
      }

    }


    @keyframes errorIn {

      from {
        opacity: 0;
        transform: translateY(-5px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }

    }


    /* =========================================================
       TABLET
    ========================================================== */

    @media (max-width: 1180px) {

      .auth-container {
        grid-template-columns:
          minmax(500px, 1fr)
          minmax(420px, .85fr);
      }


      .brand-panel-inner {
        padding-left: 48px;
        padding-right: 48px;
      }


      .brand-hero h1 {
        font-size: 3.1rem;
      }


      .brand-status {
        display: none;
      }

    }


    /* =========================================================
       MOBILE
    ========================================================== */

    @media (max-width: 900px) {

      .auth-container {
        display: block;

        min-height: 100vh;
      }


      .brand-panel {
        display: none;
      }


      .login-panel {
        min-height: 100vh;

        padding:
          35px
          24px;
      }


      .login-wrapper {
        max-width: 450px;
      }


      .mobile-brand {
        display: flex;
        align-items: center;

        gap: 11px;

        margin-bottom: 48px;
      }


      .mobile-logo {
        width: 42px;
        height: 42px;

        border-radius: 11px;

        font-size: 13px;
      }


      .mobile-brand div:last-child {
        display: flex;
        flex-direction: column;

        gap: 2px;
      }


      .mobile-brand strong {
        color: #0f172a;

        font-size: 15px;
        font-weight: 800;
      }


      .mobile-brand span {
        color: #94a3b8;

        font-size: 8px;
        font-weight: 700;

        letter-spacing: .9px;

        text-transform: uppercase;
      }

    }


    /* =========================================================
       SMALL MOBILE
    ========================================================== */

    @media (max-width: 480px) {

      .login-panel {
        padding:
          24px
          18px;
      }


      .mobile-brand {
        margin-bottom: 38px;
      }


      .login-header h2 {
        font-size: 2rem;
      }


      .login-header p {
        font-size: 13px;
      }


      .form-options {
        align-items: flex-start;

        flex-direction: column;

        gap: 12px;
      }


      .register-block {
        flex-direction: column;

        line-height: 1.5;

        text-align: center;
      }


      .login-footer {
        flex-wrap: wrap;

        text-align: center;
      }

    }


    /* =========================================================
       REDUCED MOTION
    ========================================================== */

    @media (prefers-reduced-motion: reduce) {

      *,
      *::before,
      *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
      }

    }

  `]
})
export class LoginComponent {

  username = '';

  password = '';

  rememberMe = false;

  hide = signal(true);

  loading = signal(false);

  errorMessage = signal<string | null>(null);


  constructor(
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}


  togglePassword(): void {
    this.hide.update(value => !value);
  }


  onLogin(): void {

    if (!this.username.trim() || !this.password) {

      this.errorMessage.set(
        'Veuillez renseigner votre nom d’utilisateur et votre mot de passe.'
      );

      return;
    }


    this.loading.set(true);

    this.errorMessage.set(null);


    this.authService.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({

      next: () => {

        this.loading.set(false);

        this.notification.success(
          'Connexion réussie.'
        );

        this.router.navigate([
          '/dashboard'
        ]);

      },


      error: (err) => {

        console.error(
          'Erreur de connexion :',
          err
        );

        this.loading.set(false);

        this.errorMessage.set(
          'Identifiants incorrects. Vérifiez vos informations puis réessayez.'
        );

      }

    });

  }

}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatSidenavModule,
    MatIconModule, MatListModule, MatProgressBarModule,
    MatBadgeModule, MatMenuModule
  ],
  template: `
    <mat-progress-bar *ngIf="loadingService.isLoading()" mode="indeterminate" class="global-loader"></mat-progress-bar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport [mode]="'side'" [opened]="true">
        <div class="brand">
          <div class="brand-mark-container">
            <span class="brand-mark">AI</span>
          </div>
          <div class="brand-text">
            <span class="brand-name">Business Advisor</span>
            <span class="brand-sub">Auto Insurance System</span>
          </div>
        </div>

        <div class="nav-section-label">Main Menu</div>
        <mat-nav-list class="nav-list">
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link" #dashboard="routerLinkActive">
            <mat-icon matListItemIcon fontSet="material-symbols-outlined">dashboard</mat-icon>
            <span matListItemTitle>Tableau de bord</span>
          </a>
          <a mat-list-item routerLink="/customers" routerLinkActive="active-link" #customers="routerLinkActive">
            <mat-icon matListItemIcon fontSet="material-symbols-outlined">group</mat-icon>
            <span matListItemTitle>Clients Portefeuille</span>
          </a>
        </mat-nav-list>

        <div class="nav-section-label">Analysis & Reports</div>
        <mat-nav-list class="nav-list">
          <a mat-list-item routerLink="/analysis" routerLinkActive="active-link" disabled>
            <mat-icon matListItemIcon fontSet="material-symbols-outlined">monitoring</mat-icon>
            <span matListItemTitle>Performance IA</span>
          </a>
          <a mat-list-item routerLink="/settings" routerLinkActive="active-link" disabled>
            <mat-icon matListItemIcon fontSet="material-symbols-outlined">settings</mat-icon>
            <span matListItemTitle>Paramètres</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-spacer"></div>

        <div class="sidenav-footer">
          <div class="user-preview">
            <div class="user-avatar">AD</div>
            <div class="user-info">
              <span class="user-name">Administrateur</span>
              <span class="user-role">Premium Access</span>
            </div>
          </div>
          <div class="status-indicator">
            <span class="dot"></span>
            <span class="status-text">Systeme IA Actif</span>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="topbar">
          <button type="button" mat-icon-button (click)="drawer.toggle()" class="menu-toggle">
            <mat-icon fontSet="material-symbols-outlined">menu_open</mat-icon>
          </button>

          <div class="search-bar">
            <mat-icon fontSet="material-symbols-outlined">search</mat-icon>
            <input type="text" placeholder="Rechercher un client, un agent ou un rapport...">
          </div>

          <span class="spacer"></span>

          <div class="topbar-actions">
            <button mat-icon-button class="action-btn" title="Aide">
              <mat-icon fontSet="material-symbols-outlined">help_outline</mat-icon>
            </button>
            <button mat-icon-button class="action-btn" title="Notifications">
              <mat-icon fontSet="material-symbols-outlined" matBadge="3" matBadgeColor="warn">notifications</mat-icon>
            </button>
            <div class="divider"></div>
            <button mat-button class="profile-button" [matMenuTriggerFor]="profileMenu">
              <div class="profile-avatar">AD</div>
              <mat-icon fontSet="material-symbols-outlined">expand_more</mat-icon>
            </button>
            <mat-menu #profileMenu="matMenu" xPosition="before" class="premium-menu">
              <div class="menu-header">
                <span class="user-email">admin@advisor.ai</span>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item>
                <mat-icon fontSet="material-symbols-outlined">person</mat-icon>
                <span>Mon Profil</span>
              </button>
              <button mat-menu-item>
                <mat-icon fontSet="material-symbols-outlined">settings</mat-icon>
                <span>Paramètres</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item class="logout-item">
                <mat-icon fontSet="material-symbols-outlined">logout</mat-icon>
                <span>Déconnexion</span>
              </button>
            </mat-menu>
          </div>
        </mat-toolbar>

        <div class="main-content-wrapper">
          <div class="content">
            <router-outlet></router-outlet>
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .global-loader { position: fixed; top: 0; left: 0; right: 0; z-index: 2000; height: 4px; }
    .sidenav-container { height: 100vh; background: var(--background); }

    .sidenav {
      width: 280px;
      background: var(--ink);
      color: #fff;
      border-right: none;
      display: flex;
      flex-direction: column;
      box-shadow: 4px 0 24px rgba(0,0,0,0.1);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 40px 24px;
    }
    .brand-mark-container {
      width: 40px;
      height: 40px;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(184, 134, 58, 0.3);
    }
    .brand-mark {
      font-family: var(--font-mono);
      color: var(--ink);
      font-weight: 800;
      font-size: 1.1rem;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .brand-sub {
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .nav-section-label {
      padding: 24px 24px 8px;
      font-size: 0.65rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .nav-list {
      padding: 0 12px;
    }

    ::ng-deep .sidenav .mat-mdc-list-item {
      color: #94a3b8 !important;
      margin-bottom: 4px;
      border-radius: 12px !important;
      height: 48px !important;
      transition: all 0.2s ease !important;
    }
    ::ng-deep .sidenav .mat-mdc-list-item:hover {
      background: rgba(255,255,255,0.03) !important;
      color: #f8fafc !important;
    }
    ::ng-deep .sidenav .mat-mdc-list-item .mat-icon {
      color: #475569 !important;
      margin-right: 16px !important;
      font-size: 22px;
    }
    ::ng-deep .sidenav .active-link {
      background: linear-gradient(90deg, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.02) 100%) !important;
      color: #fff !important;
      border-left: 3px solid var(--primary);
    }
    ::ng-deep .sidenav .active-link .mat-icon {
      color: var(--primary) !important;
    }

    .sidenav-spacer { flex: 1; }

    .sidenav-footer {
      padding: 24px;
      background: rgba(0,0,0,0.2);
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .user-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .user-avatar {
      width: 36px; height: 36px;
      background: #334155;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.8rem;
    }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 0.85rem; font-weight: 600; color: #f1f5f9; }
    .user-role { font-size: 0.7rem; color: #64748b; }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(34, 197, 94, 0.05);
      padding: 8px 12px;
      border-radius: 8px;
    }
    .dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 10px var(--success);
    }
    .status-text {
      font-size: 0.7rem;
      color: #86efac;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .topbar {
      background: rgba(255, 255, 255, 0.8) !important;
      backdrop-filter: blur(8px);
      color: var(--ink);
      border-bottom: 1px solid var(--border);
      height: 80px !important;
      padding: 0 32px !important;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .menu-toggle { margin-right: 16px; color: #64748b; }

    .search-bar {
      display: flex;
      align-items: center;
      background: #f1f5f9;
      border-radius: 12px;
      padding: 0 16px;
      width: 400px;
      height: 44px;
      gap: 12px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }
    .search-bar:focus-within {
      background: #fff;
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
    }
    .search-bar mat-icon { color: #94a3b8; font-size: 20px; }
    .search-bar input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.9rem;
      width: 100%;
      color: var(--ink);
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .action-btn { color: #64748b; }
    .divider { width: 1px; height: 24px; background: var(--border); margin: 0 12px; }

    .profile-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 8px !important;
      border-radius: 12px !important;
    }
    .profile-avatar {
      width: 32px; height: 32px;
      background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.75rem;
    }

    .menu-header {
      padding: 16px;
      display: flex;
      flex-direction: column;
    }
    .user-email {
      font-size: 0.8rem;
      color: var(--ink-soft);
    }
    .logout-item { color: var(--danger) !important; }

    .main-content-wrapper {
      background: var(--background);
      min-height: calc(100vh - 80px);
    }

    .content {
      padding: 40px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .spacer { flex: 1 1 auto; }
  `]
})
export class MainLayoutComponent {
  constructor(public loadingService: LoadingService) {}
}

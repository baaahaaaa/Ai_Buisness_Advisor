import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatSidenavModule,
    MatIconModule, MatListModule, MatProgressBarModule
  ],
  template: `
    <mat-progress-bar *ngIf="loadingService.isLoading()" mode="indeterminate" class="global-loader"></mat-progress-bar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport [mode]="'side'" [opened]="true">
        <div class="brand">
          <span class="brand-mark">AI</span>
          <span class="brand-name">Business<br>Advisor</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Tableau de bord</span>
          </a>
          <a mat-list-item routerLink="/customers" routerLinkActive="active-link">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Clients</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <span class="dot"></span> Systeme actif
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="topbar">
          <button type="button" mat-icon-button (click)="drawer.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="topbar-title">Assurance Automobile</span>
          <span class="spacer"></span>
          <button mat-icon-button title="Profil"><mat-icon>account_circle</mat-icon></button>
        </mat-toolbar>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .global-loader { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
    .sidenav-container { height: 100%; }

    .sidenav {
      width: 220px;
      background: #101A2B;
      color: #E8EBF0;
      border-right: none;
      display: flex;
      flex-direction: column;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 18px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand-mark {
      font-family: 'IBM Plex Mono', monospace;
      background: #B8863B;
      color: #101A2B;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .brand-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.2;
    }

    ::ng-deep .sidenav .mat-mdc-list-item {
      color: #C3CAD6;
      margin: 2px 10px;
      border-radius: 8px;
    }
    ::ng-deep .sidenav .mat-mdc-list-item .mat-icon {
      color: #7C8AA0;
    }
    ::ng-deep .sidenav .active-link {
      background: rgba(184,134,58,0.15) !important;
      color: #fff !important;
    }
    ::ng-deep .sidenav .active-link .mat-icon {
      color: #B8863B !important;
    }

    .sidenav-footer {
      margin-top: auto;
      padding: 16px 18px;
      font-size: 0.75rem;
      color: #7C8AA0;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #3F7D5C;
      display: inline-block;
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 1;
      background: #fff;
      color: #101A2B;
      border-bottom: 1px solid #DDE2E8;
    }
    .topbar-title {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
      font-size: 1rem;
      margin-left: 6px;
    }
    .spacer { flex: 1 1 auto; }
    .content { padding: 24px 28px; background: #F1F3F6; min-height: calc(100vh - 64px); }
  `]
})
export class MainLayoutComponent {
  constructor(public loadingService: LoadingService) {}
}
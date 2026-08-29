import { Component, HostListener, inject, signal } from '@angular/core';

import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { LoadingService } from '../../services/loading.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,

    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressBarModule
  ],

  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {

  readonly loadingService = inject(LoadingService);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  private readonly router = inject(Router);

  readonly mobile = signal(false);
  readonly search = signal('');

  readonly primaryNavigation: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard', exact: true },
    { label: 'Portefeuille clients', icon: 'groups', route: '/customers' },
    { label: 'Rapports', icon: 'description', route: '/reports' }
  ];

  readonly intelligenceNavigation: NavItem[] = [
    { label: 'Centre d\u2019analyse IA', icon: 'auto_awesome', route: '/customers', badge: 'IA' },
    { label: 'Performance IA', icon: 'monitoring', route: '/reports' }
  ];

  readonly administrationNavigation: NavItem[] = [
    { label: 'Profil', icon: 'person', route: '/profile' },
    { label: 'Paramètres', icon: 'settings', route: '/settings' }
  ];

  constructor() {
    this.checkViewport();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkViewport();
  }

  private checkViewport(): void {
    this.mobile.set(window.innerWidth < 960);
  }

  onSearch(): void {
    const value = this.search().trim();
    if (!value) {
      return;
    }

    this.router.navigate(['/customers'], { queryParams: { q: value } });
    this.search.set('');
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authService.logout();
  }

  getDisplayName(): string {
    return this.authService.getCurrentUsername();
  }

  getInitials(): string {
    const name = this.getDisplayName().trim();

    if (!name) {
      return 'BA';
    }

    const parts = name.split(/\s+/);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  }

  closeDrawer(drawer: any): void {
    if (this.mobile()) {
      drawer.close();
    }
  }
}
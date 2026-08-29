import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'aba_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  readonly theme = signal<ThemeMode>(
    this.getInitialTheme()
  );

  constructor() {
    this.applyTheme(this.theme());
  }

  toggle(): void {
    const next: ThemeMode =
      this.theme() === 'light'
        ? 'dark'
        : 'light';

    this.setTheme(next);
  }

  setTheme(theme: ThemeMode): void {
    this.theme.set(theme);

    localStorage.setItem(
      THEME_KEY,
      theme
    );

    this.applyTheme(theme);
  }

  private getInitialTheme(): ThemeMode {

    const saved =
      localStorage.getItem(THEME_KEY);

    if (
      saved === 'light' ||
      saved === 'dark'
    ) {
      return saved;
    }

    return window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
      ? 'dark'
      : 'light';
  }

  private applyTheme(theme: ThemeMode): void {

    document.documentElement.dataset['theme'] =
      theme;
  }
}
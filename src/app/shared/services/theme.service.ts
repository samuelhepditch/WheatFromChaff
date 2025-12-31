import { Injectable, inject, signal, effect } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const DATA_KEY = 'analog-blog-theme';
export const THEMES = ['light', 'dark'];
export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  selectedTheme = signal<Theme>('light');
  private mediaQueryList?: MediaQueryList;

  constructor() {
    if (this.isBrowser) {
      this.mediaQueryList = this.document.defaultView!.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryList.addEventListener('change', this.handleSystemThemeChange);
    }

    this.initializeTheme();

    effect(() => {
      if (this.isBrowser) {
        const theme = this.selectedTheme();
        this.document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(DATA_KEY, theme);
        this.updateFavicon(theme);
      }
    });
  }

  private initializeTheme(): void {
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem(DATA_KEY) as Theme;
      const systemPrefersDark = this.mediaQueryList?.matches || false;

      const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      this.selectedTheme.set(theme);
    }
  }

  private handleSystemThemeChange = (): void => {
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem(DATA_KEY);
      if (!savedTheme) {
        const systemTheme = this.mediaQueryList?.matches ? 'dark' : 'light';
        this.selectedTheme.set(systemTheme);
      }
    }
  };

  setTheme(theme: Theme): void {
    this.selectedTheme.set(theme);
  }

  toggleTheme(): void {
    const newTheme = this.selectedTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private updateFavicon(theme: Theme): void {
    if (this.isBrowser) {
      const link = this.document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = theme === 'dark'
          ? '/wheat-from-chaff-logo-dark-mode.png'
          : '/wheat-from-chaff-logo-light-mode.png';
      }
    }
  }
}

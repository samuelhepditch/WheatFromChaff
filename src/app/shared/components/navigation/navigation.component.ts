import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { THEMES, ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styles: [],
})
export class NavigationComponent {
  links = [
    {path: '/computer-science', label: 'Computer Science'},
    {path: '/entrepreneurship', label: 'Entrepreneurship'},
    {path: '/art-of-living', label: 'Art of Living'},
    {path: '/finance', label: 'Finance'}
  ];

  themeService = inject(ThemeService);
  selectedTheme = this.themeService.selectedTheme;
  themes = THEMES;

  onThemeChange(event: any) {
    this.themeService.selectedTheme.set(event?.target.value);
  }
}

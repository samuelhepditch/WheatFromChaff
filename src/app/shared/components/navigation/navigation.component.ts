import { Component, inject, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  @ViewChild('dropdownButton') dropdownButton!: ElementRef;

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

  closeMenu() {
    // Close the dropdown menu by removing focus
    if (this.dropdownButton) {
      this.dropdownButton.nativeElement.blur();
    }
    if (this.dropdownMenu) {
      this.dropdownMenu.nativeElement.blur();
    }
  }
}

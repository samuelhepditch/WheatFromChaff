import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../shared/services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="hero">
      <div class="hero-content text-center">
        <div class="max-w-2xl flex flex-col items-center">
          <figure class="cursor-pointer" (click)="goHome()">
            <img [src]="logoSrc()" alt="Wheat from Chaff logo" />
          </figure>
          <div class="pb-4"></div>
          <div class="py-2 text-left space-y-4">
            <p>
              Wheat From Chaff is a place on the web where I work through complex ideas in an effort to better understand the world.
              The writing here is not about arriving at final answers, but about thinking clearly—starting from first principles and
              reasoning upward toward logical conclusions.
            </p>
            <p>
              This approach is inspired by the idea that memorization is not understanding. Learning vocabulary to explain other vocabulary
              creates the illusion of knowledge without real insight. What matters is the ability to explain ideas simply, trace them back
              to their foundations, and rebuild them in a way that actually makes sense.
            </p>
            <p>
              Much of this philosophy comes from Richard Feynman, who argued that if you can't explain something plainly, you don't truly
              understand it. His thinking strongly shapes how I learn and how I write, and it aligns closely with the purpose of this blog.
            </p>
            <p>
              I write about my interests—computer science, entrepreneurship, finance, and the art of living—with the goal of separating
              meaningful insight from noise, jargon, and distraction.
            </p>
          </div>
          <div class="pb-16"></div>
          <button class="btn items-center bg-base-300 mt-30" routerLink="/blog">
            <a>Go to Blog Posts</a>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
      }
    `,
  ],
  imports: [RouterLink],
})
export default class HomeComponent {
  private themeService = inject(ThemeService);

  logoSrc = computed(() => {
    const theme = this.themeService.selectedTheme();
    return theme === 'dark'
      ? '/wheat-from-chaff-logo-dark-mode.png'
      : '/wheat-from-chaff-logo-light-mode.png';
  });

  goHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

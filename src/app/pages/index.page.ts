import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../shared/services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="hero min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
      <div class="hero-content text-center w-full">
        <div class="max-w-none sm:max-w-2xl lg:max-w-4xl flex flex-col items-center">
          <figure class="cursor-pointer mb-4 sm:mb-6" (click)="goHome()">
            <img
              [src]="logoSrc()"
              alt="Wheat from Chaff logo"
              class="w-full max-w-xs sm:max-w-sm lg:max-w-md"
            />
          </figure>

          <div class="text-left space-y-4 sm:space-y-6 text-sm sm:text-base lg:text-lg leading-relaxed">
            <p>
              Wheat From Chaff is a place on the web where I work through complex ideas in an effort to better understand the world.
              My goal with every post is to start from first principles and reason upward toward higher level concepts.
            </p>
            <p>
              My hope is that after reading a post, readers can explain the subject matter clearly without relying on memorization.
              As the famous Physicist Richard Feynman explains in this <a href="https://www.youtube.com/watch?v=ga_7j72CVlc" target="_blank"
              rel="noopener noreferrer" class="font-bold underline hover:text-primary transition-colors">video</a>,
              learning vocabulary to explain other vocabulary creates the illusion of knowledge without real insight.
              What matters is the ability to explain ideas simply by tracing them back to their foundations, and then we can rebuild
              them in a way what actually makes sense.
            </p>
            <p>
              If you want to learn about computer science, entrepreneurship, finance, and the art of living you are in the right place.
            </p>
          </div>

          <div class="py-6 sm:py-8"></div>

          <blockquote class="italic text-lg sm:text-xl lg:text-2xl text-center max-w-3xl leading-relaxed">
            "Explaining something you truly understand should feel like singing the chorus of your favourite song—there is no effort;
            the words roll off your tongue."
          </blockquote>

          <div class="pb-8 sm:pb-12 lg:pb-16"></div>
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

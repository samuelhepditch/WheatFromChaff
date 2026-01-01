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
              My goal with every post is to start from first principles and reason upward toward higher level concepts.
            </p>
            <p>
              My hope is that after reading a post, readers can explain the subject matter clearly without relying on memorization.
              As the famous Physicist Richard Feynman explains in this <a href="https://www.youtube.com/watch?v=ga_7j72CVlc" target="_blank"
              rel="noopener noreferrer" style="font-weight: bold; text-decoration: underline;">video</a>,
              learning vocabulary to explain other vocabulary creates the illusion of knowledge without real insight. 
              What matters is the ability to explain ideas simply by tracing them back to their foundations, and then we can rebuild 
              them in a way what actually makes sense.
            </p>
            <p>
              If you want to learn about computer science, entrepreneurship, finance, and the art of living you are in the right place.
            </p>
          </div>
          <div class="pb-8"></div>
          <blockquote class="italic text-2xl">
            “Explaining something you truly understand should feel like singing the chorus of your favourite song—there is no effort;
            the words roll off your tongue.”
          </blockquote>
          <div class="pb-16"></div>
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

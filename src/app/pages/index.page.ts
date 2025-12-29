import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="hero">
      <div class="hero-content text-center">
        <div class="max-w-md flex flex-col items-center">
          <h1 class="md:text-4xl text-2xl font-bold">
            Welcome to Wheat From Chaff
          </h1>
          <figure>
            <img src="/analog.svg" alt="AnalogJs logo" />
            <figcaption>AnalogJs: The Meta Framework</figcaption>
          </figure>
          <p class="py-6">
Wheat From Chaff is where I distill long-form conversations and complex ideas into their most valuable parts.

I write about computer science, entrepreneurship, and modern thinking—often through podcast summaries and reflections. The name reflects the purpose of the site: separating meaningful insight from distraction, hype, and filler.

Only ideas that are interesting, challenging, or worth revisiting make it here.
          </p>
          <button class="btn items-center bg-base-300" routerLink="/blog">
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
export default class HomeComponent {}

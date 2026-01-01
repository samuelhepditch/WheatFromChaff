// /src/app/pages/blog/posts.[slug].page.ts
import { injectContent, MarkdownComponent } from '@analogjs/content';
import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface PostAttributes {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  category?: string;
}

@Component({
  standalone: true,
  imports: [MarkdownComponent, AsyncPipe, NgIf, RouterLink],
  template: `
    <ng-container *ngIf="post$ | async as post">
      <article
        class="flex flex-col prose prose-slate dark:prose-invert max-w-none sm:max-w-2xl lg:max-w-4xl py-8 sm:py-12 lg:py-16 w-full px-4 sm:px-6 lg:px-8"
      >
        <a [routerLink]="backLink" class="btn items-center mb-6 sm:mb-8 w-full sm:w-64 flex flex-row text-sm sm:text-base"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 sm:w-8 sm:h-8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
          <span>{{ backLinkText }}</span></a
        >
        <analog-markdown
          class="markdown"
          [content]="post.content"
        ></analog-markdown>
        <a [routerLink]="backLink" class="btn items-center mb-6 sm:mb-8 w-full sm:w-64 flex flex-row text-sm sm:text-base"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 sm:w-8 sm:h-8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
          <span>{{ backLinkText }}</span></a
        >
      </article>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
      }
    `,
  ],
})
export default class BlogPostComponent {
  readonly post$ = injectContent<PostAttributes>({
    param: 'slug',
    subdirectory: 'blog',
  });

  backLink = '';
  backLinkText = '';

  constructor() {
    this.post$.subscribe(post => {
      const category = post?.attributes?.category;

      switch (category) {
        case 'computer-science':
          this.backLink = '/computer-science';
          this.backLinkText = 'Back to Computer Science';
          break;
        case 'entrepreneurship':
          this.backLink = '/entrepreneurship';
          this.backLinkText = 'Back to Entrepreneurship';
          break;
        case 'art-of-living':
          this.backLink = '/art-of-living';
          this.backLinkText = 'Back to Art of Living';
          break;
        case 'finance':
          this.backLink = '/finance';
          this.backLinkText = 'Back to Finance';
          break;
        default:
          this.backLink = '/computer-science';
          this.backLinkText = 'Back to Computer Science';
      }
    });
  }
}

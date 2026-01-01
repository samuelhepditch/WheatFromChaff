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
        class="flex flex-col prose prose-slate  dark:prose-invert md:max-w-4xl py-16 w-full px-4"
      >
        <a [routerLink]="backLink" class="btn items-center mb-8 w-64 flex flex-row"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-8 h-8"
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
        <a [routerLink]="backLink" class="btn items-center mb-8 w-64 flex flex-row"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-8 h-8"
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

  get backLink(): string {
    const post = this.post$();
    const category = post?.attributes?.category;

    switch (category) {
      case 'computer-science':
        return '/computer-science';
      case 'entrepreneurship':
        return '/entrepreneurship';
      case 'art-of-living':
        return '/art-of-living';
      case 'finance':
        return '/finance';
      default:
        return '/computer-science'; // Default for posts without category
    }
  }

  get backLinkText(): string {
    const post = this.post$();
    const category = post?.attributes?.category;

    switch (category) {
      case 'computer-science':
        return 'Back to Computer Science';
      case 'entrepreneurship':
        return 'Back to Entrepreneurship';
      case 'art-of-living':
        return 'Back to Art of Living';
      case 'finance':
        return 'Back to Finance';
      default:
        return 'Back to Computer Science';
    }
  }
}

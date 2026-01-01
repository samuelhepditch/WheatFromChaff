import { Component, Input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { injectContentFiles } from '@analogjs/content';
import { NgFor } from '@angular/common';

export interface PostAttributes {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  category?: string;
}

interface CategoryConfig {
  title: string;
  category: string;
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'computer-science': { title: 'Computer Science Topics', category: 'computer-science' },
  'entrepreneurship': { title: 'Entrepreneurship Topics', category: 'entrepreneurship' },
  'art-of-living': { title: 'Art of Living Topics', category: 'art-of-living' },
  'finance': { title: 'Finance Topics', category: 'finance' }
};

@Component({
  selector: 'app-category-blog',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgFor],
  template: `
    <div class="bg-base-100 pt-6 sm:pt-8 pb-16 sm:pb-24 lg:pb-32">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:mx-0">
          <h2 class="font-bold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl tracking-tight">
            {{ categoryConfig?.title }}
          </h2>
        </div>
        <div
          class="mt-8 sm:mt-10 border-t border-gray-200 pt-8 sm:pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          <div
            *ngFor="let post of filteredPosts"
            class="card bg-base-200 shadow-xl w-full"
          >
            <div class="card-body p-4 sm:p-6">
              <a
                [routerLink]="['/blog', 'posts', post.slug]"
                class="hover:underline"
              >
                <h2 class="card-title text-lg sm:text-xl">{{ post?.attributes?.title }}</h2></a
              >
              <p class="text-sm sm:text-base text-base-content/70">{{ post?.attributes?.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
        flex-direction: column;
      }
    `,
  ],
})
export class CategoryBlogComponent {
  @Input() category!: string;

  allPosts = injectContentFiles<PostAttributes>((contentFile) =>
    contentFile.filename.includes('/src/content/blog')
  );

  get categoryConfig() {
    return CATEGORY_CONFIGS[this.category];
  }

  get filteredPosts() {
    return this.allPosts.filter(post => {
      if (this.category === 'computer-science') {
        return post.attributes.category === 'computer-science' || !post.attributes.category;
      }
      return post.attributes.category === this.category;
    });
  }
}
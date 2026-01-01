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
    <div class="bg-base-100 pt-8 pb-24 sm:pb-32">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:mx-0">
          <h2 class="font-bold md:text-5xl text-3xl tracking-tight">
            {{ categoryConfig?.title }}
          </h2>
        </div>
        <div
          class="mt-10 border-t border-gray-200 flex gap-4 pt-10 flex-wrap gap-y-8"
        >
          <div
            *ngFor="let post of filteredPosts"
            class="card w-96 bg-base-200 shadow-xl"
          >
            <div class="card-body">
              <a
                [routerLink]="['/blog', 'posts', post.slug]"
                class="hover:underline"
              >
                <h2 class="card-title">{{ post?.attributes?.title }}</h2></a
              >
              <p>{{ post?.attributes?.description }}</p>
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
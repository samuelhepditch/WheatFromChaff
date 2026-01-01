import { Component } from '@angular/core';
import { CategoryBlogComponent } from '../shared/components/category-blog/category-blog.component';

@Component({
  standalone: true,
  imports: [CategoryBlogComponent],
  template: `<app-category-blog category="art-of-living"></app-category-blog>`,
})
export default class ArtOfLivingComponent {}
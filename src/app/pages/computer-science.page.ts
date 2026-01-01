import { Component } from '@angular/core';
import { CategoryBlogComponent } from '../shared/components/category-blog/category-blog.component';

@Component({
  standalone: true,
  imports: [CategoryBlogComponent],
  template: `<app-category-blog category="computer-science"></app-category-blog>`,
})
export default class ComputerScienceComponent {}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog, CreateBlogDto } from '../../models';

@Component({
  selector: 'app-blog-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './blog-form.component.html',
  styleUrl: './blog-form.component.scss'
})
export class BlogFormComponent implements OnInit {
  blogForm!: FormGroup;
  isEditMode = false;
  blogId?: string;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.blogId = id;
      this.loadBlog(this.blogId);
    }
  }

  initForm(): void {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      summary: ['', [Validators.required, Validators.maxLength(500)]],
      content: ['', [Validators.required]],
      isPublished: [false],
      tags: ['']
    });
  }

  loadBlog(id: string): void {
    this.loading = true;
    this.blogService.getById(id).subscribe({
      next: (blog) => {
        this.blogForm.patchValue({
          title: blog.title,
          summary: blog.summary,
          content: blog.content,
          isPublished: blog.isPublished,
          tags: blog.tags ? blog.tags.join(', ') : ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blog';
        this.loading = false;
        console.error('Error loading blog:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      Object.keys(this.blogForm.controls).forEach(key => {
        this.blogForm.controls[key].markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.blogForm.value;
    const blogData: CreateBlogDto = {
      title: formValue.title,
      summary: formValue.summary,
      content: formValue.content,
      isPublished: formValue.isPublished,
      tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : []
    };

    const request$ = this.isEditMode
      ? this.blogService.update(this.blogId!, blogData)
      : this.blogService.create(blogData);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/dashboard/blogs']);
      },
      error: (err) => {
        this.error = this.isEditMode ? 'Failed to update blog' : 'Failed to create blog';
        this.loading = false;
        console.error('Error saving blog:', err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/blogs']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.blogForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.blogForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at most ${maxLength} characters`;
    }
    return '';
  }
}

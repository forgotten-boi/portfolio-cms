import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { NotificationService } from '../../services/notification.service';
import { Blog, CreateBlogDto } from '../../models';
import Quill from 'quill';

@Component({
  selector: 'app-blog-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './blog-form.component.html',
  styleUrl: './blog-form.component.scss'
})
export class BlogFormComponent implements OnInit, AfterViewInit {
  @ViewChild('editor') editorElement!: ElementRef;
  
  blogForm!: FormGroup;
  isEditMode = false;
  blogId?: string;
  loading = false;
  error: string | null = null;
  quillEditor: Quill | null = null;
  selectedHeaderImage: File | null = null;
  headerImagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
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

  ngAfterViewInit(): void {
    if (this.editorElement) {
      this.quillEditor = new Quill(this.editorElement.nativeElement, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image', 'code-block'],
            ['clean']
          ]
        },
        placeholder: 'Write your blog content here...'
      });

      // Sync Quill content with form control
      this.quillEditor.on('text-change', () => {
        const content = this.quillEditor?.root.innerHTML || '';
        this.blogForm.patchValue({ content }, { emitEvent: false });
      });
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
        
        // Set Quill content
        if (this.quillEditor && blog.content) {
          this.quillEditor.root.innerHTML = blog.content;
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blog';
        this.loading = false;
        console.error('Error loading blog:', err);
      }
    });
  }

  onHeaderImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedHeaderImage = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.headerImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.error = 'Please select a valid image file';
    }
  }

  removeHeaderImage(): void {
    this.selectedHeaderImage = null;
    this.headerImagePreview = null;
  }

  async uploadHeaderImage(): Promise<string | null> {
    if (!this.selectedHeaderImage) return null;

    // TODO: Implement actual image upload to backend or cloud storage
    // For now, return base64 data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(this.selectedHeaderImage!);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.blogForm.invalid) {
      Object.keys(this.blogForm.controls).forEach(key => {
        this.blogForm.controls[key].markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // Upload header image if selected
      let headerImageUrl = null;
      if (this.selectedHeaderImage) {
        headerImageUrl = await this.uploadHeaderImage();
      }

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
          this.notificationService.success(
            this.isEditMode ? 'Blog updated successfully' : 'Blog created successfully'
          );
          this.router.navigate(['/blogs']);
        },
        error: (err) => {
          this.error = this.isEditMode ? 'Failed to update blog' : 'Failed to create blog';
          this.loading = false;
          console.error('Error saving blog:', err);
        }
      });
    } catch (err) {
      this.error = 'Failed to upload header image';
      this.loading = false;
      console.error('Image upload error:', err);
    }
  }

  cancel(): void {
    this.router.navigate(['/blogs']);
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

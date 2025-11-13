import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models';

@Component({
  selector: 'app-registration',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  formData: RegisterRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    profileImageUrl: '',
    tenantId: ''
  };
  
  confirmPassword = '';
  error = '';
  success = '';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.formData.profileImageUrl = '';
  }

  async uploadImage(): Promise<string | undefined> {
    if (!this.selectedFile) return this.formData.profileImageUrl;

    // TODO: Implement actual image upload to your backend or cloud storage
    // For now, we'll use a placeholder URL or base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(this.selectedFile!);
    });
  }

  async register(): Promise<void> {
    this.error = '';
    this.success = '';

    // Validation
    if (!this.formData.email || !this.formData.password || 
        !this.formData.firstName || !this.formData.lastName) {
      this.error = 'Please fill in all required fields';
      return;
    }

    if (this.formData.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.formData.password.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.formData.email)) {
      this.error = 'Please enter a valid email address';
      return;
    }

    this.loading = true;

    try {
      // Upload image if selected
      if (this.selectedFile) {
        const imageUrl = await this.uploadImage();
        this.formData.profileImageUrl = imageUrl;
      }

      // Register user
      this.authService.register(this.formData).subscribe({
        next: (result) => {
          this.loading = false;
          if (result.success) {
            this.success = 'Registration successful! Redirecting to login...';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.error = result.error || 'Registration failed';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.detail || err.error?.message || 'An error occurred during registration';
          console.error('Registration error:', err);
        }
      });
    } catch (err) {
      this.loading = false;
      this.error = 'Failed to upload image';
      console.error('Image upload error:', err);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;
  showCreateAdminModal = false;
  
  newAdmin = {
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  };
  creatingAdmin = false;
  createAdminError: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.userService.getAll().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load users';
        this.loading = false;
        console.error('Error loading users:', err);
      }
    });
  }

  openCreateAdminModal(): void {
    this.showCreateAdminModal = true;
    this.createAdminError = null;
    this.newAdmin = {
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    };
  }

  closeCreateAdminModal(): void {
    this.showCreateAdminModal = false;
    this.createAdminError = null;
  }

  createAdmin(): void {
    if (!this.newAdmin.email || !this.newAdmin.password || 
        !this.newAdmin.firstName || !this.newAdmin.lastName) {
      this.createAdminError = 'All fields are required';
      return;
    }

    if (this.newAdmin.password.length < 6) {
      this.createAdminError = 'Password must be at least 6 characters';
      return;
    }

    this.creatingAdmin = true;
    this.createAdminError = null;

    this.authService.createAdmin(this.newAdmin).subscribe({
      next: () => {
        this.closeCreateAdminModal();
        this.loadUsers();
      },
      error: (err: any) => {
        this.createAdminError = err.error?.message || 'Failed to create admin user';
        this.creatingAdmin = false;
        console.error('Error creating admin:', err);
      }
    });
  }

  getRoleClass(role?: string): string {
    const lowerRole = role?.toLowerCase();
    switch (lowerRole) {
      case 'admin': return 'role-admin';
      case 'member': return 'role-member';
      case 'guest': return 'role-guest';
      default: return 'role-guest';
    }
  }

  getRoleText(role?: string): string {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Guest';
  }
}

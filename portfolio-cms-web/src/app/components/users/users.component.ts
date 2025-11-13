import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models';

@Component({
  selector: 'app-users',
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.loading = false;
        console.error('Error loading users:', err);
      }
    });
  }

  getRoleClass(role?: string): string {
    const lowerRole = role?.toLowerCase();
    switch (lowerRole) {
      case 'admin': return 'role-admin';
      case 'editor': return 'role-editor';
      case 'viewer': return 'role-viewer';
      default: return 'role-guest';
    }
  }

  getRoleText(role?: string): string {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Guest';
  }
}

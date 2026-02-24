import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private sub!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.sub = this.notificationService.notifications$.subscribe(
      notifications => (this.notifications = notifications)
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}

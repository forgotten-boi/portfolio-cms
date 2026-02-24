import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 4000): void {
    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      message
    };
    this.notificationsSubject.next([...this.notificationsSubject.value, notification]);
    setTimeout(() => this.dismiss(notification.id), duration);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 6000);
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  dismiss(id: string): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.filter(n => n.id !== id)
    );
  }
}

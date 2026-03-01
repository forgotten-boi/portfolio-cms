import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ActivityNotification } from '../models';

const STORAGE_KEY = 'activity_notifications';

@Injectable({
  providedIn: 'root'
})
export class ActivityNotificationService {
  private readonly baseUrl = `${environment.apiUrl}/notifications`;
  private notificationsSubject = new BehaviorSubject<ActivityNotification[]>(this.loadFromStorage());
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromBackend();
  }

  get unreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  add(message: string, type: ActivityNotification['type'] = 'info'): void {
    // Optimistic local update
    const notification: ActivityNotification = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
      read: false
    };
    const updated = [notification, ...this.notificationsSubject.value].slice(0, 50);
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);

    // Persist to backend
    this.http.post<any>(this.baseUrl, { type, message }).subscribe({
      next: (saved) => {
        // Replace the optimistic entry with the server-generated one
        const current = this.notificationsSubject.value.map(n =>
          n.id === notification.id ? this.mapFromBackend(saved) : n
        );
        this.notificationsSubject.next(current);
        this.saveToStorage(current);
      },
      error: () => { /* keep local version on failure */ }
    });
  }

  markAllRead(): void {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    this.saveToStorage(updated);

    this.http.put(`${this.baseUrl}/read-all`, {}).subscribe({
      error: () => { /* local state already updated */ }
    });
  }

  clear(): void {
    this.notificationsSubject.next([]);
    this.saveToStorage([]);

    this.http.delete(this.baseUrl).subscribe({
      error: () => { /* local state already cleared */ }
    });
  }

  private loadFromBackend(): void {
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (notifications) => {
        if (notifications && notifications.length > 0) {
          const mapped = notifications.map(n => this.mapFromBackend(n));
          this.notificationsSubject.next(mapped);
          this.saveToStorage(mapped);
        }
      },
      error: () => { /* fall back to localStorage data */ }
    });
  }

  private mapFromBackend(n: any): ActivityNotification {
    return {
      id: n.id,
      type: n.type,
      message: n.message,
      timestamp: new Date(n.createdAt),
      read: n.isRead
    };
  }

  private loadFromStorage(): ActivityNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(notifications: ActivityNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch { /* ignore storage errors */ }
  }
}

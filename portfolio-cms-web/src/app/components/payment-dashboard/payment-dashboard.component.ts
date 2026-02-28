import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { EventService } from '../../services/event.service';
import { EventAnalyticsService } from '../../services/event-analytics.service';
import { NotificationService } from '../../services/notification.service';
import { PaymentMetrics, IntegrationEvent } from '../../models';

@Component({
  selector: 'app-payment-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-dashboard.component.html',
  styleUrl: './payment-dashboard.component.scss'
})
export class PaymentDashboardComponent implements OnInit, OnDestroy {
  loading = true;
  connected = false;
  metrics: PaymentMetrics = {
    totalOrders: 0, authorizedCount: 0, capturedCount: 0,
    failedCount: 0, cancelledCount: 0, capturedVolume: 0, currency: 'USD'
  };
  recentEvents: IntegrationEvent[] = [];
  private subs = new Subscription();

  constructor(
    private paymentService: PaymentService,
    private eventService: EventService,
    private analyticsService: EventAnalyticsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadMetrics();
    this.eventService.connect();

    this.subs.add(
      this.eventService.isConnected$.subscribe(c => this.connected = c)
    );

    this.subs.add(
      this.eventService.paymentEvents$.subscribe(event => {
        this.handlePaymentEvent(event);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadMetrics(): void {
    this.loading = true;
    this.analyticsService.getSummary().subscribe({
      next: (data) => {
        this.metrics = data.payment;
        this.recentEvents = data.recentEvents.filter(e => e.source === 'payment').slice(0, 10);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.warning('Could not load payment metrics. Is the BFF server running?');
      }
    });
  }

  private handlePaymentEvent(event: IntegrationEvent): void {
    // Update local counters in real-time
    switch (event.eventType) {
      case 'payment.order.created':
        this.metrics.totalOrders++;
        break;
      case 'payment.authorized':
        this.metrics.authorizedCount++;
        this.notificationService.info('Payment authorized');
        break;
      case 'payment.captured':
        this.metrics.capturedCount++;
        this.metrics.capturedVolume += (event.payload['amount'] as number) || 0;
        this.notificationService.success('Payment captured successfully');
        break;
      case 'payment.failed':
        this.metrics.failedCount++;
        this.notificationService.error('Payment failed: ' + (event.payload['failureReason'] || 'Unknown'));
        break;
    }

    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 10) this.recentEvents.pop();
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'payment.order.created': 'badge-blue',
      'payment.authorized': 'badge-amber',
      'payment.captured': 'badge-green',
      'payment.failed': 'badge-red',
      'payment.settled': 'badge-purple',
    };
    return map[status] || 'badge-default';
  }

  getEventLabel(eventType: string): string {
    return eventType.split('.').pop()?.replace(/_/g, ' ') || eventType;
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }
}

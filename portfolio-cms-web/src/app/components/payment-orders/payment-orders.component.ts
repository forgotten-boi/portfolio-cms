import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../services/notification.service';
import { OrderDetail } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface TrackedOrder {
  orderId: string;
  detail?: OrderDetail;
  loading: boolean;
}

@Component({
  selector: 'app-payment-orders',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './payment-orders.component.html',
  styleUrl: './payment-orders.component.scss'
})
export class PaymentOrdersComponent implements OnInit {
  orders: TrackedOrder[] = [];
  loading = false;

  private readonly STORAGE_KEY = 'payment_tracked_orders';

  constructor(
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTrackedOrders();
  }

  loadTrackedOrders(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const orderIds: string[] = JSON.parse(stored);
      this.orders = orderIds.map(id => ({ orderId: id, loading: true }));
      this.refreshAll();
    }
  }

  refreshAll(): void {
    for (const order of this.orders) {
      this.refreshOrder(order);
    }
  }

  refreshOrder(order: TrackedOrder): void {
    order.loading = true;
    this.paymentService.getOrder(order.orderId).subscribe({
      next: (detail) => {
        order.detail = detail;
        order.loading = false;
      },
      error: () => {
        order.loading = false;
        this.notificationService.warning(`Could not load order ${order.orderId}`);
      }
    });
  }

  confirmOrder(order: TrackedOrder): void {
    if (!order.detail) return;
    this.paymentService.confirmOrder(order.orderId).subscribe({
      next: () => {
        this.notificationService.success('Order confirmed — capture will follow');
        setTimeout(() => this.refreshOrder(order), 2000);
      },
      error: (err) => {
        this.notificationService.error('Confirm failed: ' + (err.error?.detail || err.message));
      }
    });
  }

  cancelOrder(order: TrackedOrder): void {
    if (!order.detail) return;
    this.paymentService.cancelOrder(order.orderId).subscribe({
      next: () => {
        this.notificationService.info('Order cancelled');
        setTimeout(() => this.refreshOrder(order), 1000);
      },
      error: (err) => {
        this.notificationService.error('Cancel failed: ' + (err.error?.detail || err.message));
      }
    });
  }

  removeOrder(index: number): void {
    this.orders.splice(index, 1);
    this.saveTrackedOrders();
  }

  private saveTrackedOrders(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.orders.map(o => o.orderId)));
  }

  trackNewOrder(orderId: string): void {
    if (!this.orders.find(o => o.orderId === orderId)) {
      const order: TrackedOrder = { orderId, loading: true };
      this.orders.unshift(order);
      this.saveTrackedOrders();
      this.refreshOrder(order);
    }
  }

  getStatusBadgeClass(status?: string): string {
    if (!status) return 'badge-default';
    const map: Record<string, string> = {
      'Pending': 'badge-blue',
      'PaymentAuthorized': 'badge-amber',
      'Confirmed': 'badge-green',
      'Captured': 'badge-green',
      'Failed': 'badge-red',
      'Cancelled': 'badge-gray',
    };
    return map[status] || 'badge-default';
  }

  formatCurrency(amount?: number, currency: string = 'USD'): string {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }
}

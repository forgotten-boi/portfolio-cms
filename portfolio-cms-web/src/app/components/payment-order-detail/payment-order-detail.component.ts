import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../services/notification.service';
import { OrderDetail, PaymentDetail, LedgerEntry } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-payment-order-detail',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './payment-order-detail.component.html',
  styleUrl: './payment-order-detail.component.scss'
})
export class PaymentOrderDetailComponent implements OnInit {
  orderId = '';
  order: OrderDetail | null = null;
  payment: PaymentDetail | null = null;
  ledgerEntries: LedgerEntry[] = [];
  loading = true;
  acting = false;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    this.loadOrder();
  }

  loadOrder(): void {
    this.loading = true;
    this.paymentService.getOrder(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load order');
      }
    });
  }

  loadPayment(): void {
    if (!this.order?.paymentId) return;
    this.paymentService.getPayment(this.order.paymentId).subscribe({
      next: (p) => this.payment = p,
      error: () => this.notificationService.warning('Could not load payment details')
    });
  }

  loadLedger(): void {
    if (!this.order?.paymentId) return;
    this.paymentService.getLedgerEntries(this.order.paymentId).subscribe({
      next: (entries) => this.ledgerEntries = entries,
      error: () => this.notificationService.warning('No ledger entries found')
    });
  }

  confirm(): void {
    this.acting = true;
    this.paymentService.confirmOrder(this.orderId).subscribe({
      next: () => {
        this.notificationService.success('Order confirmed');
        this.acting = false;
        setTimeout(() => this.loadOrder(), 2000);
      },
      error: (err) => {
        this.acting = false;
        this.notificationService.error('Confirm failed: ' + (err.error?.detail || err.message));
      }
    });
  }

  cancel(): void {
    this.acting = true;
    this.paymentService.cancelOrder(this.orderId).subscribe({
      next: () => {
        this.notificationService.info('Order cancelled');
        this.acting = false;
        setTimeout(() => this.loadOrder(), 1000);
      },
      error: (err) => {
        this.acting = false;
        this.notificationService.error('Cancel failed: ' + (err.error?.detail || err.message));
      }
    });
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'badge-blue', 'PaymentAuthorized': 'badge-amber',
      'Confirmed': 'badge-green', 'Captured': 'badge-green',
      'Failed': 'badge-red', 'Cancelled': 'badge-gray',
    };
    return map[status] || 'badge-default';
  }
}

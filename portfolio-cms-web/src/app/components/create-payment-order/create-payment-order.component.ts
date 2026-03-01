import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { EventAnalyticsService } from '../../services/event-analytics.service';
import { NotificationService } from '../../services/notification.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-create-payment-order',
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './create-payment-order.component.html',
  styleUrl: './create-payment-order.component.scss'
})
export class CreatePaymentOrderComponent {
  customerId = this.generateUUID();
  amount = 250.00;
  currency = 'USD';
  submitting = false;
  message = '';
  messageClass = '';
  lastOrderId: string | null = null;

  constructor(
    private paymentService: PaymentService,
    private analyticsService: EventAnalyticsService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  submitOrder(): void {
    this.submitting = true;
    this.message = '';

    const request = {
      customerId: this.customerId,
      amount: this.amount,
      currency: this.currency,
      idempotencyKey: this.generateUUID()
    };

    this.paymentService.createOrder(request).subscribe({
      next: (result) => {
        this.submitting = false;
        this.lastOrderId = result.orderId;
        this.message = `Order created: ${result.orderId} — Status: ${result.status}`;
        this.messageClass = 'alert-success';
        this.notificationService.success('Order created successfully');

        // Track the order
        const stored = JSON.parse(localStorage.getItem('payment_tracked_orders') || '[]');
        stored.unshift(result.orderId);
        localStorage.setItem('payment_tracked_orders', JSON.stringify(stored));

        // Emit event
        this.analyticsService.publishEvent('payment.order.created', {
          orderId: result.orderId,
          amount: this.amount,
          currency: this.currency,
          customerId: this.customerId
        }).subscribe();
      },
      error: (err) => {
        this.submitting = false;
        this.message = err.error?.detail || err.message || 'Failed to create order';
        this.messageClass = 'alert-error';
        this.notificationService.error(this.message);
      }
    });
  }

  viewOrder(): void {
    if (this.lastOrderId) {
      this.router.navigate(['/dashboard/payments/orders', this.lastOrderId]);
    }
  }

  private generateUUID(): string {
    return crypto.randomUUID();
  }
}

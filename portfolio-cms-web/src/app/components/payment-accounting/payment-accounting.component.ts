import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../services/notification.service';
import { AccountBalance, ReconciliationResult } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-payment-accounting',
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './payment-accounting.component.html',
  styleUrl: './payment-accounting.component.scss'
})
export class PaymentAccountingComponent implements OnInit {
  receivable: AccountBalance | null = null;
  revenue: AccountBalance | null = null;
  reconciliation: ReconciliationResult | null = null;
  loading = true;
  lookupTransactionId = '';

  constructor(
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBalances();
  }

  loadBalances(): void {
    this.loading = true;
    let loaded = 0;
    const done = () => { loaded++; if (loaded >= 2) this.loading = false; };

    this.paymentService.getAccountBalance('CustomerReceivable').subscribe({
      next: (b) => { this.receivable = b; done(); },
      error: () => { done(); }
    });

    this.paymentService.getAccountBalance('Revenue').subscribe({
      next: (b) => { this.revenue = b; done(); },
      error: () => { done(); }
    });
  }

  runReconciliation(): void {
    this.paymentService.runReconciliation().subscribe({
      next: (r) => {
        this.reconciliation = r;
        if (r.isBalanced) {
          this.notificationService.success('Reconciliation passed — books are balanced! ✅');
        } else {
          this.notificationService.error(`Reconciliation failed — difference: ${r.difference}`);
        }
      },
      error: (err) => {
        this.notificationService.error('Reconciliation failed: ' + (err.error?.detail || err.message));
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
}

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { EventService } from '../../services/event.service';
import { IntegrationEvent, OrderResult, PaymentDetail, LedgerEntry } from '../../models';

interface LifecycleStep {
  id: string;
  label: string;
  icon: string;
  status: 'pending' | 'running' | 'success' | 'error';
  detail?: string;
  duration?: number;
}

@Component({
  selector: 'app-payment-lifecycle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-lifecycle.component.html',
  styleUrls: ['./payment-lifecycle.component.scss'],
})
export class PaymentLifecycleComponent implements OnDestroy {
  steps: LifecycleStep[] = [];
  events: IntegrationEvent[] = [];
  running = false;
  completed = false;
  orderId: string | null = null;
  order: OrderResult | null = null;
  payment: PaymentDetail | null = null;
  ledgerEntries: LedgerEntry[] = [];

  private sub = new Subscription();

  constructor(
    private paymentService: PaymentService,
    private eventService: EventService
  ) {}

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  resetSteps(): void {
    this.steps = [
      { id: 'create',   label: 'Create Order',   icon: '📝', status: 'pending' },
      { id: 'poll',     label: 'Poll Status',     icon: '🔄', status: 'pending' },
      { id: 'confirm',  label: 'Confirm Order',   icon: '✅', status: 'pending' },
      { id: 'capture',  label: 'Await Capture',   icon: '💰', status: 'pending' },
      { id: 'ledger',   label: 'Verify Ledger',   icon: '📒', status: 'pending' },
    ];
    this.events = [];
    this.orderId = null;
    this.order = null;
    this.payment = null;
    this.ledgerEntries = [];
    this.completed = false;
  }

  async runLifecycle(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.resetSteps();

    // Subscribe to real-time events
    this.sub.add(
      this.eventService.paymentEvents$.subscribe((ev) => {
        this.events = [ev, ...this.events].slice(0, 50);
      })
    );

    try {
      // Step 1 — Create Order
      await this.executeStep('create', async () => {
        const customerId = `lifecycle-${Date.now()}`;
        const result = await this.paymentService.createOrder({
          customerId,
          amount: 42.0,
          currency: 'USD',
          idempotencyKey: crypto.randomUUID(),
        }).toPromise();
        this.orderId = result!.orderId;
        this.order = result!;
        return `Order ${this.orderId}`;
      });

      // Step 2 — Poll until PaymentAuthorized
      await this.executeStep('poll', async () => {
        let attempts = 0;
        const maxAttempts = 20;
        while (attempts < maxAttempts) {
          await this.delay(1000);
          const detail = await this.paymentService.getOrder(this.orderId!).toPromise();
          this.order = detail as any;
          attempts++;
          if (detail!.status === 'PaymentAuthorized' || detail!.status === 'Confirmed') {
            return `Authorized after ${attempts}s`;
          }
        }
        throw new Error('Timed out waiting for authorization');
      });

      // Step 3 — Confirm Order
      await this.executeStep('confirm', async () => {
        await this.paymentService.confirmOrder(this.orderId!).toPromise();
        await this.delay(500);
        const detail = await this.paymentService.getOrder(this.orderId!).toPromise();
        this.order = detail as any;
        return `Status: ${detail!.status}`;
      });

      // Step 4 — Await Capture (Completed)
      await this.executeStep('capture', async () => {
        let attempts = 0;
        const maxAttempts = 20;
        while (attempts < maxAttempts) {
          await this.delay(1000);
          const detail = await this.paymentService.getOrder(this.orderId!).toPromise();
          this.order = detail as any;
          attempts++;
          if (detail!.status === 'Completed') {
            // Also fetch payment
            try {
              const pay = await this.paymentService.getPayment(this.orderId!).toPromise();
              this.payment = pay!;
            } catch {}
            return `Completed after ${attempts}s`;
          }
        }
        throw new Error('Timed out waiting for capture');
      });

      // Step 5 — Verify Ledger
      await this.executeStep('ledger', async () => {
        await this.delay(500);
        const entries = await this.paymentService.getLedgerEntries(this.orderId!).toPromise();
        this.ledgerEntries = entries || [];
        return `${this.ledgerEntries.length} ledger entries`;
      });

      this.completed = true;
    } catch (err: any) {
      console.error('Lifecycle error:', err);
    } finally {
      this.running = false;
    }
  }

  private async executeStep(
    stepId: string,
    fn: () => Promise<string>
  ): Promise<void> {
    const step = this.steps.find((s) => s.id === stepId)!;
    step.status = 'running';
    const start = Date.now();
    try {
      const detail = await fn();
      step.duration = Date.now() - start;
      step.detail = detail;
      step.status = 'success';
    } catch (err: any) {
      step.duration = Date.now() - start;
      step.detail = err.message || 'Failed';
      step.status = 'error';
      throw err;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getStepClass(step: LifecycleStep): string {
    return `step-${step.status}`;
  }

  formatDuration(ms?: number): string {
    if (ms === undefined) return '';
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  }
}

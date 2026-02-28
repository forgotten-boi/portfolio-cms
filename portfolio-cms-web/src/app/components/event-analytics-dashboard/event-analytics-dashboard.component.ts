import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, interval, switchMap, startWith } from 'rxjs';
import { EventAnalyticsService } from '../../services/event-analytics.service';
import { EventService } from '../../services/event.service';
import {
  AggregatedAnalytics,
  PaymentMetrics,
  PortfolioMetrics,
  IntegrationEvent,
} from '../../models';

@Component({
  selector: 'app-event-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-analytics-dashboard.component.html',
  styleUrls: ['./event-analytics-dashboard.component.scss'],
})
export class EventAnalyticsDashboardComponent implements OnInit, OnDestroy {
  summary: AggregatedAnalytics | null = null;
  paymentMetrics: PaymentMetrics | null = null;
  portfolioMetrics: PortfolioMetrics | null = null;
  recentEvents: IntegrationEvent[] = [];
  liveEvents: IntegrationEvent[] = [];
  loading = true;

  private subs = new Subscription();

  constructor(
    private analyticsService: EventAnalyticsService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadData();

    // Auto-refresh every 10s
    this.subs.add(
      interval(10000)
        .pipe(switchMap(() => this.analyticsService.getSummary()))
        .subscribe((s) => (this.summary = s))
    );

    // Live events from SSE
    this.subs.add(
      this.eventService.paymentEvents$.subscribe((ev) => {
        this.liveEvents = [ev, ...this.liveEvents].slice(0, 100);
      })
    );
    this.subs.add(
      this.eventService.portfolioEvents$.subscribe((ev) => {
        this.liveEvents = [ev, ...this.liveEvents].slice(0, 100);
      })
    );
    this.subs.add(
      this.eventService.analyticsEvents$.subscribe((ev) => {
        this.liveEvents = [ev, ...this.liveEvents].slice(0, 100);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadData(): void {
    this.loading = true;
    this.subs.add(
      this.analyticsService.getSummary().subscribe({
        next: (s) => {
          this.summary = s;
          this.loading = false;
        },
        error: () => (this.loading = false),
      })
    );
    this.subs.add(
      this.analyticsService.getPaymentMetrics().subscribe((m) => (this.paymentMetrics = m))
    );
    this.subs.add(
      this.analyticsService.getPortfolioMetrics().subscribe((m) => (this.portfolioMetrics = m))
    );
    this.subs.add(
      this.analyticsService.getEventFeed(30).subscribe((events) => (this.recentEvents = events))
    );
  }

  resetCounters(): void {
    this.subs.add(
      this.analyticsService.resetCounters().subscribe(() => {
        this.loadData();
        this.liveEvents = [];
      })
    );
  }

  getEventIcon(type: string): string {
    if (type.includes('Order')) return '📝';
    if (type.includes('Payment')) return '💳';
    if (type.includes('Ledger') || type.includes('Accounting')) return '📒';
    if (type.includes('Blog')) return '📝';
    if (type.includes('Portfolio')) return '🎨';
    if (type.includes('CV') || type.includes('Resume')) return '📄';
    return '📡';
  }

  getCategoryColor(type: string): string {
    if (type.includes('Order') || type.includes('Payment') || type.includes('Ledger')) return 'cat-payment';
    if (type.includes('Blog')) return 'cat-blog';
    if (type.includes('Portfolio')) return 'cat-portfolio';
    return 'cat-other';
  }
}

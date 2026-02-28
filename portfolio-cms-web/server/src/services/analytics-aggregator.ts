import { IntegrationEvent } from '../messaging';

/**
 * In-memory real-time analytics aggregator.
 *
 * In production this role is served by Azure Stream Analytics or
 * Databricks streaming jobs reading from Event Hub. For the BFF
 * local dev experience we keep lightweight counters in memory.
 */

interface PaymentMetrics {
  totalOrders: number;
  authorizedCount: number;
  capturedCount: number;
  failedCount: number;
  cancelledCount: number;
  capturedVolume: number;
  currency: string;
}

interface PortfolioMetrics {
  blogPublishedCount: number;
  blogViewCount: number;
  cvUpdateCount: number;
  resumeGeneratedCount: number;
  jobMatchCount: number;
  avgMatchScore: number;
}

export interface AggregatedAnalytics {
  payment: PaymentMetrics;
  portfolio: PortfolioMetrics;
  recentEvents: IntegrationEvent[];
  lastUpdated: string;
}

export class AnalyticsAggregator {
  private payment: PaymentMetrics = {
    totalOrders: 0,
    authorizedCount: 0,
    capturedCount: 0,
    failedCount: 0,
    cancelledCount: 0,
    capturedVolume: 0,
    currency: 'USD',
  };

  private portfolio: PortfolioMetrics = {
    blogPublishedCount: 0,
    blogViewCount: 0,
    cvUpdateCount: 0,
    resumeGeneratedCount: 0,
    jobMatchCount: 0,
    avgMatchScore: 0,
  };

  private matchScores: number[] = [];
  private recentEvents: IntegrationEvent[] = [];
  private readonly MAX_RECENT = 50;

  /** Process an incoming event and update aggregated counters */
  processEvent(event: IntegrationEvent): void {
    // Keep recent events ring buffer
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > this.MAX_RECENT) {
      this.recentEvents.pop();
    }

    switch (event.eventType) {
      // Payment events
      case 'payment.order.created':
        this.payment.totalOrders++;
        break;
      case 'payment.authorized':
        this.payment.authorizedCount++;
        break;
      case 'payment.captured':
        this.payment.capturedCount++;
        this.payment.capturedVolume += (event.payload.amount as number) || 0;
        this.payment.currency = (event.payload.currency as string) || 'USD';
        break;
      case 'payment.failed':
        this.payment.failedCount++;
        break;
      case 'payment.cancelled':
      case 'payment.order.cancelled':
        this.payment.cancelledCount++;
        break;

      // Portfolio events
      case 'portfolio.blog.published':
        this.portfolio.blogPublishedCount++;
        break;
      case 'portfolio.blog.viewed':
        this.portfolio.blogViewCount++;
        break;
      case 'portfolio.cv.updated':
      case 'portfolio.cv.created':
        this.portfolio.cvUpdateCount++;
        break;
      case 'portfolio.resume.generated':
        this.portfolio.resumeGeneratedCount++;
        break;
      case 'portfolio.job.match_completed':
        this.portfolio.jobMatchCount++;
        const score = event.payload.matchScore as number;
        if (score) {
          this.matchScores.push(score);
          this.portfolio.avgMatchScore =
            this.matchScores.reduce((a, b) => a + b, 0) / this.matchScores.length;
        }
        break;
    }
  }

  /** Snapshot of current aggregated analytics */
  getSnapshot(): AggregatedAnalytics {
    return {
      payment: { ...this.payment },
      portfolio: { ...this.portfolio },
      recentEvents: [...this.recentEvents],
      lastUpdated: new Date().toISOString(),
    };
  }

  /** Reset all counters (for testing) */
  reset(): void {
    this.payment = {
      totalOrders: 0, authorizedCount: 0, capturedCount: 0,
      failedCount: 0, cancelledCount: 0, capturedVolume: 0, currency: 'USD',
    };
    this.portfolio = {
      blogPublishedCount: 0, blogViewCount: 0, cvUpdateCount: 0,
      resumeGeneratedCount: 0, jobMatchCount: 0, avgMatchScore: 0,
    };
    this.matchScores = [];
    this.recentEvents = [];
  }
}

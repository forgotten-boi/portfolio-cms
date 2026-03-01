import { v4 as uuidv4 } from 'uuid';
import { IEventProducer, IntegrationEvent } from '../messaging';
import { PortfolioEventTypes, PaymentEventTypes, Topics } from '../messaging';

/**
 * Normalises and enriches raw application actions into IntegrationEvents,
 * then publishes them to the appropriate topic. This mirrors the role of
 * Azure Functions in the architecture diagram (enrich / normalize).
 */
export class EventProcessor {
  constructor(private producer: IEventProducer) {}

  // ── Portfolio events ───────────────────────────────────────────

  async onBlogPublished(blogId: string, title: string, authorId: string, correlationId?: string): Promise<void> {
    await this.emit(Topics.PORTFOLIO_BLOG, PortfolioEventTypes.BLOG_PUBLISHED, 'portfolio', {
      blogId, title, authorId,
    }, correlationId);
  }

  async onBlogViewed(blogId: string, viewerId?: string, correlationId?: string): Promise<void> {
    await this.emit(Topics.PORTFOLIO_BLOG, PortfolioEventTypes.BLOG_VIEWED, 'portfolio', {
      blogId, viewerId,
    }, correlationId);
  }

  async onCvUpdated(userId: string, sections: string[], correlationId?: string): Promise<void> {
    await this.emit(Topics.PORTFOLIO_CV, PortfolioEventTypes.CV_UPDATED, 'portfolio', {
      userId, sections,
    }, correlationId);
  }

  async onResumeGenerated(userId: string, templateName: string, correlationId?: string): Promise<void> {
    await this.emit(Topics.PORTFOLIO_RESUME, PortfolioEventTypes.RESUME_GENERATED, 'portfolio', {
      userId, templateName,
    }, correlationId);
  }

  async onJobMatchCompleted(userId: string, matchScore: number, jobTitle: string, correlationId?: string): Promise<void> {
    await this.emit(Topics.PORTFOLIO_CV, PortfolioEventTypes.JOB_MATCH_COMPLETED, 'portfolio', {
      userId, matchScore, jobTitle,
    }, correlationId);
  }

  // ── Payment lifecycle forwarding ───────────────────────────────
  // These are consumed from the .NET services and re-published to
  // analytics topics for the dashboard.

  async onPaymentEvent(eventType: string, payload: Record<string, unknown>, correlationId?: string): Promise<void> {
    await this.emit(Topics.PAYMENT_TRANSACTION, eventType, 'payment', payload, correlationId);
  }

  // ── Analytics aggregation ──────────────────────────────────────

  async publishAnalytics(metrics: Record<string, unknown>, correlationId?: string): Promise<void> {
    await this.emit(Topics.ANALYTICS, 'analytics.metrics_aggregated', 'portfolio', metrics, correlationId);
  }

  // ── Private helper ─────────────────────────────────────────────

  private async emit(
    topic: string,
    eventType: string,
    source: 'portfolio' | 'payment',
    payload: Record<string, unknown>,
    correlationId?: string,
  ): Promise<void> {
    const event: IntegrationEvent = {
      eventId: uuidv4(),
      eventType,
      source,
      timestamp: new Date().toISOString(),
      correlationId: correlationId || uuidv4(),
      payload,
    };

    try {
      await this.producer.publish(topic, event);
    } catch (err) {
      console.error(`[EventProcessor] Failed to publish ${eventType} to ${topic}:`, err);
      // Dead-letter fallback
      try {
        await this.producer.publish(Topics.DEAD_LETTER, {
          ...event,
          payload: { ...event.payload, _error: (err as Error).message, _originalTopic: topic },
        });
      } catch (dlErr) {
        console.error('[EventProcessor] Dead-letter publish also failed:', dlErr);
      }
    }
  }
}

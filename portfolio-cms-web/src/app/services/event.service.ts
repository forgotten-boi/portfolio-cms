import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IntegrationEvent } from '../models';

/**
 * Connects to the BFF's Server-Sent Events (SSE) endpoint for real-time
 * event streaming. Components subscribe to specific event types and
 * receive push updates without polling.
 *
 * The SSE connection auto-reconnects on failure.
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventSource: EventSource | null = null;
  private allEvents$ = new Subject<IntegrationEvent>();
  private connected$ = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: any;

  constructor(private zone: NgZone) {}

  /** Whether the SSE connection is active */
  get isConnected$(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  /** Subscribe to all events */
  get events$(): Observable<IntegrationEvent> {
    return this.allEvents$.asObservable();
  }

  /** Subscribe to events matching a specific event type prefix */
  onEventType(prefix: string): Observable<IntegrationEvent> {
    return this.allEvents$.pipe(
      filter(e => e.eventType.startsWith(prefix))
    );
  }

  /** Subscribe to payment events only */
  get paymentEvents$(): Observable<IntegrationEvent> {
    return this.onEventType('payment.');
  }

  /** Subscribe to portfolio events only */
  get portfolioEvents$(): Observable<IntegrationEvent> {
    return this.onEventType('portfolio.');
  }

  /** Subscribe to analytics events only */
  get analyticsEvents$(): Observable<IntegrationEvent> {
    return this.onEventType('analytics.');
  }

  /** Open the SSE connection */
  connect(): void {
    if (this.eventSource) {
      return; // Already connected
    }

    const url = `${environment.bffUrl}/events/stream`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.zone.run(() => {
        this.connected$.next(true);
        this.reconnectAttempts = 0;
        console.log('[EventService] SSE connected');
      });
    };

    // Listen for all named events from the BFF
    const eventTypes = [
      'payment.order.created', 'payment.order.confirmed', 'payment.order.cancelled',
      'payment.authorized', 'payment.captured', 'payment.failed', 'payment.settled',
      'payment.ledger.created',
      'portfolio.blog.published', 'portfolio.blog.viewed',
      'portfolio.cv.updated', 'portfolio.cv.created',
      'portfolio.resume.generated', 'portfolio.job.match_completed',
      'analytics.metrics_aggregated',
      'connected',
    ];

    for (const type of eventTypes) {
      this.eventSource.addEventListener(type, (event: MessageEvent) => {
        this.zone.run(() => {
          try {
            const data = JSON.parse(event.data) as IntegrationEvent;
            this.allEvents$.next(data);
          } catch {
            // Connected event or non-JSON data
          }
        });
      });
    }

    this.eventSource.onerror = () => {
      this.zone.run(() => {
        this.connected$.next(false);
        console.warn('[EventService] SSE error — reconnecting...');
        this.scheduleReconnect();
      });
    };
  }

  /** Close the SSE connection */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.connected$.next(false);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[EventService] Max reconnect attempts reached');
      return;
    }

    this.disconnect();
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30_000);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      console.log(`[EventService] Reconnect attempt ${this.reconnectAttempts}`);
      this.connect();
    }, delay);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AggregatedAnalytics,
  PaymentMetrics,
  PortfolioMetrics,
  IntegrationEvent
} from '../models';

/**
 * Fetches aggregated analytics from the BFF analytics endpoints.
 * In production, this would query Azure Synapse Serverless SQL or
 * Databricks serving layer. The BFF provides an in-memory real-time
 * aggregation for development.
 */
@Injectable({
  providedIn: 'root'
})
export class EventAnalyticsService {
  private readonly baseUrl = `${environment.bffUrl}/analytics`;

  constructor(private http: HttpClient) {}

  /** Full snapshot: payment + portfolio metrics + recent events */
  getSummary(): Observable<AggregatedAnalytics> {
    return this.http.get<AggregatedAnalytics>(`${this.baseUrl}/summary`);
  }

  /** Payment metrics only */
  getPaymentMetrics(): Observable<PaymentMetrics> {
    return this.http.get<PaymentMetrics>(`${this.baseUrl}/payments`);
  }

  /** Portfolio metrics only */
  getPortfolioMetrics(): Observable<PortfolioMetrics> {
    return this.http.get<PortfolioMetrics>(`${this.baseUrl}/portfolio`);
  }

  /** Recent event feed */
  getEventFeed(limit: number = 20): Observable<IntegrationEvent[]> {
    return this.http.get<IntegrationEvent[]>(`${this.baseUrl}/feed`, {
      params: { limit: limit.toString() }
    });
  }

  /** Publish a portfolio event through the BFF */
  publishEvent(eventType: string, payload: Record<string, unknown>): Observable<any> {
    return this.http.post(`${environment.bffUrl}/events/publish`, {
      eventType,
      payload
    });
  }

  /** Reset analytics counters (for testing) */
  resetCounters(): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset`, {});
  }
}

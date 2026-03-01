import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateOrderRequest,
  OrderResult,
  OrderDetail,
  PaymentDetail,
  LedgerEntry,
  AccountBalance,
  ReconciliationResult
} from '../models';

/**
 * HTTP client for the BFF payment proxy routes.
 * Mirrors the .NET PaymentPlatformClient — one method per API operation.
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly baseUrl = `${environment.bffUrl}/payments`;

  constructor(private http: HttpClient) {}

  // ── Orders ──

  createOrder(request: CreateOrderRequest): Observable<OrderResult> {
    return this.http.post<OrderResult>(`${this.baseUrl}/orders`, request);
  }

  getOrder(orderId: string): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`${this.baseUrl}/orders/${orderId}`);
  }

  confirmOrder(orderId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/orders/${orderId}/confirm`, {});
  }

  cancelOrder(orderId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/orders/${orderId}/cancel`, {});
  }

  // ── Payments ──

  getPayment(paymentId: string): Observable<PaymentDetail> {
    return this.http.get<PaymentDetail>(`${this.baseUrl}/payments/${paymentId}`);
  }

  // ── Accounting / Ledger ──

  getLedgerEntries(transactionId: string): Observable<LedgerEntry[]> {
    return this.http.get<LedgerEntry[]>(`${this.baseUrl}/ledger/${transactionId}`);
  }

  getAccountBalance(accountName: string): Observable<AccountBalance> {
    return this.http.get<AccountBalance>(`${this.baseUrl}/balance/${accountName}`);
  }

  runReconciliation(): Observable<ReconciliationResult> {
    return this.http.post<ReconciliationResult>(`${this.baseUrl}/reconciliation`, {});
  }
}

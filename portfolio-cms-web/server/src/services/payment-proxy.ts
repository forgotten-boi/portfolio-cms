import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

/**
 * HTTP proxy service that forwards requests to the .NET payment microservices.
 * Uses separate axios instances per service — mirrors the Aspire service-discovery
 * model where each service is resolved independently.
 */
export class PaymentProxy {
  private ordersClient: AxiosInstance;
  private paymentsClient: AxiosInstance;
  private accountingClient: AxiosInstance;

  constructor() {
    const timeout = 15_000;

    this.ordersClient = axios.create({
      baseURL: config.services.ordersApi,
      timeout,
    });

    this.paymentsClient = axios.create({
      baseURL: config.services.paymentsApi,
      timeout,
    });

    this.accountingClient = axios.create({
      baseURL: config.services.accountingApi,
      timeout,
    });
  }

  // ── Orders ──

  async createOrder(body: any, correlationId: string) {
    const res = await this.ordersClient.post('/api/orders', body, {
      headers: { 'X-Correlation-Id': correlationId },
    });
    return res.data;
  }

  async getOrder(orderId: string, correlationId: string) {
    const res = await this.ordersClient.get(`/api/orders/${orderId}`, {
      headers: { 'X-Correlation-Id': correlationId },
    });
    return res.data;
  }

  async confirmOrder(orderId: string, correlationId: string) {
    const res = await this.ordersClient.post(`/api/orders/${orderId}/confirm`, null, {
      headers: { 'X-Correlation-Id': correlationId },
    });
    return res.data;
  }

  async cancelOrder(orderId: string, correlationId: string) {
    const res = await this.ordersClient.post(`/api/orders/${orderId}/cancel`, null, {
      headers: { 'X-Correlation-Id': correlationId },
    });
    return res.data;
  }

  // ── Payments ──

  async getPayment(paymentId: string, correlationId: string) {
    const res = await this.paymentsClient.get(`/api/payments/${paymentId}`, {
      headers: { 'X-Correlation-Id': correlationId },
    });
    return res.data;
  }

  // ── Accounting ──

  async getLedgerEntries(transactionId: string, correlationId: string) {
    const res = await this.accountingClient.get(`/api/ledger/${transactionId}`, {
      headers: { 'X-Correlation-Id': correlationId },
    });
    return res.data;
  }

  async getAccountBalance(accountName: string, correlationId: string) {
    const res = await this.accountingClient.get(`/api/ledger/balance/${accountName}`, {
      headers: { 'X-Correlation-Id': correlationId },
    });
    return res.data;
  }

  async runReconciliation(correlationId: string) {
    const res = await this.accountingClient.post('/api/reconciliation/run', null, {
      headers: { 'X-Correlation-Id': correlationId },
    });
    return res.data;
  }
}

/**
 * Shared event type constants — used as the `eventType` discriminator
 * in IntegrationEvent. Both the Node BFF and .NET services use the
 * same string values to ensure interoperability.
 */

// ─── Portfolio Domain Events ─────────────────────────────────────

export const PortfolioEventTypes = {
  BLOG_PUBLISHED:       'portfolio.blog.published',
  BLOG_VIEWED:          'portfolio.blog.viewed',
  BLOG_DELETED:         'portfolio.blog.deleted',
  CV_UPDATED:           'portfolio.cv.updated',
  CV_CREATED:           'portfolio.cv.created',
  RESUME_GENERATED:     'portfolio.resume.generated',
  RESUME_DOWNLOADED:    'portfolio.resume.downloaded',
  JOB_MATCH_COMPLETED:  'portfolio.job.match_completed',
  PORTFOLIO_PUBLISHED:  'portfolio.published',
  PORTFOLIO_VIEWED:     'portfolio.viewed',
} as const;

// ─── Payment Domain Events (mirror .NET BuildingBlocks.Contracts) ─

export const PaymentEventTypes = {
  ORDER_CREATED:        'payment.order.created',
  ORDER_CONFIRMED:      'payment.order.confirmed',
  ORDER_CANCELLED:      'payment.order.cancelled',
  PAYMENT_AUTHORIZED:   'payment.authorized',
  PAYMENT_CAPTURED:     'payment.captured',
  PAYMENT_FAILED:       'payment.failed',
  PAYMENT_SETTLED:      'payment.settled',
  PAYMENT_CANCELLED:    'payment.cancelled',
  LEDGER_ENTRY_CREATED: 'payment.ledger.created',
} as const;

// ─── Cross‑Domain / Analytics Events ─────────────────────────────

export const AnalyticsEventTypes = {
  USER_ACTIVITY:        'analytics.user_activity',
  METRICS_AGGREGATED:   'analytics.metrics_aggregated',
  RISK_SCORE_COMPUTED:  'analytics.risk_score',
} as const;

// ─── Topic Names ─────────────────────────────────────────────────

export const Topics = {
  PORTFOLIO_BLOG:       'portfolio.blog.events',
  PORTFOLIO_CV:         'portfolio.cv.events',
  PORTFOLIO_RESUME:     'portfolio.resume.events',
  PAYMENT_ORDER:        'payment.order.events',
  PAYMENT_TRANSACTION:  'payment.transaction.events',
  PAYMENT_LEDGER:       'payment.ledger.events',
  ANALYTICS:            'analytics.aggregated',
  DEAD_LETTER:          'events.deadletter',
} as const;

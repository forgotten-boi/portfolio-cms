export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  createdAt: Date;
  settings?: any;
}

export interface CreateTenantDto {
  name: string;
  subdomain: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  isActive: boolean;
  createdAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  isPublished: boolean;
  publishedAt?: Date;
  authorId: string;
  tags: string[];
  views: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateBlogDto {
  title: string;
  content: string;
  summary: string;
  isPublished: boolean;
  publishedAt?: Date;
  tags: string[];
}

export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  bio: string;
  template: 'Modern' | 'Classic' | 'Minimalist' | 'Creative';
  isPublic: boolean;
  isPublished: boolean;
  slug?: string;
  templateId?: number;
  publishedAt?: Date;
  templateHtml?: string;
  featuredBlogsEnabled: boolean;
  createdAt: Date;
  updatedAt?: Date;
  data: PortfolioData;
  fullName?: string;
  profileImage?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
  twitter?: string;
  website?: string;
  workExperience?: any[];
  education?: any[];
  skills?: any[];
  projects?: any[];
}

export interface PortfolioData {
  workExperiences?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: Date;
}

export interface Skill {
  name: string;
  level: number;
  category: string;
}

export interface Project {
  name: string;
  description: string;
  url?: string;
  imageUrl?: string;
  technologies: string[];
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date;
}

export interface CreatePortfolioDto {
  title: string;
  subtitle: string;
  bio: string;
  template: string;
  isPublished: boolean;
  featuredBlogsEnabled: boolean;
  data?: PortfolioData;
}

export interface GeneratePortfolioDto {
  pdfBase64?: string;
  linkedInProfileUrl?: string;
  templateName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantId: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  tenantId?: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  userId?: string;
  error?: string;
}

// ─── Payment / Event Models ──────────────────────────────────────

export interface CreateOrderRequest {
  customerId: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
}

export interface OrderResult {
  orderId: string;
  status: string;
}

export interface OrderDetail {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: string;
  paymentId?: string;
  failureReason?: string;
}

export interface PaymentDetail {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  providerTransactionId?: string;
  failureReason?: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  paymentId: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  currency: string;
  description: string;
  createdAt: string;
}

export interface AccountBalance {
  account: string;
  totalDebits: number;
  totalCredits: number;
  netBalance: number;
  entryCount: number;
}

export interface ReconciliationResult {
  isBalanced: boolean;
  totalDebits: number;
  totalCredits: number;
  difference: number;
  entryCount: number;
}

// ─── Event Stream Models ─────────────────────────────────────────

export interface IntegrationEvent {
  eventId: string;
  eventType: string;
  source: 'portfolio' | 'payment';
  timestamp: string;
  correlationId: string;
  causationId?: string;
  payload: Record<string, unknown>;
}

// ─── Analytics Models ────────────────────────────────────────────

export interface PaymentMetrics {
  totalOrders: number;
  authorizedCount: number;
  capturedCount: number;
  failedCount: number;
  cancelledCount: number;
  capturedVolume: number;
  currency: string;
}

export interface PortfolioMetrics {
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

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
  featuredBlogsEnabled: boolean;
  createdAt: Date;
  updatedAt?: Date;
  data: PortfolioData;
}

export interface PortfolioData {
  workExperiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
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
  isPublic: boolean;
  featuredBlogsEnabled: boolean;
  data?: PortfolioData;
}

export interface GeneratePortfolioDto {
  pdfBase64?: string;
  linkedInProfileUrl?: string;
  templateId?: number;
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

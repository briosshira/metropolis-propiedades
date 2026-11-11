/**
 * CRM Domain Types & Multi-Tenant Contracts
 * Real Estate Marketplace & Commission Control System
 */

export type UUID = string;

export type UserRole = 'owner' | 'admin' | 'agent' | 'captador' | 'viewer';

export interface TenantContext {
  tenantId: UUID;
  userId: UUID;
  userRole: UserRole;
}

export type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Contact {
  id: UUID;
  tenantId: UUID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  notes?: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Lead {
  id: UUID;
  tenantId: UUID;
  contactId: UUID;
  propertyId?: UUID | null; // Asociado a la propiedad de interés
  title: string;
  value: number;
  currency: string;
  stage: LeadStage;
  priority: LeadPriority;
  assignedToUserId?: UUID | null;
  source?: string | null;
  expectedCloseDate?: string | null;
  lossReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadWithContact extends Lead {
  contact: Contact;
  property?: Property | null;
}

// ----------------------------------------------------------------------------
// Inmuebles y Marketplace
// ----------------------------------------------------------------------------
export type PropertyType =
  | 'TERRENO'
  | 'CASA'
  | 'DEPARTAMENTO'
  | 'LOCAL_COMERCIAL'
  | 'BODEGA'
  | 'OFICINA';

export type OperationType = 'VENTA' | 'RENTA' | 'TRASPASO';

export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SOLD'
  | 'RENTED'
  | 'ARCHIVED';

export type MediaType = 'IMAGE' | 'VIDEO' | 'FLOORPLAN' | 'DOCUMENT';

export interface PropertyMedia {
  id: UUID;
  propertyId: UUID;
  tenantId: UUID;
  url: string;
  type: MediaType;
  isCover: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface Property {
  id: UUID;
  tenantId: UUID;
  title: string;
  slug: string;
  description: string;
  propertyType: PropertyType;
  operationType: OperationType;
  price: number;
  currency: string; // 'MXN' | 'USD'
  status: PropertyStatus;
  address?: string | null;
  city: string;
  state: string;
  neighborhood?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  landArea?: number | null; // m² terreno
  constructionArea?: number | null; // m² construcción
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  features: string[]; // amenidades / características
  captadorUserId?: UUID | null; // Quien refirió/subió la propiedad para ganar comisión
  assignedAgentId?: UUID | null; // Asesor interno a cargo
  commissionRate: number; // Ej. 5.00% comisión total acordada
  captadorCommissionPct: number; // Ej. 30.00% del total va para el captador
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyWithMedia extends Property {
  media: PropertyMedia[];
  captadorName?: string | null;
  agentName?: string | null;
}

// ----------------------------------------------------------------------------
// Comisiones y Cierre de Tratos
// ----------------------------------------------------------------------------
export type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';

export interface Commission {
  id: UUID;
  tenantId: UUID;
  propertyId: UUID;
  leadId?: UUID | null;
  dealValue: number; // Valor final de la operación
  currency: string;
  totalCommissionAmount: number; // Monto total generado de comisión
  // Reparto Captador (Aliado / Propietario / Afiliado)
  captadorUserId?: UUID | null;
  captadorAmount: number;
  captadorStatus: CommissionStatus;
  // Reparto Asesor / Vendedor interno
  agentUserId?: UUID | null;
  agentAmount: number;
  agentStatus: CommissionStatus;
  paidAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionWithDetails extends Commission {
  propertyTitle: string;
  captadorName?: string | null;
  agentName?: string | null;
}

// ----------------------------------------------------------------------------
// Visitas / Citas Agendadas
// ----------------------------------------------------------------------------
export type VisitStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface PropertyVisit {
  id: UUID;
  tenantId: UUID;
  propertyId: UUID;
  contactId?: UUID | null;
  leadId?: UUID | null;
  assignedAgentId?: UUID | null;
  visitorName: string;
  visitorPhone: string;
  visitorEmail?: string | null;
  scheduledAt: string;
  status: VisitStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Filtros y Respuestas
// ----------------------------------------------------------------------------
export interface PropertyFilterParams {
  operationType?: OperationType;
  propertyType?: PropertyType;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minLandArea?: number;
  bedrooms?: number;
  status?: PropertyStatus | PropertyStatus[];
  captadorUserId?: UUID;
  featuredOnly?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
}

export interface LeadFilterParams {
  stage?: LeadStage[];
  priority?: LeadPriority[];
  assignedToUserId?: UUID;
  propertyId?: UUID;
  search?: string;
  minVal?: number;
  maxVal?: number;
  page?: number;
  pageSize?: number;
}

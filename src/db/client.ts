/**
 * CRM & Real Estate Marketplace Typed Database Client & Data Access Layer
 * Enforces strict tenant isolation on all queries and mutations.
 * 
 * Provides:
 * 1. Session context resolution (getSessionContext)
 * 2. Tenant-scoped database client factory (getTenantDb)
 * 3. Seed data with real-estate properties, commissions, visits, leads & contacts
 * 4. Compatible with Supabase PostgreSQL & RLS policies
 */

import crypto from 'node:crypto';
import { cookies, headers } from 'next/headers';
import type {
  UUID,
  TenantContext,
  Contact,
  Lead,
  LeadWithContact,
  PaginatedResult,
  LeadFilterParams,
  LeadStage,
  Property,
  PropertyMedia,
  PropertyWithMedia,
  PropertyFilterParams,
  PropertyStatus,
  Commission,
  CommissionWithDetails,
  CommissionStatus,
  PropertyVisit,
  VisitStatus,
  LegalDocument,
  LegalDocumentType,
  BrokerageAgreement,
  ExclusivityType,
  CaptadorPropertyStat,
  PropertyReservation,
} from '@/types/crm';
import type {
  CreateContactInput,
  CreateLeadInput,
  CreatePropertyInput,
  PublicInquiryInput,
  BookVisitInput,
  CreateCommissionInput,
} from '@/lib/validations/crm';

// Default Demo Tenant IDs
export const DEFAULT_TENANT_ID: UUID = '00000000-0000-0000-0000-000000000001';
export const DEFAULT_USER_ID: UUID = '00000000-0000-0000-0000-000000000010'; // Carlos Director (Owner)
export const AGENT_USER_ID: UUID = '00000000-0000-0000-0000-000000000011'; // Lucía Agente
export const CAPTADOR_USER_ID: UUID = '00000000-0000-0000-0000-000000000012'; // Juan Afiliado / Propietario

export const SECONDARY_TENANT_ID: UUID = '00000000-0000-0000-0000-000000000002';

// ----------------------------------------------------------------------------
// Internal Database State (Persistent in globalThis across dev hot-reloads)
// ----------------------------------------------------------------------------
interface DatabaseStore {
  contacts: Map<UUID, Contact>;
  leads: Map<UUID, Lead>;
  properties: Map<UUID, Property>;
  propertyMedia: Map<UUID, PropertyMedia>;
  commissions: Map<UUID, Commission>;
  visits: Map<UUID, PropertyVisit>;
  legalDocuments: Map<UUID, LegalDocument>;
  agreements: Map<UUID, BrokerageAgreement>;
  reservations: Map<UUID, PropertyReservation>;
}

declare global {
  // eslint-disable-next-line no-var
  var __CRM_DATABASE__: DatabaseStore | undefined;
}

function initializeDatabase(): DatabaseStore {
  if (globalThis.__CRM_DATABASE__) {
    return globalThis.__CRM_DATABASE__;
  }

  const contacts = new Map<UUID, Contact>();
  const leads = new Map<UUID, Lead>();
  const properties = new Map<UUID, Property>();
  const propertyMedia = new Map<UUID, PropertyMedia>();
  const commissions = new Map<UUID, Commission>();
  const visits = new Map<UUID, PropertyVisit>();
  const legalDocuments = new Map<UUID, LegalDocument>();
  const agreements = new Map<UUID, BrokerageAgreement>();
  const reservations = new Map<UUID, PropertyReservation>();

  // --------------------------------------------------------------------------
  // Seed Contacts
  // --------------------------------------------------------------------------
  const contact1: Contact = {
    id: '00000000-0000-0000-0000-000000000101',
    tenantId: DEFAULT_TENANT_ID,
    firstName: 'Roberto',
    lastName: 'Mendoza',
    email: 'roberto.m@inversiones.com',
    phone: '+52 55 1234 5678',
    company: 'Inversiones Capital',
    jobTitle: 'Director de Expansión',
    notes: 'Interesado en terrenos comerciales y residenciales',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  };

  const contact2: Contact = {
    id: '00000000-0000-0000-0000-000000000102',
    tenantId: DEFAULT_TENANT_ID,
    firstName: 'Mariana',
    lastName: 'García',
    email: 'mariana.garcia@tech.mx',
    phone: '+52 55 8765 4321',
    company: 'Tech Soluciones',
    jobTitle: 'COO',
    notes: 'Busca casa o departamento en renta/venta zona poniente',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  };

  contacts.set(contact1.id, contact1);
  contacts.set(contact2.id, contact2);

  // --------------------------------------------------------------------------
  // Seed Properties (Terrenos y Casas con fotos reales de arquitectura/paisaje)
  // --------------------------------------------------------------------------
  const prop1Id = '00000000-0000-0000-0000-000000000301';
  const prop1: Property = {
    id: prop1Id,
    tenantId: DEFAULT_TENANT_ID,
    title: 'Terreno Campestre Residencial Los Encinos',
    slug: 'terreno-campestre-residencial-los-encinos',
    description: 'Hermoso lote campestre de 600m² con vista panorámica a la montaña. Totalmente plano, con servicios subterráneos (agua, luz, fibra óptica) a pie de lote. Escrituración inmediata.',
    propertyType: 'TERRENO',
    operationType: 'VENTA',
    price: 850000,
    currency: 'MXN',
    status: 'APPROVED',
    address: 'Av. De los Robles Lote 14, Fracc. Los Encinos',
    city: 'Querétaro',
    state: 'Querétaro',
    neighborhood: 'Los Encinos',
    postalCode: '76240',
    landArea: 600,
    constructionArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    features: ['Vista panorámica', 'Servicios subterráneos', 'Seguridad 24/7', 'Escritura pública', 'Acceso controlado'],
    captadorUserId: CAPTADOR_USER_ID,
    assignedAgentId: AGENT_USER_ID,
    commissionRate: 6.0,
    captadorCommissionPct: 35.0, // El usuario captador gana el 35% de la comisión total
    featured: true,
    virtualTourUrl: 'https://my.matterport.com/show/?m=2L6eWqV9X4k&play=1',
    reservationDeposit: 15000,
    floorPlans: [
      {
        id: 'fp-lot-14',
        title: 'Levantamiento Topográfico y Deslinde Lote 14',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        level: 'Polígono General (600 m²)',
        area: 600,
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  };

  const prop2Id = '00000000-0000-0000-0000-000000000302';
  const prop2: Property = {
    id: prop2Id,
    tenantId: DEFAULT_TENANT_ID,
    title: 'Residencia Moderna con Alberca y Roof Garden',
    slug: 'residencia-moderna-alberca-roof-garden',
    description: 'Casa de autor con acabados en mármol y carpintería de parota. 3 recámaras todas con baño y vestidor, alberca climatizada, cocina con isla y roof garden con asador.',
    propertyType: 'CASA',
    operationType: 'VENTA',
    price: 4850000,
    currency: 'MXN',
    status: 'APPROVED',
    address: 'Paseo de las Lomas 402',
    city: 'Mérida',
    state: 'Yucatán',
    neighborhood: 'Altabrisa',
    postalCode: '97130',
    landArea: 320,
    constructionArea: 285,
    bedrooms: 3,
    bathrooms: 3.5,
    parkingSpaces: 2,
    features: ['Alberca privada', 'Roof garden', 'Cocina equipada', 'Mármol', 'Paneles solares'],
    captadorUserId: CAPTADOR_USER_ID,
    assignedAgentId: AGENT_USER_ID,
    commissionRate: 5.0,
    captadorCommissionPct: 30.0,
    featured: true,
    virtualTourUrl: 'https://my.matterport.com/show/?m=JGPnGQ6hosj&play=1&brand=0&mls=1',
    reservationDeposit: 35000,
    floorPlans: [
      {
        id: 'fp-pb-merida',
        title: 'Planta Baja: Área Social, Cocina & Alberca',
        url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        level: 'Nivel 1 (145 m²)',
        area: 145,
      },
      {
        id: 'fp-pa-merida',
        title: 'Planta Alta: Master Suite & Recámaras',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        level: 'Nivel 2 (140 m²)',
        area: 140,
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  };

  const prop3Id = '00000000-0000-0000-0000-000000000303';
  const prop3: Property = {
    id: prop3Id,
    tenantId: DEFAULT_TENANT_ID,
    title: 'Departamento Amueblado con Terraza en Renta',
    slug: 'departamento-amueblado-terraza-renta',
    description: 'Increíble departamento en piso 8 con vista a la ciudad. 2 habitaciones, amueblado con diseño contemporáneo, amenidades tipo resort: gimnasio, coworking y alberca.',
    propertyType: 'DEPARTAMENTO',
    operationType: 'RENTA',
    price: 24000,
    currency: 'MXN',
    status: 'APPROVED',
    address: 'Calzada del Valle 120, Torre Sol',
    city: 'San Pedro Garza García',
    state: 'Nuevo León',
    neighborhood: 'Del Valle',
    postalCode: '66220',
    landArea: 110,
    constructionArea: 110,
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 2,
    features: ['Amueblado', 'Gimnasio', 'Coworking', 'Seguridad 24/7', 'Elevador'],
    captadorUserId: null,
    assignedAgentId: AGENT_USER_ID,
    commissionRate: 100.0, // 1 mes de renta
    captadorCommissionPct: 30.0,
    featured: true,
    virtualTourUrl: 'https://my.matterport.com/show/?m=zE25gH71D7u&play=1',
    reservationDeposit: 12000,
    floorPlans: [
      {
        id: 'fp-dep-sp',
        title: 'Distribución Arquitectónica Piso 8',
        url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
        level: 'Piso 8 (110 m²)',
        area: 110,
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  };

  const prop4Id = '00000000-0000-0000-0000-000000000304';
  const prop4: Property = {
    id: prop4Id,
    tenantId: DEFAULT_TENANT_ID,
    title: 'Macro Lote Industrial / Comercial en Venta',
    slug: 'macro-lote-industrial-comercial-en-venta',
    description: 'Excelente terreno plano con uso de suelo mixto de 5,000 m². Ubicado sobre corredor logístico de alto tránsito con factibilidad de espuela de tren y gas natural.',
    propertyType: 'TERRENO',
    operationType: 'VENTA',
    price: 18500000,
    currency: 'MXN',
    status: 'PENDING_REVIEW', // Pendiente de revisión por el gestor de ventas
    address: 'Carretera Estatal Km 18.5',
    city: 'León',
    state: 'Guanajuato',
    neighborhood: 'Parque Industrial Sur',
    postalCode: '37500',
    landArea: 5000,
    constructionArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    features: ['Uso de suelo mixto', 'Alta tensión', 'Acceso para trailers', 'Factibilidad de agua'],
    captadorUserId: CAPTADOR_USER_ID,
    assignedAgentId: null,
    commissionRate: 4.0,
    captadorCommissionPct: 25.0,
    featured: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  };

  properties.set(prop1.id, prop1);
  properties.set(prop2.id, prop2);
  properties.set(prop3.id, prop3);
  properties.set(prop4.id, prop4);

  // Property Media
  const mediaItems: PropertyMedia[] = [
    {
      id: crypto.randomUUID(),
      propertyId: prop1Id,
      tenantId: DEFAULT_TENANT_ID,
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      type: 'IMAGE',
      isCover: true,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      propertyId: prop1Id,
      tenantId: DEFAULT_TENANT_ID,
      url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
      type: 'IMAGE',
      isCover: false,
      orderIndex: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      propertyId: prop2Id,
      tenantId: DEFAULT_TENANT_ID,
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      type: 'IMAGE',
      isCover: true,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      propertyId: prop2Id,
      tenantId: DEFAULT_TENANT_ID,
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      type: 'IMAGE',
      isCover: false,
      orderIndex: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      propertyId: prop3Id,
      tenantId: DEFAULT_TENANT_ID,
      url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      type: 'IMAGE',
      isCover: true,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      propertyId: prop4Id,
      tenantId: DEFAULT_TENANT_ID,
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      type: 'IMAGE',
      isCover: true,
      orderIndex: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const media of mediaItems) {
    propertyMedia.set(media.id, media);
  }

  // --------------------------------------------------------------------------
  // Seed Leads
  // --------------------------------------------------------------------------
  const lead1: Lead = {
    id: '00000000-0000-0000-0000-000000000501',
    tenantId: DEFAULT_TENANT_ID,
    contactId: contact1.id,
    propertyId: prop1Id,
    title: 'Interés en Terreno Campestre Lote 14',
    value: 850000,
    currency: 'MXN',
    stage: 'QUALIFIED',
    priority: 'HIGH',
    assignedToUserId: AGENT_USER_ID,
    source: 'WhatsApp Web',
    expectedCloseDate: new Date(Date.now() + 86400000 * 20).toISOString(),
    lossReason: null,
    notes: 'Preguntó por facilidad de pago en enganche y financiamiento directo',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  };

  const lead2: Lead = {
    id: '00000000-0000-0000-0000-000000000502',
    tenantId: DEFAULT_TENANT_ID,
    contactId: contact2.id,
    propertyId: prop2Id,
    title: 'Visita Residencia Moderna Mérida',
    value: 4850000,
    currency: 'MXN',
    stage: 'NEGOTIATION',
    priority: 'URGENT',
    assignedToUserId: AGENT_USER_ID,
    source: 'Formulario Web',
    expectedCloseDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    lossReason: null,
    notes: 'Oferta verbal presentada. Se está redactando el contrato de promesa de compraventa.',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  };

  leads.set(lead1.id, lead1);
  leads.set(lead2.id, lead2);

  // --------------------------------------------------------------------------
  // Seed Commissions (Comisión de ejemplo cerrada/aprobada)
  // --------------------------------------------------------------------------
  const comm1: Commission = {
    id: '00000000-0000-0000-0000-000000000701',
    tenantId: DEFAULT_TENANT_ID,
    propertyId: prop2Id,
    leadId: lead2.id,
    dealValue: 4850000,
    currency: 'MXN',
    totalCommissionAmount: 242500, // 5% de 4,850,000
    captadorUserId: CAPTADOR_USER_ID,
    captadorAmount: 72750, // 30% para el captador
    captadorStatus: 'APPROVED',
    agentUserId: AGENT_USER_ID,
    agentAmount: 97000, // 40% para el asesor vendedor
    agentStatus: 'APPROVED',
    paidAt: null,
    notes: 'Trato cerrado pendiente de firma notarial para dispersión de comisión',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  };

  commissions.set(comm1.id, comm1);

  // --------------------------------------------------------------------------
  // Seed Visits
  // --------------------------------------------------------------------------
  const visit1: PropertyVisit = {
    id: '00000000-0000-0000-0000-000000000801',
    tenantId: DEFAULT_TENANT_ID,
    propertyId: prop2Id,
    contactId: contact2.id,
    leadId: lead2.id,
    assignedAgentId: AGENT_USER_ID,
    visitorName: 'Mariana García',
    visitorPhone: '+52 55 8765 4321',
    visitorEmail: 'mariana.garcia@tech.mx',
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'CONFIRMED',
    notes: 'Cliente asistirá con su arquitecto para revisar acabados',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  visits.set(visit1.id, visit1);

  // --------------------------------------------------------------------------
  // Seed Agreements (Convenios Digitales de Comisión Protegida)
  // --------------------------------------------------------------------------
  const agree1: BrokerageAgreement = {
    id: crypto.randomUUID(),
    folio: 'MET-2026-T89K1',
    propertyId: prop1Id,
    tenantId: DEFAULT_TENANT_ID,
    captadorUserId: CAPTADOR_USER_ID,
    exclusivityType: 'EXCLUSIVE',
    commissionRate: 6.0,
    captadorCommissionPct: 35.0,
    signerName: 'Juan Afiliado',
    signerEmail: 'afiliado@metropolis.com',
    signerIp: '189.203.45.12',
    signedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    termsAccepted: true,
  };

  const agree2: BrokerageAgreement = {
    id: crypto.randomUUID(),
    folio: 'MET-2026-R44B7',
    propertyId: prop2Id,
    tenantId: DEFAULT_TENANT_ID,
    captadorUserId: CAPTADOR_USER_ID,
    exclusivityType: 'NON_EXCLUSIVE',
    commissionRate: 5.0,
    captadorCommissionPct: 30.0,
    signerName: 'Juan Afiliado',
    signerEmail: 'afiliado@metropolis.com',
    signerIp: '189.203.45.12',
    signedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    termsAccepted: true,
  };

  agreements.set(agree1.id, agree1);
  agreements.set(agree2.id, agree2);

  // --------------------------------------------------------------------------
  // Seed Legal Documents
  // --------------------------------------------------------------------------
  const doc1: LegalDocument = {
    id: crypto.randomUUID(),
    propertyId: prop1Id,
    tenantId: DEFAULT_TENANT_ID,
    type: 'DEED',
    url: 'https://cxzkbzchjtonqabjzjge.supabase.co/storage/v1/object/public/legal-documents/escritura-lote-14.pdf',
    fileName: 'Escritura_Publica_Lote14_Encinos.pdf',
    verified: true,
    verifiedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
  };

  const doc2: LegalDocument = {
    id: crypto.randomUUID(),
    propertyId: prop1Id,
    tenantId: DEFAULT_TENANT_ID,
    type: 'TAX_RECEIPT',
    url: 'https://cxzkbzchjtonqabjzjge.supabase.co/storage/v1/object/public/legal-documents/predial-2026.pdf',
    fileName: 'Boleta_Predial_2026_Vigente.pdf',
    verified: true,
    verifiedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
  };

  legalDocuments.set(doc1.id, doc1);
  legalDocuments.set(doc2.id, doc2);

  const store: DatabaseStore = {
    contacts,
    leads,
    properties,
    propertyMedia,
    commissions,
    visits,
    legalDocuments,
    agreements,
    reservations,
  };
  globalThis.__CRM_DATABASE__ = store;
  return store;
}

const dbStore = initializeDatabase();

// ----------------------------------------------------------------------------
// Session Resolution
// ----------------------------------------------------------------------------
export async function getSessionContext(): Promise<TenantContext> {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();

    const tenantId = (
      headerStore.get('x-tenant-id') ||
      cookieStore.get('tenant_id')?.value ||
      DEFAULT_TENANT_ID
    ).trim();

    const userId = (
      headerStore.get('x-user-id') ||
      cookieStore.get('user_id')?.value ||
      DEFAULT_USER_ID
    ).trim();

    const roleHeader = headerStore.get('x-user-role') || cookieStore.get('user_role')?.value;
    const userRole: TenantContext['userRole'] =
      roleHeader === 'owner' ||
      roleHeader === 'admin' ||
      roleHeader === 'agent' ||
      roleHeader === 'captador' ||
      roleHeader === 'viewer'
        ? roleHeader
        : 'owner';

    // Asegurar consistencia de userId con el rol seleccionado
    let finalUserId = userId;
    if (userRole === 'captador' && (!finalUserId || finalUserId === DEFAULT_USER_ID)) {
      finalUserId = CAPTADOR_USER_ID;
    } else if (userRole === 'agent' && (!finalUserId || finalUserId === DEFAULT_USER_ID)) {
      finalUserId = AGENT_USER_ID;
    } else if ((userRole === 'owner' || userRole === 'admin') && (!finalUserId || finalUserId === CAPTADOR_USER_ID || finalUserId === AGENT_USER_ID)) {
      finalUserId = DEFAULT_USER_ID;
    }

    return {
      tenantId,
      userId: finalUserId,
      userRole,
    };
  } catch {
    return {
      tenantId: DEFAULT_TENANT_ID,
      userId: DEFAULT_USER_ID,
      userRole: 'owner',
    };
  }
}

// Helper to slugify property title
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

// ----------------------------------------------------------------------------
// Tenant-Scoped Database Client Interface
// ----------------------------------------------------------------------------
export interface TenantDbClient {
  tenantId: UUID;
  contacts: {
    list: () => Promise<Contact[]>;
    findById: (id: UUID) => Promise<Contact | null>;
    findByEmail: (email: string) => Promise<Contact | null>;
    create: (input: CreateContactInput) => Promise<Contact>;
  };
  properties: {
    list: (params?: PropertyFilterParams) => Promise<PaginatedResult<PropertyWithMedia>>;
    findById: (id: UUID) => Promise<PropertyWithMedia | null>;
    findBySlug: (slug: string) => Promise<PropertyWithMedia | null>;
    create: (input: CreatePropertyInput, captadorUserId?: UUID | null) => Promise<PropertyWithMedia>;
    updateStatus: (id: UUID, status: PropertyStatus) => Promise<PropertyWithMedia>;
  };
  leads: {
    list: (params?: LeadFilterParams) => Promise<PaginatedResult<LeadWithContact>>;
    findById: (id: UUID) => Promise<Lead | null>;
    findWithContactById: (id: UUID) => Promise<LeadWithContact | null>;
    create: (input: CreateLeadInput) => Promise<LeadWithContact>;
    createFromPublicInquiry: (input: PublicInquiryInput) => Promise<{ lead: Lead; contact: Contact }>;
    updateStage: (id: UUID, stage: LeadStage, lossReason?: string | null) => Promise<LeadWithContact>;
  };
  commissions: {
    list: () => Promise<CommissionWithDetails[]>;
    findByCaptador: (userId: UUID) => Promise<CommissionWithDetails[]>;
    create: (input: CreateCommissionInput) => Promise<Commission>;
    updateStatus: (id: UUID, target: 'captador' | 'agent', status: CommissionStatus) => Promise<Commission>;
  };
  visits: {
    list: (propertyId?: UUID) => Promise<PropertyVisit[]>;
    create: (input: BookVisitInput) => Promise<PropertyVisit>;
    updateStatus: (id: UUID, status: VisitStatus) => Promise<PropertyVisit>;
  };
  legal: {
    getAgreementByProperty: (propertyId: UUID) => Promise<BrokerageAgreement | null>;
    getAgreementByIdOrFolio: (idOrFolio: string) => Promise<BrokerageAgreement | null>;
    signAgreement: (input: {
      propertyId: UUID;
      captadorUserId: UUID;
      exclusivityType: ExclusivityType;
      signerName: string;
      signerEmail: string;
      signerIp: string;
    }) => Promise<BrokerageAgreement>;
    listDocuments: (propertyId: UUID) => Promise<LegalDocument[]>;
    uploadDocument: (input: {
      propertyId: UUID;
      type: LegalDocumentType;
      url: string;
      fileName: string;
    }) => Promise<LegalDocument>;
    verifyDocument: (documentId: UUID) => Promise<LegalDocument>;
    getCaptadorStats: (captadorUserId: UUID) => Promise<CaptadorPropertyStat[]>;
  };
  reservations: {
    list: (propertyId?: UUID) => Promise<PropertyReservation[]>;
    findById: (id: UUID) => Promise<PropertyReservation | null>;
    findByFolio: (folio: string) => Promise<PropertyReservation | null>;
    create: (input: {
      propertyId: UUID;
      clientName: string;
      clientEmail: string;
      clientPhone: string;
      amount: number;
      paymentMethod: 'STRIPE_CARD' | 'SPEI' | 'SIMULATION';
      stripeSessionId?: string | null;
      stripePaymentIntentId?: string | null;
    }) => Promise<PropertyReservation>;
    updateStatus: (id: UUID, status: 'PENDING' | 'CONFIRMED' | 'REFUNDED' | 'EXPIRED') => Promise<PropertyReservation>;
  };
}

export function getTenantDb(context: TenantContext | UUID): TenantDbClient {
  const tenantId = typeof context === 'string' ? context : context.tenantId;

  if (!tenantId || tenantId.trim() === '') {
    throw new Error('[DB_SECURITY_VIOLATION] Cannot instantiate TenantDb without a valid tenant_id');
  }

  function getMediaForProperty(propertyId: UUID): PropertyMedia[] {
    const list: PropertyMedia[] = [];
    for (const media of dbStore.propertyMedia.values()) {
      if (media.propertyId === propertyId && media.tenantId === tenantId) {
        list.push({ ...media });
      }
    }
    return list.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  return {
    tenantId,

    contacts: {
      async list(): Promise<Contact[]> {
        const results: Contact[] = [];
        for (const contact of dbStore.contacts.values()) {
          if (contact.tenantId === tenantId) {
            results.push({ ...contact });
          }
        }
        return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      async findById(id: UUID): Promise<Contact | null> {
        const contact = dbStore.contacts.get(id);
        if (!contact || contact.tenantId !== tenantId) return null;
        return { ...contact };
      },

      async findByEmail(email: string): Promise<Contact | null> {
        const normalized = email.trim().toLowerCase();
        for (const contact of dbStore.contacts.values()) {
          if (contact.tenantId === tenantId && contact.email.toLowerCase() === normalized) {
            return { ...contact };
          }
        }
        return null;
      },

      async create(input: CreateContactInput): Promise<Contact> {
        const normalizedEmail = input.email.trim().toLowerCase();
        for (const existing of dbStore.contacts.values()) {
          if (existing.tenantId === tenantId && existing.email.toLowerCase() === normalizedEmail) {
            return { ...existing };
          }
        }

        const now = new Date().toISOString();
        const contact: Contact = {
          id: crypto.randomUUID(),
          tenantId,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: normalizedEmail,
          phone: input.phone?.trim() || null,
          company: input.company?.trim() || null,
          jobTitle: input.jobTitle?.trim() || null,
          notes: input.notes?.trim() || null,
          createdAt: now,
          updatedAt: now,
        };

        dbStore.contacts.set(contact.id, contact);
        return { ...contact };
      },
    },

    properties: {
      async list(params?: PropertyFilterParams): Promise<PaginatedResult<PropertyWithMedia>> {
        const {
          operationType,
          propertyType,
          city,
          minPrice,
          maxPrice,
          minLandArea,
          bedrooms,
          status,
          captadorUserId,
          featuredOnly,
          search,
          page = 1,
          pageSize = 12,
        } = params || {};

        const matched: PropertyWithMedia[] = [];
        const searchNormalized = search?.toLowerCase().trim();

        for (const prop of dbStore.properties.values()) {
          if (prop.tenantId !== tenantId) continue;

          // Status filter: default to showing all if status filter is empty or matches
          if (status) {
            if (Array.isArray(status)) {
              if (!status.includes(prop.status)) continue;
            } else if (prop.status !== status) {
              continue;
            }
          }

          if (operationType && prop.operationType !== operationType) continue;
          if (propertyType && prop.propertyType !== propertyType) continue;
          if (city && !prop.city.toLowerCase().includes(city.toLowerCase())) continue;
          if (minPrice !== undefined && prop.price < minPrice) continue;
          if (maxPrice !== undefined && prop.price > maxPrice) continue;
          if (minLandArea !== undefined && (prop.landArea || 0) < minLandArea) continue;
          if (bedrooms !== undefined && prop.bedrooms < bedrooms) continue;
          if (captadorUserId && prop.captadorUserId !== captadorUserId) continue;
          if (featuredOnly && !prop.featured) continue;

          if (searchNormalized) {
            const matchesText =
              prop.title.toLowerCase().includes(searchNormalized) ||
              prop.description.toLowerCase().includes(searchNormalized) ||
              prop.city.toLowerCase().includes(searchNormalized) ||
              (prop.neighborhood && prop.neighborhood.toLowerCase().includes(searchNormalized));
            if (!matchesText) continue;
          }

          matched.push({
            ...prop,
            media: getMediaForProperty(prop.id),
          });
        }

        matched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = matched.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const safePage = Math.min(Math.max(1, page), totalPages);
        const startIndex = (safePage - 1) * pageSize;
        const paginatedData = matched.slice(startIndex, startIndex + pageSize);

        return {
          data: paginatedData,
          total,
          page: safePage,
          pageSize,
          totalPages,
        };
      },

      async findById(id: UUID): Promise<PropertyWithMedia | null> {
        const prop = dbStore.properties.get(id);
        if (!prop || prop.tenantId !== tenantId) return null;
        return {
          ...prop,
          media: getMediaForProperty(prop.id),
        };
      },

      async findBySlug(slug: string): Promise<PropertyWithMedia | null> {
        for (const prop of dbStore.properties.values()) {
          if (prop.tenantId === tenantId && prop.slug === slug) {
            return {
              ...prop,
              media: getMediaForProperty(prop.id),
            };
          }
        }
        return null;
      },

      async create(input: CreatePropertyInput, captadorUserId?: UUID | null): Promise<PropertyWithMedia> {
        const now = new Date().toISOString();
        const baseSlug = slugify(input.title);
        const slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

        const property: Property = {
          id: crypto.randomUUID(),
          tenantId,
          title: input.title.trim(),
          slug,
          description: input.description.trim(),
          propertyType: input.propertyType,
          operationType: input.operationType,
          price: input.price,
          currency: input.currency || 'MXN',
          status: input.status || 'PENDING_REVIEW', // Inicia en revisión
          address: input.address?.trim() || null,
          city: input.city.trim(),
          state: input.state.trim(),
          neighborhood: input.neighborhood?.trim() || null,
          postalCode: input.postalCode?.trim() || null,
          landArea: input.landArea || null,
          constructionArea: input.constructionArea || null,
          bedrooms: input.bedrooms ?? 0,
          bathrooms: input.bathrooms ?? 0,
          parkingSpaces: input.parkingSpaces ?? 0,
          features: input.features || [],
          captadorUserId: captadorUserId || input.captadorUserId || null,
          assignedAgentId: input.assignedAgentId || null,
          commissionRate: input.commissionRate ?? 5.0,
          captadorCommissionPct: input.captadorCommissionPct ?? 30.0,
          featured: input.featured ?? false,
          virtualTourUrl: input.virtualTourUrl || null,
          floorPlans: input.floorPlans || [],
          reservationDeposit: input.reservationDeposit || null,
          createdAt: now,
          updatedAt: now,
        };

        dbStore.properties.set(property.id, property);

        // Store media
        const storedMedia: PropertyMedia[] = [];
        if (input.images && input.images.length > 0) {
          input.images.forEach((url, idx) => {
            const mediaItem: PropertyMedia = {
              id: crypto.randomUUID(),
              propertyId: property.id,
              tenantId,
              url,
              type: 'IMAGE',
              isCover: idx === 0,
              orderIndex: idx,
              createdAt: now,
            };
            dbStore.propertyMedia.set(mediaItem.id, mediaItem);
            storedMedia.push(mediaItem);
          });
        }

        return {
          ...property,
          media: storedMedia,
        };
      },

      async updateStatus(id: UUID, status: PropertyStatus): Promise<PropertyWithMedia> {
        const prop = dbStore.properties.get(id);
        if (!prop || prop.tenantId !== tenantId) {
          throw new Error('Propiedad no encontrada o no autorizada.');
        }

        const updated: Property = {
          ...prop,
          status,
          updatedAt: new Date().toISOString(),
        };

        dbStore.properties.set(id, updated);
        return {
          ...updated,
          media: getMediaForProperty(id),
        };
      },
    },

    leads: {
      async list(params?: LeadFilterParams): Promise<PaginatedResult<LeadWithContact>> {
        const {
          stage,
          priority,
          assignedToUserId,
          propertyId,
          search,
          minVal,
          maxVal,
          page = 1,
          pageSize = 20,
        } = params || {};

        const matched: LeadWithContact[] = [];
        const searchNormalized = search?.toLowerCase().trim();

        for (const lead of dbStore.leads.values()) {
          if (lead.tenantId !== tenantId) continue;

          const contact = dbStore.contacts.get(lead.contactId);
          if (!contact || contact.tenantId !== tenantId) continue;

          if (stage && stage.length > 0 && !stage.includes(lead.stage)) continue;
          if (priority && priority.length > 0 && !priority.includes(lead.priority)) continue;
          if (assignedToUserId && lead.assignedToUserId !== assignedToUserId) continue;
          if (propertyId && lead.propertyId !== propertyId) continue;
          if (minVal !== undefined && lead.value < minVal) continue;
          if (maxVal !== undefined && lead.value > maxVal) continue;

          if (searchNormalized) {
            const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
            const titleMatch = lead.title.toLowerCase().includes(searchNormalized);
            const nameMatch = fullName.includes(searchNormalized);
            const emailMatch = contact.email.toLowerCase().includes(searchNormalized);
            if (!titleMatch && !nameMatch && !emailMatch) continue;
          }

          let propObj: Property | null = null;
          if (lead.propertyId) {
            propObj = dbStore.properties.get(lead.propertyId) || null;
          }

          matched.push({
            ...lead,
            contact: { ...contact },
            property: propObj ? { ...propObj } : null,
          });
        }

        matched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = matched.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const safePage = Math.min(Math.max(1, page), totalPages);
        const startIndex = (safePage - 1) * pageSize;
        const paginatedData = matched.slice(startIndex, startIndex + pageSize);

        return {
          data: paginatedData,
          total,
          page: safePage,
          pageSize,
          totalPages,
        };
      },

      async findById(id: UUID): Promise<Lead | null> {
        const lead = dbStore.leads.get(id);
        if (!lead || lead.tenantId !== tenantId) return null;
        return { ...lead };
      },

      async findWithContactById(id: UUID): Promise<LeadWithContact | null> {
        const lead = dbStore.leads.get(id);
        if (!lead || lead.tenantId !== tenantId) return null;

        const contact = dbStore.contacts.get(lead.contactId);
        if (!contact || contact.tenantId !== tenantId) {
          throw new Error('[INTEGRITY_VIOLATION] Contacto asociado al prospecto no pertenece al inquilino');
        }

        const prop = lead.propertyId ? dbStore.properties.get(lead.propertyId) : null;

        return {
          ...lead,
          contact: { ...contact },
          property: prop ? { ...prop } : null,
        };
      },

      async create(input: CreateLeadInput): Promise<LeadWithContact> {
        const contact = dbStore.contacts.get(input.contactId);
        if (!contact || contact.tenantId !== tenantId) {
          throw new Error('El contacto especificado no pertenece a su organización o no existe.');
        }

        const now = new Date().toISOString();
        const lead: Lead = {
          id: crypto.randomUUID(),
          tenantId,
          contactId: input.contactId,
          propertyId: input.propertyId || null,
          title: input.title.trim(),
          value: input.value ?? 0,
          currency: (input.currency || 'MXN').toUpperCase().trim(),
          stage: input.stage || 'NEW',
          priority: input.priority || 'MEDIUM',
          assignedToUserId: input.assignedToUserId || null,
          source: input.source?.trim() || 'Portal Web',
          expectedCloseDate: input.expectedCloseDate || null,
          lossReason: null,
          notes: input.notes?.trim() || null,
          createdAt: now,
          updatedAt: now,
        };

        dbStore.leads.set(lead.id, lead);

        return {
          ...lead,
          contact: { ...contact },
        };
      },

      async createFromPublicInquiry(input: PublicInquiryInput): Promise<{ lead: Lead; contact: Contact }> {
        const prop = dbStore.properties.get(input.propertyId);
        if (!prop || prop.tenantId !== tenantId) {
          throw new Error('La propiedad no existe o no está disponible.');
        }

        // Split name into first and last name
        const parts = input.name.trim().split(' ');
        const firstName = parts[0] || 'Interesado';
        const lastName = parts.slice(1).join(' ') || 'Web';
        const email = input.email?.trim() || `${input.phone.replace(/\D/g, '')}@lead-inmobiliario.com`;

        // Find or create contact
        let contact: Contact | undefined;
        for (const existing of dbStore.contacts.values()) {
          if (existing.tenantId === tenantId && (existing.phone === input.phone || existing.email === email)) {
            contact = existing;
            break;
          }
        }

        const now = new Date().toISOString();
        if (!contact) {
          contact = {
            id: crypto.randomUUID(),
            tenantId,
            firstName,
            lastName,
            email,
            phone: input.phone,
            company: null,
            jobTitle: null,
            notes: `Capturado desde portal web para propiedad: ${prop.title}`,
            createdAt: now,
            updatedAt: now,
          };
          dbStore.contacts.set(contact.id, contact);
        }

        const channelLabel = input.channel === 'WHATSAPP' ? 'WhatsApp Directo' : 'Formulario Propiedad';
        const lead: Lead = {
          id: crypto.randomUUID(),
          tenantId,
          contactId: contact.id,
          propertyId: prop.id,
          title: `Interés: ${prop.title}`,
          value: prop.price,
          currency: prop.currency,
          stage: 'NEW',
          priority: 'HIGH',
          assignedToUserId: prop.assignedAgentId || null,
          source: channelLabel,
          expectedCloseDate: new Date(Date.now() + 86400000 * 30).toISOString(),
          lossReason: null,
          notes: input.message ? `Mensaje del cliente: "${input.message}"` : 'Inició contacto solicitando informes.',
          createdAt: now,
          updatedAt: now,
        };

        dbStore.leads.set(lead.id, lead);

        return { lead, contact };
      },

      async updateStage(id: UUID, stage: LeadStage, lossReason?: string | null): Promise<LeadWithContact> {
        const lead = dbStore.leads.get(id);
        if (!lead || lead.tenantId !== tenantId) {
          throw new Error('Prospecto no encontrado o no autorizado.');
        }

        const contact = dbStore.contacts.get(lead.contactId);
        if (!contact || contact.tenantId !== tenantId) {
          throw new Error('Contacto asociado no encontrado.');
        }

        const updatedLead: Lead = {
          ...lead,
          stage,
          lossReason: stage === 'LOST' ? lossReason?.trim() || lead.lossReason : null,
          updatedAt: new Date().toISOString(),
        };

        dbStore.leads.set(id, updatedLead);

        return {
          ...updatedLead,
          contact: { ...contact },
        };
      },
    },

    commissions: {
      async list(): Promise<CommissionWithDetails[]> {
        const results: CommissionWithDetails[] = [];
        for (const comm of dbStore.commissions.values()) {
          if (comm.tenantId !== tenantId) continue;
          const prop = dbStore.properties.get(comm.propertyId);

          results.push({
            ...comm,
            propertyTitle: prop?.title || 'Propiedad no disponible',
            captadorName: comm.captadorUserId === CAPTADOR_USER_ID ? 'Juan Afiliado (Captador)' : 'Propietario / Afiliado',
            agentName: comm.agentUserId === AGENT_USER_ID ? 'Lucía Agente (Ventas)' : 'Asesor Comercial',
          });
        }
        return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      async findByCaptador(userId: UUID): Promise<CommissionWithDetails[]> {
        const results: CommissionWithDetails[] = [];
        for (const comm of dbStore.commissions.values()) {
          if (comm.tenantId === tenantId && comm.captadorUserId === userId) {
            const prop = dbStore.properties.get(comm.propertyId);
            results.push({
              ...comm,
              propertyTitle: prop?.title || 'Propiedad',
              captadorName: 'Tú',
              agentName: 'Asesor Comercial',
            });
          }
        }
        return results;
      },

      async create(input: CreateCommissionInput): Promise<Commission> {
        const now = new Date().toISOString();
        const commission: Commission = {
          id: crypto.randomUUID(),
          tenantId,
          propertyId: input.propertyId,
          leadId: input.leadId || null,
          dealValue: input.dealValue,
          currency: input.currency || 'MXN',
          totalCommissionAmount: input.totalCommissionAmount,
          captadorUserId: input.captadorUserId || null,
          captadorAmount: input.captadorAmount ?? 0,
          captadorStatus: 'PENDING',
          agentUserId: input.agentUserId || null,
          agentAmount: input.agentAmount ?? 0,
          agentStatus: 'PENDING',
          paidAt: null,
          notes: input.notes || null,
          createdAt: now,
          updatedAt: now,
        };

        dbStore.commissions.set(commission.id, commission);
        return { ...commission };
      },

      async updateStatus(id: UUID, target: 'captador' | 'agent', status: CommissionStatus): Promise<Commission> {
        const comm = dbStore.commissions.get(id);
        if (!comm || comm.tenantId !== tenantId) {
          throw new Error('Registro de comisión no encontrado.');
        }

        const updated: Commission = {
          ...comm,
          captadorStatus: target === 'captador' ? status : comm.captadorStatus,
          agentStatus: target === 'agent' ? status : comm.agentStatus,
          paidAt: status === 'PAID' ? new Date().toISOString() : comm.paidAt,
          updatedAt: new Date().toISOString(),
        };

        dbStore.commissions.set(id, updated);
        return { ...updated };
      },
    },

    visits: {
      async list(propertyId?: UUID): Promise<PropertyVisit[]> {
        const results: PropertyVisit[] = [];
        for (const visit of dbStore.visits.values()) {
          if (visit.tenantId !== tenantId) continue;
          if (propertyId && visit.propertyId !== propertyId) continue;
          results.push({ ...visit });
        }
        return results.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      },

      async create(input: BookVisitInput): Promise<PropertyVisit> {
        const prop = dbStore.properties.get(input.propertyId);
        if (!prop || prop.tenantId !== tenantId) {
          throw new Error('La propiedad no existe o no está disponible.');
        }

        const now = new Date().toISOString();
        const visit: PropertyVisit = {
          id: crypto.randomUUID(),
          tenantId,
          propertyId: input.propertyId,
          assignedAgentId: prop.assignedAgentId || null,
          visitorName: input.visitorName.trim(),
          visitorPhone: input.visitorPhone.trim(),
          visitorEmail: input.visitorEmail?.trim() || null,
          scheduledAt: input.scheduledAt,
          status: 'SCHEDULED',
          notes: input.notes?.trim() || null,
          createdAt: now,
          updatedAt: now,
        };

        dbStore.visits.set(visit.id, visit);

        // Also create or link a Lead automatically in the CRM!
        const inquiryData: PublicInquiryInput = {
          propertyId: input.propertyId,
          name: input.visitorName,
          phone: input.visitorPhone,
          email: input.visitorEmail || undefined,
          message: `Visita programada para el ${new Date(input.scheduledAt).toLocaleString('es-MX')}. ${input.notes || ''}`,
          channel: 'SCHEDULE_VISIT',
        };

        const { lead, contact } = await getTenantDb(tenantId).leads.createFromPublicInquiry(inquiryData);
        visit.contactId = contact.id;
        visit.leadId = lead.id;

        return { ...visit };
      },

      async updateStatus(id: UUID, status: VisitStatus): Promise<PropertyVisit> {
        const visit = dbStore.visits.get(id);
        if (!visit || visit.tenantId !== tenantId) {
          throw new Error('Visita no encontrada.');
        }

        const updated: PropertyVisit = {
          ...visit,
          status,
          updatedAt: new Date().toISOString(),
        };

        dbStore.visits.set(id, updated);
        return { ...updated };
      },
    },

    legal: {
      async getAgreementByProperty(propertyId: UUID): Promise<BrokerageAgreement | null> {
        for (const agree of dbStore.agreements.values()) {
          if (agree.propertyId === propertyId && agree.tenantId === tenantId) {
            return { ...agree };
          }
        }
        return null;
      },

      async getAgreementByIdOrFolio(idOrFolio: string): Promise<BrokerageAgreement | null> {
        for (const agree of dbStore.agreements.values()) {
          if (
            (agree.id === idOrFolio || agree.folio === idOrFolio) &&
            agree.tenantId === tenantId
          ) {
            return { ...agree };
          }
        }
        return null;
      },

      async signAgreement(input: {
        propertyId: UUID;
        captadorUserId: UUID;
        exclusivityType: ExclusivityType;
        signerName: string;
        signerEmail: string;
        signerIp: string;
      }): Promise<BrokerageAgreement> {
        const prop = dbStore.properties.get(input.propertyId);
        if (!prop || prop.tenantId !== tenantId) {
          throw new Error('Propiedad no encontrada.');
        }

        // Commission rate & captador share based on exclusivity
        const commissionRate = input.exclusivityType === 'EXCLUSIVE' ? 6.0 : 5.0;
        const captadorCommissionPct = input.exclusivityType === 'EXCLUSIVE' ? 35.0 : 25.0;
        const folioRandom = crypto.randomBytes(3).toString('hex').toUpperCase();
        const folio = `MET-${new Date().getFullYear()}-${folioRandom}`;

        const agreement: BrokerageAgreement = {
          id: crypto.randomUUID(),
          folio,
          propertyId: input.propertyId,
          tenantId,
          captadorUserId: input.captadorUserId,
          exclusivityType: input.exclusivityType,
          commissionRate,
          captadorCommissionPct,
          signerName: input.signerName.trim(),
          signerEmail: input.signerEmail.trim().toLowerCase(),
          signerIp: input.signerIp,
          signedAt: new Date().toISOString(),
          termsAccepted: true,
        };

        dbStore.agreements.set(agreement.id, agreement);

        // Update property with folio and exclusivity rates
        prop.commissionRate = commissionRate;
        prop.captadorCommissionPct = captadorCommissionPct;
        prop.exclusivityType = input.exclusivityType;
        prop.folio = folio;
        dbStore.properties.set(prop.id, prop);

        return { ...agreement };
      },

      async listDocuments(propertyId: UUID): Promise<LegalDocument[]> {
        const results: LegalDocument[] = [];
        for (const doc of dbStore.legalDocuments.values()) {
          if (doc.propertyId === propertyId && doc.tenantId === tenantId) {
            results.push({ ...doc });
          }
        }
        return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      async uploadDocument(input: {
        propertyId: UUID;
        type: LegalDocumentType;
        url: string;
        fileName: string;
      }): Promise<LegalDocument> {
        const doc: LegalDocument = {
          id: crypto.randomUUID(),
          propertyId: input.propertyId,
          tenantId,
          type: input.type,
          url: input.url,
          fileName: input.fileName,
          verified: false,
          verifiedAt: null,
          createdAt: new Date().toISOString(),
        };

        dbStore.legalDocuments.set(doc.id, doc);
        return { ...doc };
      },

      async verifyDocument(documentId: UUID): Promise<LegalDocument> {
        const doc = dbStore.legalDocuments.get(documentId);
        if (!doc || doc.tenantId !== tenantId) {
          throw new Error('Documento no encontrado.');
        }

        const updated: LegalDocument = {
          ...doc,
          verified: true,
          verifiedAt: new Date().toISOString(),
        };

        dbStore.legalDocuments.set(documentId, updated);
        return { ...updated };
      },

      async getCaptadorStats(captadorUserId: UUID): Promise<CaptadorPropertyStat[]> {
        const stats: CaptadorPropertyStat[] = [];

        for (const prop of dbStore.properties.values()) {
          if (prop.tenantId !== tenantId || prop.captadorUserId !== captadorUserId) {
            continue;
          }

          // Count leads and visits for this property
          let leadsCount = 0;
          let visitsCount = 0;

          for (const lead of dbStore.leads.values()) {
            if (lead.propertyId === prop.id) leadsCount++;
          }

          for (const visit of dbStore.visits.values()) {
            if (visit.propertyId === prop.id) visitsCount++;
          }

          // Find agreement
          let agreement: BrokerageAgreement | null = null;
          for (const ag of dbStore.agreements.values()) {
            if (ag.propertyId === prop.id) {
              agreement = { ...ag };
              break;
            }
          }

          // Find legal documents
          const docs: LegalDocument[] = [];
          for (const doc of dbStore.legalDocuments.values()) {
            if (doc.propertyId === prop.id) {
              docs.push({ ...doc });
            }
          }

          // Simulación de vistas y clics de WhatsApp basada en leads
          const views = Math.max(140, leadsCount * 35 + 85);
          const whatsappClicks = Math.max(leadsCount, Math.floor(views * 0.08));

          stats.push({
            property: {
              ...prop,
              media: getMediaForProperty(prop.id),
            },
            views,
            whatsappClicks,
            visitsCount,
            leadsCount,
            agreement,
            legalDocuments: docs,
          });
        }

        return stats.sort((a, b) => new Date(b.property.createdAt).getTime() - new Date(a.property.createdAt).getTime());
      },
    },

    reservations: {
      async list(propertyId?: UUID): Promise<PropertyReservation[]> {
        const results: PropertyReservation[] = [];
        for (const res of dbStore.reservations.values()) {
          if (res.tenantId !== tenantId) continue;
          if (propertyId && res.propertyId !== propertyId) continue;
          results.push({ ...res });
        }
        return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      async findById(id: UUID): Promise<PropertyReservation | null> {
        const res = dbStore.reservations.get(id);
        if (!res || res.tenantId !== tenantId) return null;
        return { ...res };
      },

      async findByFolio(folio: string): Promise<PropertyReservation | null> {
        for (const res of dbStore.reservations.values()) {
          if (res.tenantId === tenantId && res.folio.toUpperCase() === folio.toUpperCase()) {
            return { ...res };
          }
        }
        return null;
      },

      async create(input: {
        propertyId: UUID;
        clientName: string;
        clientEmail: string;
        clientPhone: string;
        amount: number;
        paymentMethod: 'STRIPE_CARD' | 'SPEI' | 'SIMULATION';
        stripeSessionId?: string | null;
        stripePaymentIntentId?: string | null;
      }): Promise<PropertyReservation> {
        const prop = dbStore.properties.get(input.propertyId);
        if (!prop || prop.tenantId !== tenantId) {
          throw new Error('La propiedad no existe o no pertenece a este tenant.');
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 horas de congelamiento
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const folio = `RES-${now.getFullYear()}-${randomNum}`;

        const reservation: PropertyReservation = {
          id: crypto.randomUUID(),
          tenantId,
          propertyId: input.propertyId,
          propertyTitle: prop.title,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          amount: input.amount,
          currency: prop.currency,
          status: 'CONFIRMED',
          stripeSessionId: input.stripeSessionId || null,
          stripePaymentIntentId: input.stripePaymentIntentId || null,
          paymentMethod: input.paymentMethod,
          expiresAt: expiresAt.toISOString(),
          createdAt: now.toISOString(),
          folio,
        };

        dbStore.reservations.set(reservation.id, reservation);

        // Bloquear temporalmente la propiedad como apartada
        const updatedProp: Property = {
          ...prop,
          isReserved: true,
          reservedUntil: expiresAt.toISOString(),
          reservedBy: input.clientName,
          updatedAt: now.toISOString(),
        };
        dbStore.properties.set(prop.id, updatedProp);

        return { ...reservation };
      },

      async updateStatus(
        id: UUID,
        status: 'PENDING' | 'CONFIRMED' | 'REFUNDED' | 'EXPIRED'
      ): Promise<PropertyReservation> {
        const res = dbStore.reservations.get(id);
        if (!res || res.tenantId !== tenantId) {
          throw new Error('Apartado no encontrado.');
        }

        const updated: PropertyReservation = {
          ...res,
          status,
        };
        dbStore.reservations.set(id, updated);

        // Si se expira o reembolsa, liberar la propiedad
        if (status === 'REFUNDED' || status === 'EXPIRED') {
          const prop = dbStore.properties.get(res.propertyId);
          if (prop) {
            dbStore.properties.set(prop.id, {
              ...prop,
              isReserved: false,
              reservedUntil: null,
              reservedBy: null,
              updatedAt: new Date().toISOString(),
            });
          }
        }

        return { ...updated };
      },
    },
  };
}

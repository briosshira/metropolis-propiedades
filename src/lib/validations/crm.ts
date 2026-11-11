/**
 * Zod Schemas for CRM Leads, Contacts, Properties, Commissions & Visits
 * Enforces multi-tenant input sanitization & strict runtime validation
 */

import { z } from 'zod';

export const leadStageEnum = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
]);

export const leadPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const propertyTypeEnum = z.enum([
  'TERRENO',
  'CASA',
  'DEPARTAMENTO',
  'LOCAL_COMERCIAL',
  'BODEGA',
  'OFICINA',
]);

export const operationTypeEnum = z.enum(['VENTA', 'RENTA', 'TRASPASO']);

export const propertyStatusEnum = z.enum([
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'SOLD',
  'RENTED',
  'ARCHIVED',
]);

export const commissionStatusEnum = z.enum(['PENDING', 'APPROVED', 'PAID', 'CANCELLED']);

export const visitStatusEnum = z.enum([
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

// ----------------------------------------------------------------------------
// Contacts
// ----------------------------------------------------------------------------
export const createContactSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es requerido').max(80),
  lastName: z.string().trim().min(1, 'El apellido es requerido').max(80),
  email: z.string().trim().email('Correo electrónico inválido').toLowerCase(),
  phone: z.string().trim().max(30).optional().nullable(),
  company: z.string().trim().max(120).optional().nullable(),
  jobTitle: z.string().trim().max(80).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const updateContactSchema = createContactSchema.partial().extend({
  id: z.string().uuid('ID de contacto inválido'),
});

// ----------------------------------------------------------------------------
// Leads
// ----------------------------------------------------------------------------
export const createLeadSchema = z.object({
  contactId: z.string().uuid('ID de contacto inválido'),
  propertyId: z.string().uuid('ID de propiedad inválido').optional().nullable(),
  title: z.string().trim().min(1, 'El título del prospecto es requerido').max(150),
  value: z.number().nonnegative('El valor no puede ser negativo').default(0),
  currency: z.string().trim().length(3, 'Código de moneda de 3 caracteres (ej. MXN, USD)').default('MXN'),
  stage: leadStageEnum.default('NEW'),
  priority: leadPriorityEnum.default('MEDIUM'),
  assignedToUserId: z.string().uuid().optional().nullable(),
  source: z.string().trim().max(60).optional().nullable(),
  expectedCloseDate: z.string().datetime({ offset: true }).optional().nullable(),
  notes: z.string().trim().max(3000).optional().nullable(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  id: z.string().uuid('ID de prospecto inválido'),
});

export const updateLeadStageSchema = z.object({
  id: z.string().uuid('ID de prospecto inválido'),
  stage: leadStageEnum,
  lossReason: z.string().trim().max(250).optional().nullable(),
});

export const leadFilterSchema = z.object({
  stage: z.array(leadStageEnum).optional(),
  priority: z.array(leadPriorityEnum).optional(),
  assignedToUserId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional(),
  search: z.string().trim().max(100).optional(),
  minVal: z.number().nonnegative().optional(),
  maxVal: z.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

// ----------------------------------------------------------------------------
// Properties
// ----------------------------------------------------------------------------
export const createPropertySchema = z.object({
  title: z.string().trim().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  description: z.string().trim().min(10, 'Describe las características principales del inmueble'),
  propertyType: propertyTypeEnum,
  operationType: operationTypeEnum,
  price: z.number().positive('El precio debe ser mayor a 0'),
  currency: z.string().trim().length(3).default('MXN'),
  status: propertyStatusEnum.default('PENDING_REVIEW'),
  address: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().min(2, 'La ciudad es requerida').max(100),
  state: z.string().trim().min(2, 'El estado o región es requerido').max(100),
  neighborhood: z.string().trim().max(100).optional().nullable(),
  postalCode: z.string().trim().max(10).optional().nullable(),
  landArea: z.number().nonnegative().optional().nullable(),
  constructionArea: z.number().nonnegative().optional().nullable(),
  bedrooms: z.number().int().nonnegative().default(0),
  bathrooms: z.number().nonnegative().default(0),
  parkingSpaces: z.number().int().nonnegative().default(0),
  features: z.array(z.string().trim()).default([]),
  captadorUserId: z.string().uuid().optional().nullable(),
  assignedAgentId: z.string().uuid().optional().nullable(),
  commissionRate: z.number().min(0).max(100).default(5.0),
  captadorCommissionPct: z.number().min(0).max(100).default(30.0),
  featured: z.boolean().default(false),
  images: z.array(z.string().url('URL de imagen inválida')).default([]),
});

export const updatePropertySchema = createPropertySchema.partial().extend({
  id: z.string().uuid('ID de propiedad inválido'),
});

// ----------------------------------------------------------------------------
// Captura Pública de Leads (Web Form & WhatsApp Tracker)
// ----------------------------------------------------------------------------
export const publicInquirySchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  name: z.string().trim().min(2, 'Por favor ingresa tu nombre').max(100),
  phone: z.string().trim().min(8, 'Ingresa un número de teléfono válido').max(25),
  email: z.string().trim().email('Correo electrónico no válido').optional().or(z.literal('')),
  message: z.string().trim().max(1000).optional(),
  channel: z.enum(['WHATSAPP', 'FORM', 'SCHEDULE_VISIT']).default('FORM'),
});

// ----------------------------------------------------------------------------
// Agendador Interactivo de Visitas
// ----------------------------------------------------------------------------
export const bookVisitSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  visitorName: z.string().trim().min(2, 'Nombre de quien asiste a la visita').max(120),
  visitorPhone: z.string().trim().min(8, 'Teléfono de contacto requerido').max(30),
  visitorEmail: z.string().trim().email('Correo electrónico inválido').optional().or(z.literal('')),
  scheduledAt: z.string().datetime({ offset: true, message: 'Fecha y hora requeridas' }),
  notes: z.string().trim().max(500).optional(),
});

// ----------------------------------------------------------------------------
// Comisiones
// ----------------------------------------------------------------------------
export const createCommissionSchema = z.object({
  propertyId: z.string().uuid(),
  leadId: z.string().uuid().optional().nullable(),
  dealValue: z.number().positive('El valor de la operación debe ser mayor a 0'),
  currency: z.string().trim().length(3).default('MXN'),
  totalCommissionAmount: z.number().positive(),
  captadorUserId: z.string().uuid().optional().nullable(),
  captadorAmount: z.number().nonnegative().default(0),
  agentUserId: z.string().uuid().optional().nullable(),
  agentAmount: z.number().nonnegative().default(0),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const updateCommissionStatusSchema = z.object({
  id: z.string().uuid(),
  target: z.enum(['captador', 'agent']),
  status: commissionStatusEnum,
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type UpdateLeadStageInput = z.infer<typeof updateLeadStageSchema>;
export type LeadFilterInput = z.infer<typeof leadFilterSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PublicInquiryInput = z.infer<typeof publicInquirySchema>;
export type BookVisitInput = z.infer<typeof bookVisitSchema>;
export type CreateCommissionInput = z.infer<typeof createCommissionSchema>;

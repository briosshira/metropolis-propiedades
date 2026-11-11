import { LeadPriority, LeadStage } from '@/types/crm';

export interface StageConfig {
  id: LeadStage;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  dotColor: string;
}

export const STAGE_CONFIGS: Record<LeadStage, StageConfig> = {
  NEW: {
    id: 'NEW',
    label: 'Nuevo Prospecto',
    description: 'Leads recién captados sin contacto inicial',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    textColor: '#1d4ed8',
    badgeBg: '#dbeafe',
    dotColor: '#2563eb',
  },
  CONTACTED: {
    id: 'CONTACTED',
    label: 'Contactado',
    description: 'Primer acercamiento por llamada, WhatsApp o correo',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    borderColor: '#a5f3fc',
    textColor: '#0e7490',
    badgeBg: '#cffafe',
    dotColor: '#0891b2',
  },
  QUALIFIED: {
    id: 'QUALIFIED',
    label: 'Calificado',
    description: 'Presupuesto y necesidad validados con el cliente',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    textColor: '#6d28d9',
    badgeBg: '#ede9fe',
    dotColor: '#7c3aed',
  },
  PROPOSAL: {
    id: 'PROPOSAL',
    label: 'Propuesta Enviada',
    description: 'Cotización o propuesta de inmueble formal presentada',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    textColor: '#b45309',
    badgeBg: '#fef3c7',
    dotColor: '#d97706',
  },
  NEGOTIATION: {
    id: 'NEGOTIATION',
    label: 'En Negociación',
    description: 'Discusión de términos, precios o condiciones',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    borderColor: '#fbcfe8',
    textColor: '#be185d',
    badgeBg: '#fce7f3',
    dotColor: '#db2777',
  },
  WON: {
    id: 'WON',
    label: 'Ganado (Cerrado)',
    description: 'Trato exitoso y contrato o apartado firmado',
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    textColor: '#047857',
    badgeBg: '#d1fae5',
    dotColor: '#059669',
  },
  LOST: {
    id: 'LOST',
    label: 'Perdido',
    description: 'Oportunidad descartada o declinada',
    color: '#6b7280',
    bgColor: '#f9fafb',
    borderColor: '#e5e7eb',
    textColor: '#4b5563',
    badgeBg: '#f3f4f6',
    dotColor: '#9ca3af',
  },
};

export const ORDERED_STAGES: LeadStage[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
];

export interface PriorityConfig {
  id: LeadPriority;
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const PRIORITY_CONFIGS: Record<LeadPriority, PriorityConfig> = {
  URGENT: {
    id: 'URGENT',
    label: 'Urgente',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-500',
  },
  HIGH: {
    id: 'HIGH',
    label: 'Alta',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    dotClass: 'bg-amber-500',
  },
  MEDIUM: {
    id: 'MEDIUM',
    label: 'Media',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    dotClass: 'bg-blue-500',
  },
  LOW: {
    id: 'LOW',
    label: 'Baja',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotClass: 'bg-slate-400',
  },
};

export function formatCurrency(value: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} $${value.toLocaleString()}`;
  }
}

export function formatDate(isoDate?: string | null): string {
  if (!isoDate) return '-';
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoDate;
  }
}

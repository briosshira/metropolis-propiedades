'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Kanban,
  Table,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Contact, LeadPriority, LeadStage, LeadWithContact } from '@/types/crm';
import { formatCurrency } from '@/styles/theme';
import KanbanBoard from './KanbanBoard';
import LeadsTable from './LeadsTable';
import ContactsTable from './ContactsTable';
import CreateLeadModal from './CreateLeadModal';
import EmptyState from './EmptyState';

interface LeadsViewProps {
  initialLeads: LeadWithContact[];
  initialContacts: Contact[];
}

export default function LeadsView({
  initialLeads,
  initialContacts,
}: LeadsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active view from query string or default to 'kanban'
  const currentView = searchParams.get('view') || 'kanban';

  // Modal open state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return initialLeads.filter((lead) => {
      // Priority filter
      if (selectedPriority !== 'ALL' && lead.priority !== selectedPriority) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = lead.title.toLowerCase().includes(q);
        const contactName = `${lead.contact?.firstName || ''} ${
          lead.contact?.lastName || ''
        }`.toLowerCase();
        const contactMatch = contactName.includes(q);
        const companyMatch =
          lead.contact?.company?.toLowerCase().includes(q) || false;

        if (!titleMatch && !contactMatch && !companyMatch) {
          return false;
        }
      }

      return true;
    });
  }, [initialLeads, searchQuery, selectedPriority]);

  // High-level CRM Metrics Calculations
  const metrics = useMemo(() => {
    const totalCount = initialLeads.length;
    const totalPipelineValue = initialLeads.reduce(
      (sum, l) => sum + (Number(l.value) || 0),
      0
    );
    const wonDeals = initialLeads.filter((l) => l.stage === 'WON');
    const wonValue = wonDeals.reduce(
      (sum, l) => sum + (Number(l.value) || 0),
      0
    );
    const avgTicket = totalCount > 0 ? totalPipelineValue / totalCount : 0;

    return {
      totalCount,
      totalPipelineValue,
      wonDealsCount: wonDeals.length,
      wonValue,
      avgTicket,
    };
  }, [initialLeads]);

  const setView = (view: 'kanban' | 'table' | 'contacts') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`/leads?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Quick Business KPI Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Pipeline Total
            </span>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {formatCurrency(metrics.totalPipelineValue, 'USD')}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            En {metrics.totalCount} oportunidades activas
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Tratos Cerrados (WON)
            </span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono">
            {formatCurrency(metrics.wonValue, 'USD')}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {metrics.wonDealsCount} tratos exitosos en firme
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Ticket Promedio
            </span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {formatCurrency(metrics.avgTicket, 'USD')}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Por prospecto registrado
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Directorio Inquilino
            </span>
            <Users className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {initialContacts.length}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Contactos aislados por RLS
          </span>
        </div>
      </div>

      {/* Control Header: View Switcher, Search, Filter & New Lead Button */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: View Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              currentView === 'kanban'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="h-4 w-4" />
            <span>Embudo Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => setView('table')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              currentView === 'table'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="h-4 w-4" />
            <span>Tabla de Datos</span>
          </button>

          <button
            type="button"
            onClick={() => setView('contacts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              currentView === 'contacts'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Contactos ({initialContacts.length})</span>
          </button>
        </div>

        {/* Right: Search, Filters & Action Button */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {currentView !== 'contacts' && (
            <>
              {/* Search input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar prospecto o cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>

              {/* Priority filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Todas las prioridades</option>
                  <option value="URGENT">Urgente 🔥</option>
                  <option value="HIGH">Alta</option>
                  <option value="MEDIUM">Media</option>
                  <option value="LOW">Baja</option>
                </select>
              </div>
            </>
          )}

          {/* New Lead Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm hover:shadow active:scale-95 ml-auto sm:ml-0"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Prospecto</span>
          </button>
        </div>
      </div>

      {/* Main View Presentation */}
      {currentView === 'contacts' ? (
        <ContactsTable contacts={initialContacts} />
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          isFiltered={initialLeads.length > 0}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedPriority('ALL');
          }}
          title={
            initialLeads.length === 0
              ? 'Embudo comercial sin prospectos'
              : 'Ningún prospecto coincide con la búsqueda'
          }
          description={
            initialLeads.length === 0
              ? 'Crea tu primer prospecto de venta inmobiliaria o asocia un cliente para visualizar las 7 columnas del embudo.'
              : 'Intenta modificar el término de búsqueda o restablecer los filtros de prioridad.'
          }
        />
      ) : currentView === 'kanban' ? (
        <KanbanBoard leads={filteredLeads} />
      ) : (
        <LeadsTable leads={filteredLeads} pageSize={10} />
      )}

      {/* Accessible Create Lead Modal */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        contacts={initialContacts}
        onLeadCreated={() => {
          // Trigger refresh
          router.refresh();
        }}
      />
    </div>
  );
}

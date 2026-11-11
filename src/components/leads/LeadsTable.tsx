'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ORDERED_STAGES,
  STAGE_CONFIGS,
  PRIORITY_CONFIGS,
  formatCurrency,
  formatDate,
} from '@/styles/theme';
import { LeadPriority, LeadStage, LeadWithContact } from '@/types/crm';
import { updateLeadStage } from '@/actions/leads';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  Loader2,
} from 'lucide-react';

interface LeadsTableProps {
  leads: LeadWithContact[];
  pageSize?: number;
}

export default function LeadsTable({ leads, pageSize = 10 }: LeadsTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pagination slice
  const totalPages = Math.ceil(leads.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentLeads = leads.slice(startIndex, startIndex + pageSize);

  const handleStageSelect = (leadId: string, newStage: LeadStage) => {
    setUpdatingId(leadId);
    startTransition(async () => {
      try {
        await updateLeadStage(leadId, newStage);
      } finally {
        setUpdatingId(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Dense Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Prospecto / Inmueble</th>
              <th className="py-3 px-4">Contacto Asociado</th>
              <th className="py-3 px-4">Etapa Comercial</th>
              <th className="py-3 px-4">Prioridad</th>
              <th className="py-3 px-4 text-right">Valor Estimado</th>
              <th className="py-3 px-4">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {currentLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No hay prospectos para mostrar en esta vista.
                </td>
              </tr>
            ) : (
              currentLeads.map((lead) => {
                const priorityConf =
                  PRIORITY_CONFIGS[lead.priority] || PRIORITY_CONFIGS.MEDIUM;
                const isUpdating = updatingId === lead.id;

                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Title */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 min-w-[200px]">
                      <span className="block truncate">{lead.title}</span>
                      {lead.source && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          Fuente: {lead.source}
                        </span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 min-w-[190px]">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                          {lead.contact?.firstName?.[0] || 'C'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {lead.contact?.firstName} {lead.contact?.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {lead.contact?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Stage Selector */}
                    <td className="py-3.5 px-4 min-w-[170px]">
                      <div className="flex items-center gap-1.5">
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                        ) : (
                          <select
                            value={lead.stage}
                            onChange={(e) =>
                              handleStageSelect(
                                lead.id,
                                e.target.value as LeadStage
                              )
                            }
                            className="text-xs font-semibold rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm cursor-pointer"
                          >
                            {ORDERED_STAGES.map((s) => (
                              <option key={s} value={s}>
                                {STAGE_CONFIGS[s].label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityConf.badgeClass}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${priorityConf.dotClass}`}
                        ></span>
                        {priorityConf.label}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-mono text-xs">
                      {formatCurrency(Number(lead.value), lead.currency)}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
        <div>
          Mostrando{' '}
          <span className="font-semibold text-slate-800">
            {leads.length === 0 ? 0 : startIndex + 1}
          </span>{' '}
          a{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(startIndex + pageSize, leads.length)}
          </span>{' '}
          de <span className="font-semibold text-slate-800">{leads.length}</span>{' '}
          prospectos
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-medium text-slate-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

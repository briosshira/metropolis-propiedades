'use client';

import React, { useState, useTransition, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import {
  ORDERED_STAGES,
  STAGE_CONFIGS,
  PRIORITY_CONFIGS,
  formatCurrency,
  formatDate,
} from '@/styles/theme';
import { LeadStage, LeadWithContact } from '@/types/crm';
import { updateLeadStage } from '@/actions/leads';
import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  GripVertical,
  Loader2,
  Mail,
  MoveRight,
  User,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface KanbanBoardProps {
  leads: LeadWithContact[];
  onSelectLead?: (lead: LeadWithContact) => void;
}

export default function KanbanBoard({ leads, onSelectLead }: KanbanBoardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pendingLeadIds, setPendingLeadIds] = useState<Set<string>>(new Set());
  const [activeDragOverStage, setActiveDragOverStage] = useState<LeadStage | null>(null);
  const [transientError, setTransientError] = useState<string | null>(null);

  // React 19 Optimistic state for lead stage transitions
  const [optimisticLeads, setOptimisticLeadStage] = useOptimistic(
    leads,
    (state: LeadWithContact[], update: { id: string; stage: LeadStage }) => {
      return state.map((lead) =>
        lead.id === update.id ? { ...lead, stage: update.stage } : lead
      );
    }
  );

  const handleStageChange = (leadId: string, nextStage: LeadStage) => {
    const currentLead = optimisticLeads.find((l) => l.id === leadId);
    if (!currentLead || currentLead.stage === nextStage) return;

    setTransientError(null);
    setPendingLeadIds((prev) => new Set(prev).add(leadId));

    startTransition(async () => {
      // 1. Zero perceived latency: immediate optimistic UI update
      setOptimisticLeadStage({ id: leadId, stage: nextStage });

      try {
        // 2. Perform Server Action
        const result = await updateLeadStage(leadId, nextStage);
        if (!result.success) {
          setTransientError(result.error || 'No se pudo actualizar la etapa.');
        }
      } catch (err) {
        setTransientError(
          err instanceof Error ? err.message : 'Error al conectar con el servidor.'
        );
      } finally {
        setPendingLeadIds((prev) => {
          const next = new Set(prev);
          next.delete(leadId);
          return next;
        });
        router.refresh();
      }
    });
  };

  // Drag and Drop event handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stage: LeadStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDragOverStage !== stage) {
      setActiveDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, stage: LeadStage) => {
    // Only clear if leaving the current target column
    if (activeDragOverStage === stage) {
      setActiveDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, stage: LeadStage) => {
    e.preventDefault();
    setActiveDragOverStage(null);
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      handleStageChange(leadId, stage);
    }
  };

  return (
    <div className="space-y-4">
      {/* Transient Error Toast Banner */}
      {transientError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            <span>{transientError}</span>
          </div>
          <button
            type="button"
            onClick={() => setTransientError(null)}
            className="text-xs font-semibold underline text-rose-700 hover:text-rose-900"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Horizontal Scrollable Funnel Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6 kanban-scroll items-start min-h-[580px]">
        {ORDERED_STAGES.map((stageKey, stageIdx) => {
          const config = STAGE_CONFIGS[stageKey];
          const columnLeads = optimisticLeads.filter((l) => l.stage === stageKey);
          const totalColumnValue = columnLeads.reduce(
            (sum, item) => sum + (Number(item.value) || 0),
            0
          );
          const isOver = activeDragOverStage === stageKey;

          return (
            <div
              key={stageKey}
              onDragOver={(e) => handleDragOver(e, stageKey)}
              onDragLeave={(e) => handleDragLeave(e, stageKey)}
              onDrop={(e) => handleDrop(e, stageKey)}
              className={`w-80 flex-shrink-0 rounded-2xl border transition-all duration-150 flex flex-col ${
                isOver
                  ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-300'
                  : 'bg-slate-100/70 border-slate-200/80'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200 bg-white/70 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    ></span>
                    <h3 className="text-xs font-bold text-slate-800 truncate uppercase tracking-wide">
                      {config.label}
                    </h3>
                  </div>

                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold bg-slate-200/80 text-slate-700">
                    {columnLeads.length}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium">Total Etapa:</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {formatCurrency(totalColumnValue, 'USD')}
                  </span>
                </div>
              </div>

              {/* Column Body / Cards List */}
              <div className="p-2.5 space-y-3 min-h-[380px] max-h-[70vh] overflow-y-auto">
                {columnLeads.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-3 text-center text-slate-400 text-xs">
                    <span className="block font-medium">Arrastra un prospecto aquí</span>
                    <span className="text-[10px] text-slate-400 mt-1">o usa los selectores</span>
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const isPending = pendingLeadIds.has(lead.id);
                    const priorityConf =
                      PRIORITY_CONFIGS[lead.priority] || PRIORITY_CONFIGS.MEDIUM;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className={`group relative bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                          isPending
                            ? 'opacity-60 ring-2 ring-indigo-400 bg-indigo-50/20'
                            : ''
                        }`}
                      >
                        {/* Pending In-Flight Indicator */}
                        {isPending && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-semibold animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Actualizando</span>
                          </div>
                        )}

                        {/* Top Meta: Priority & Currency */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityConf.badgeClass}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${priorityConf.dotClass}`}
                            ></span>
                            {priorityConf.label}
                          </span>

                          <span className="text-[11px] font-mono text-slate-400">
                            {lead.currency}
                          </span>
                        </div>

                        {/* Deal Title */}
                        <h4
                          onClick={() => onSelectLead?.(lead)}
                          className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-2 cursor-pointer"
                        >
                          {lead.title}
                        </h4>

                        {/* Associated Contact Info */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate font-medium">
                              {lead.contact?.firstName} {lead.contact?.lastName}
                            </span>
                          </div>

                          {lead.contact?.company && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Building2 className="h-3 w-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{lead.contact.company}</span>
                            </div>
                          )}
                        </div>

                        {/* Value and Stage Stepper */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Monto
                            </span>
                            <span className="text-xs font-extrabold text-slate-900 font-mono">
                              {formatCurrency(Number(lead.value), lead.currency)}
                            </span>
                          </div>

                          {/* Quick Accessible Stage Stepper */}
                          <div className="flex items-center gap-1">
                            {stageIdx > 0 && (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                  handleStageChange(
                                    lead.id,
                                    ORDERED_STAGES[stageIdx - 1]
                                  )
                                }
                                title={`Mover atrás a ${
                                  STAGE_CONFIGS[ORDERED_STAGES[stageIdx - 1]].label
                                }`}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-30"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {stageIdx < ORDERED_STAGES.length - 1 && (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                  handleStageChange(
                                    lead.id,
                                    ORDERED_STAGES[stageIdx + 1]
                                  )
                                }
                                title={`Avanzar a ${
                                  STAGE_CONFIGS[ORDERED_STAGES[stageIdx + 1]].label
                                }`}
                                className="p-1 rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition disabled:opacity-30"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

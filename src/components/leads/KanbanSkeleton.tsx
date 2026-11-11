import React from 'react';
import { ORDERED_STAGES, STAGE_CONFIGS } from '@/styles/theme';

export default function KanbanSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Cargando embudo de ventas...">
      {/* Metrics Bar Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2"
          >
            <div className="h-3 w-24 bg-slate-200 rounded"></div>
            <div className="h-6 w-32 bg-slate-300 rounded"></div>
          </div>
        ))}
      </div>

      {/* Action and Filter Controls Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-xl">
        <div className="h-10 w-72 bg-slate-200 rounded-lg"></div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
          <div className="h-10 w-36 bg-slate-200 rounded-lg"></div>
          <div className="h-10 w-36 bg-slate-300 rounded-lg"></div>
        </div>
      </div>

      {/* Horizontal Kanban Columns Skeleton */}
      <div className="flex gap-4 overflow-x-auto pb-4 kanban-scroll items-start">
        {ORDERED_STAGES.map((stageKey) => {
          const stage = STAGE_CONFIGS[stageKey];
          return (
            <div
              key={stage.id}
              className="w-80 flex-shrink-0 bg-slate-100/80 rounded-xl border border-slate-200 p-3 space-y-3"
            >
              {/* Column Header Skeleton */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  ></span>
                  <div className="h-4 w-28 bg-slate-200 rounded"></div>
                </div>
                <div className="h-5 w-7 bg-slate-200 rounded-full"></div>
              </div>

              {/* Subtotal Pill Skeleton */}
              <div className="h-3 w-20 bg-slate-200 rounded"></div>

              {/* Card Skeletons (identically proportioned to final cards) */}
              <div className="space-y-3">
                {[1, 2].map((card) => (
                  <div
                    key={card}
                    className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
                      <div className="h-3 w-12 bg-slate-100 rounded"></div>
                    </div>
                    <div className="h-4 w-44 bg-slate-200 rounded"></div>
                    <div className="h-3.5 w-32 bg-slate-100 rounded"></div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-5 w-24 bg-slate-200 rounded"></div>
                      <div className="h-6 w-6 rounded-full bg-slate-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

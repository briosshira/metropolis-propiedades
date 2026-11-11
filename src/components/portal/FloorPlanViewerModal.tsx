'use client';

import { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, Layers } from 'lucide-react';

interface FloorPlan {
  id: string;
  title: string;
  url: string;
  level?: string;
  area?: number;
}

interface FloorPlanViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  floorPlans: FloorPlan[];
  propertyTitle: string;
}

export function FloorPlanViewerModal({
  isOpen,
  onClose,
  floorPlans,
  propertyTitle,
}: FloorPlanViewerModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen || !floorPlans || floorPlans.length === 0) return null;

  const currentPlan = floorPlans[selectedIndex] || floorPlans[0];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400 border border-emerald-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Planos Arquitectónicos y Distribución
              </h3>
              <p className="text-xs text-slate-400">{propertyTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Level Switcher (Tabs) */}
        {floorPlans.length > 1 && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto">
            {floorPlans.map((plan, idx) => (
              <button
                key={plan.id}
                onClick={() => {
                  setSelectedIndex(idx);
                  setZoomLevel(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedIndex === idx
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/40'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {plan.level || plan.title}
                {plan.area ? ` (${plan.area} m²)` : ''}
              </button>
            ))}
          </div>
        )}

        {/* Blueprint Canvas View */}
        <div className="relative flex-1 overflow-hidden bg-slate-950 min-h-[380px] flex items-center justify-center p-4">
          <div
            className="transition-transform duration-200 select-none cursor-grab active:cursor-grabbing flex items-center justify-center max-w-full max-h-full"
            style={{
              transform: `scale(${zoomLevel})`,
            }}
          >
            <img
              src={currentPlan.url}
              alt={currentPlan.title}
              className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
            />
          </div>

          {/* Floating Canvas Controls */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md px-3 py-1.5 border border-slate-700/80 shadow-xl text-white">
            <button
              onClick={handleZoomOut}
              title="Reducir zoom"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono px-2 text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Aumentar zoom"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="h-4 w-[1px] bg-slate-700 mx-1" />
            <button
              onClick={handleResetZoom}
              title="Restablecer"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Footer info & Download button */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-300">
          <div>
            <strong className="text-white text-sm block">{currentPlan.title}</strong>
            <span className="text-slate-400">
              {currentPlan.level ? `${currentPlan.level} • ` : ''}
              {currentPlan.area ? `Superficie estimada: ${currentPlan.area} m²` : 'Cotas y deslinde autorizados'}
            </span>
          </div>

          <a
            href={currentPlan.url}
            target="_blank"
            rel="noopener noreferrer"
            download={`${propertyTitle}_Plano.jpg`}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition-colors border border-slate-700 shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Descargar Plano en Alta Definición</span>
          </a>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Compass, Maximize2, RotateCw, Sparkles, ExternalLink } from 'lucide-react';

interface VirtualTourViewerProps {
  tourUrl: string;
  propertyTitle: string;
}

export function VirtualTourViewer({ tourUrl, propertyTitle }: VirtualTourViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'h-[480px] w-full'
      }`}
    >
      {/* Top Header Badge Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-lg border border-slate-700/60">
          <Compass className="h-4 w-4 text-emerald-400 animate-spin-slow" />
          <span>Recorrido Virtual Inmersivo 360°</span>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span>Exploración libre con giro y zoom</span>
        </div>
      </div>

      {/* Top Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <a
          href={tourUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-lg border border-slate-700/60 hover:bg-slate-800 transition-colors"
          title="Abrir en pestaña nueva"
        >
          <ExternalLink className="h-3.5 w-3.5 text-slate-300" />
          <span className="hidden sm:inline">Pestaña completa</span>
        </a>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="rounded-full bg-slate-900/90 backdrop-blur-md p-2 text-white shadow-lg border border-slate-700/60 hover:bg-slate-800 transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          <Maximize2 className="h-4 w-4 text-emerald-400" />
        </button>
      </div>

      {/* 360 Iframe Viewer */}
      <iframe
        src={tourUrl}
        title={`Recorrido Virtual 360 - ${propertyTitle}`}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
        allowFullScreen
      />

      {/* Bottom Hint Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between rounded-xl bg-slate-900/80 backdrop-blur-md px-4 py-2 text-[11px] text-slate-300 border border-slate-800">
        <div className="flex items-center gap-2">
          <RotateCw className="h-3.5 w-3.5 text-emerald-400" />
          <span>Arrastra con el mouse o dedo para girar 360° en cualquier dirección</span>
        </div>
        <span className="text-slate-400 font-mono hidden sm:inline">Matterport / 3D Space</span>
      </div>
    </div>
  );
}

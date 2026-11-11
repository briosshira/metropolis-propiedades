'use client';

import { useState } from 'react';
import { LayoutGrid, Map, Sparkles, Building2 } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { PropertyMap } from './PropertyMap';
import type { PropertyWithMedia } from '@/types/crm';
import Link from 'next/link';

interface CatalogViewToggleProps {
  properties: PropertyWithMedia[];
}

export function CatalogViewToggle({ properties }: CatalogViewToggleProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  return (
    <div className="space-y-6">
      {/* View Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Catálogo Inmobiliario</span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
            Inmuebles y Terrenos Disponibles
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            {properties.length} propiedades
          </span>

          <div className="flex rounded-xl bg-slate-200/80 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Cuadrícula</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Ver en Mapa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content depending on active view mode */}
      {properties.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <PropertyMap properties={properties} className="h-[520px] w-full" zoom={11} />
            <p className="text-xs text-slate-500 text-center">
              Haz clic en cualquier pin verde para ver el precio, foto y abrir la ficha técnica de la propiedad.
            </p>
          </div>
        )
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-base font-bold text-slate-900">
            No se encontraron inmuebles con estos filtros
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Intenta ajustar la búsqueda o limpia los filtros para ver todos los terrenos y casas.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
          >
            Ver todo el catálogo
          </Link>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Sparkles, Plus, Users, FolderPlus } from 'lucide-react';

interface EmptyStateProps {
  onOpenCreateModal: () => void;
  title?: string;
  description?: string;
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export default function EmptyState({
  onOpenCreateModal,
  title = 'No hay prospectos en el embudo',
  description = 'Comienza agregando un nuevo prospecto o vinculando un contacto clave para activar las etapas comerciales.',
  isFiltered = false,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center my-6 shadow-sm">
      <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
        {isFiltered ? (
          <Users className="h-8 w-8 text-indigo-500" />
        ) : (
          <FolderPlus className="h-8 w-8 text-indigo-600" />
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>

      <div className="flex items-center gap-3">
        {isFiltered && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            Limpiar filtros
          </button>
        )}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm hover:shadow active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Primer Prospecto</span>
        </button>
      </div>
    </div>
  );
}

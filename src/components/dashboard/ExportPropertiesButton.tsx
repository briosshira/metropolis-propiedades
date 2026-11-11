'use client';

import { FileSpreadsheet } from 'lucide-react';
import { exportToCsv } from '@/lib/export/excel';
import type { PropertyWithMedia } from '@/types/crm';

interface ExportPropertiesButtonProps {
  properties: PropertyWithMedia[];
}

export function ExportPropertiesButton({ properties }: ExportPropertiesButtonProps) {
  const handleExport = () => {
    const headers = [
      'Título del Inmueble',
      'Tipo de Propiedad',
      'Tipo de Operación',
      'Precio de Lista',
      'Moneda',
      'Superficie Terreno (m²)',
      'Superficie Construcción (m²)',
      'Recámaras',
      'Baños',
      'Estacionamientos',
      'Ciudad',
      'Estado',
      'Colonia',
      'Dirección',
      'Estatus Publicación',
      'Fecha Registro',
    ];

    const rows = properties.map((p) => [
      p.title,
      p.propertyType,
      p.operationType,
      p.price,
      p.currency,
      p.landArea || 0,
      p.constructionArea || 0,
      p.bedrooms || 0,
      p.bathrooms || 0,
      p.parkingSpaces || 0,
      p.city,
      p.state,
      p.neighborhood || '',
      p.address || '',
      p.status,
      p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-MX') : '',
    ]);

    exportToCsv(
      `Inventario_Propiedades_Metropolis_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-emerald-800 hover:border-emerald-500 transition-all cursor-pointer"
      title="Exportar inventario completo de terrenos e inmuebles en formato CSV para Microsoft Excel"
    >
      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
      <span>Exportar a Excel</span>
    </button>
  );
}

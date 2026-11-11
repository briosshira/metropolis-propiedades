'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-600 transition-colors cursor-pointer"
    >
      <Printer className="h-4 w-4" />
      <span>Descargar en PDF / Imprimir</span>
    </button>
  );
}

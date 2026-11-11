'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = 'Ocurrió un error al cargar la información del embudo de ventas.',
  onRetry,
}: ErrorStateProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.refresh();
    }
  };

  return (
    <div className="p-8 my-6 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center gap-5 justify-between">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-rose-900">
            Fallo de Sincronización con el Servidor
          </h4>
          <p className="text-sm text-rose-700 mt-1 max-w-xl">{message}</p>
          <span className="inline-block mt-2 text-xs font-mono text-rose-600/80 bg-rose-100/50 px-2 py-0.5 rounded">
            Tenant Session Error Code: TENANT_DB_SYNC_FAIL
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRetry}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-lg transition shadow-sm flex-shrink-0"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Reintentar Conexión</span>
      </button>
    </div>
  );
}

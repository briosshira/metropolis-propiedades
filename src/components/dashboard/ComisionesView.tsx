'use client';

import { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  DollarSign,
} from 'lucide-react';
import { updateCommissionStatusAction } from '@/actions/commissions';
import type { CommissionWithDetails, CommissionStatus } from '@/types/crm';

interface ComisionesViewProps {
  initialCommissions: CommissionWithDetails[];
}

export function ComisionesView({ initialCommissions }: ComisionesViewProps) {
  const [commissions, setCommissions] = useState<CommissionWithDetails[]>(initialCommissions);
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Exchange rate base (ej. 1 USD = 20 MXN para conversión dinámica)
  const EXCHANGE_RATE = 20.0;

  const convertAmount = (amountInMxn: number) => {
    if (currency === 'USD') {
      return amountInMxn / EXCHANGE_RATE;
    }
    return amountInMxn;
  };

  const formatMoney = (amountInMxn: number) => {
    const converted = convertAmount(amountInMxn);
    const prefix = currency === 'USD' ? 'US$' : '$';
    return `${prefix}${converted.toLocaleString('es-MX', {
      maximumFractionDigits: 0,
    })} ${currency}`;
  };

  // Metrics (computed dynamically based on currency)
  const totalVolume = commissions.reduce((sum, c) => sum + c.dealValue, 0);
  const totalCommissionGenerated = commissions.reduce((sum, c) => sum + c.totalCommissionAmount, 0);
  const totalCaptadores = commissions.reduce((sum, c) => sum + c.captadorAmount, 0);
  const totalAgentes = commissions.reduce((sum, c) => sum + c.agentAmount, 0);

  const handleStatusChange = async (
    commissionId: string,
    target: 'captador' | 'agent',
    status: CommissionStatus
  ) => {
    setUpdatingId(`${commissionId}_${target}`);
    const res = await updateCommissionStatusAction({
      id: commissionId,
      target,
      status,
    });
    setUpdatingId(null);

    if (res.success && res.data) {
      setCommissions((prev) =>
        prev.map((c) =>
          c.id === commissionId
            ? {
                ...c,
                captadorStatus: target === 'captador' ? status : c.captadorStatus,
                agentStatus: target === 'agent' ? status : c.agentStatus,
              }
            : c
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Currency Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="h-6 w-6 text-emerald-600" />
            <span>Control de Comisiones y Reparto de Ganancias</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Supervisión financiera del modelo de afiliados: división de comisiones entre captador de la propiedad y asesor cerrador.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            Moneda:
          </span>
          <button
            type="button"
            onClick={() => setCurrency('MXN')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              currency === 'MXN'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            🇲🇽 MXN
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              currency === 'USD'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            🇺🇸 USD
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Volumen de Ventas Cerradas
          </span>
          <span className="mt-1 text-xl font-black text-slate-900 block font-mono">
            {formatMoney(totalVolume)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Valor comercial ({currency === 'USD' ? 'T.C. aprox $20' : 'pesos'})
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Comisiones Totales
          </span>
          <span className="mt-1 text-xl font-black text-emerald-700 block font-mono">
            {formatMoney(totalCommissionGenerated)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Bruto ingresado a la agencia</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Para Captadores / Afiliados
            </span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <span className="mt-1 text-xl font-black text-emerald-950 block font-mono">
            {formatMoney(totalCaptadores)}
          </span>
          <span className="text-[10px] text-emerald-700 mt-1 block">Incentivo a usuarios externos</span>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider block">
            Para Asesores Internos
          </span>
          <span className="mt-1 text-xl font-black text-indigo-950 block font-mono">
            {formatMoney(totalAgentes)}
          </span>
          <span className="text-[10px] text-indigo-700 mt-1 block">Equipo de ventas interno</span>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Historial y Dispersión de Comisiones</h2>
          <span className="text-xs text-slate-500 font-semibold">
            {commissions.length} operaciones • Mostrando en {currency}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-6">Inmueble / Operación</th>
                <th className="py-3 px-4">Valor Cierre</th>
                <th className="py-3 px-4">Comisión Total</th>
                <th className="py-3 px-4">Parte Captador (Afiliado)</th>
                <th className="py-3 px-4">Parte Asesor de Ventas</th>
                <th className="py-3 px-4">Margen Agencia</th>
                <th className="py-3 px-6 text-right">Estatus Dispersión SPEI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commissions.map((comm) => {
                const captadorStatusColor =
                  comm.captadorStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : comm.captadorStatus === 'APPROVED'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300';

                return (
                  <tr key={comm.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 block">{comm.propertyTitle}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Ref: {comm.propertyId.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      {formatMoney(comm.dealValue)}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-emerald-700">
                      {formatMoney(comm.totalCommissionAmount)}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        ({Math.round((comm.totalCommissionAmount / (comm.dealValue || 1)) * 100)}% pactado)
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <span className="font-mono font-black text-emerald-800 block">
                          {formatMoney(comm.captadorAmount)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          {Math.round((comm.captadorAmount / (comm.totalCommissionAmount || 1)) * 100)}% del honorario
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {comm.captadorName || 'Afiliado'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <span className="font-mono font-black text-indigo-800 block">
                          {formatMoney(comm.agentAmount)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          {Math.round((comm.agentAmount / (comm.totalCommissionAmount || 1)) * 100)}% del honorario
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {comm.agentName || 'Asesor'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-600">
                      {formatMoney(
                        Math.max(0, comm.totalCommissionAmount - comm.captadorAmount - comm.agentAmount)
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${captadorStatusColor}`}
                        >
                          {comm.captadorStatus === 'PAID' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span>
                            {comm.captadorStatus === 'PAID'
                              ? 'Pagado vía SPEI'
                              : comm.captadorStatus === 'APPROVED'
                              ? 'Aprobado para Pago'
                              : 'Pendiente Liquidación'}
                          </span>
                        </span>

                        {comm.captadorStatus !== 'PAID' && (
                          <button
                            type="button"
                            disabled={updatingId === `${comm.id}_captador`}
                            onClick={() => handleStatusChange(comm.id, 'captador', 'PAID')}
                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 underline transition-colors disabled:opacity-50"
                          >
                            {updatingId === `${comm.id}_captador`
                              ? 'Dispersando...'
                              : 'Marcar SPEI Dispersado'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

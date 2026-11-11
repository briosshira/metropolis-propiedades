import { getSessionContext, getTenantDb } from '@/db/client';
import { updateCommissionStatusAction } from '@/actions/commissions';
import {
  Banknote,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import type { CommissionStatus } from '@/types/crm';

export default async function DashboardComisionesPage() {
  const session = await getSessionContext();
  const db = getTenantDb(session.tenantId);

  const commissions = await db.commissions.list();

  // Metrics
  const totalVolume = commissions.reduce((sum, c) => sum + c.dealValue, 0);
  const totalCommissionGenerated = commissions.reduce((sum, c) => sum + c.totalCommissionAmount, 0);
  const totalCaptadores = commissions.reduce((sum, c) => sum + c.captadorAmount, 0);
  const totalAgentes = commissions.reduce((sum, c) => sum + c.agentAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Banknote className="h-6 w-6 text-emerald-600" />
          <span>Control de Comisiones y Reparto de Ganancias</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Supervisión financiera del modelo de afiliados: división de comisiones entre captador de la propiedad y asesor cerrador.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Volumen de Ventas Cerradas
          </span>
          <span className="mt-1 text-xl font-black text-slate-900 block">
            ${totalVolume.toLocaleString('es-MX')} MXN
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Valor comercial total</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Comisiones Totales
          </span>
          <span className="mt-1 text-xl font-black text-emerald-700 block">
            ${totalCommissionGenerated.toLocaleString('es-MX')} MXN
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
          <span className="mt-1 text-xl font-black text-emerald-950 block">
            ${totalCaptadores.toLocaleString('es-MX')} MXN
          </span>
          <span className="text-[10px] text-emerald-700 mt-1 block">Incentivo a usuarios externos</span>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider block">
            Para Asesores Internos
          </span>
          <span className="mt-1 text-xl font-black text-indigo-950 block">
            ${totalAgentes.toLocaleString('es-MX')} MXN
          </span>
          <span className="text-[10px] text-indigo-700 mt-1 block">Equipo de ventas interno</span>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Historial y Dispersión de Comisiones</h2>
          <span className="text-xs text-slate-500">{commissions.length} operaciones</span>
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
                <th className="py-3 px-6 text-right">Acción Dispersión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {commissions.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="font-bold text-slate-900">{c.propertyTitle}</div>
                    <span className="text-[11px] text-slate-400">ID: {c.id.slice(0, 8)}</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ${c.dealValue.toLocaleString('es-MX')} {c.currency}
                  </td>

                  <td className="py-3.5 px-4 font-black text-emerald-700">
                    ${c.totalCommissionAmount.toLocaleString('es-MX')} {c.currency}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">
                        ${c.captadorAmount.toLocaleString('es-MX')} MXN
                      </span>
                      <span className="text-[11px] text-slate-500">{c.captadorName}</span>
                      <span
                        className={`inline-block mt-1 w-max rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          c.captadorStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.captadorStatus === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.captadorStatus === 'PAID'
                          ? '✓ Pagada'
                          : c.captadorStatus === 'APPROVED'
                          ? 'Aprobada'
                          : 'Pendiente'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">
                        ${c.agentAmount.toLocaleString('es-MX')} MXN
                      </span>
                      <span className="text-[11px] text-slate-500">{c.agentName}</span>
                      <span
                        className={`inline-block mt-1 w-max rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          c.agentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.agentStatus === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.agentStatus === 'PAID'
                          ? '✓ Pagada'
                          : c.agentStatus === 'APPROVED'
                          ? 'Aprobada'
                          : 'Pendiente'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-6 text-right">
                    {c.captadorStatus !== 'PAID' ? (
                      <form
                        action={async () => {
                          'use server';
                          await updateCommissionStatusAction({
                            id: c.id,
                            target: 'captador',
                            status: 'PAID',
                          });
                        }}
                        className="inline-block"
                      >
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Pagar a Captador</span>
                        </button>
                      </form>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completada</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

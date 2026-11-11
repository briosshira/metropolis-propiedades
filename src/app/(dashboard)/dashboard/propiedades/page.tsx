import Link from 'next/link';
import { getSessionContext, getTenantDb } from '@/db/client';
import { updatePropertyStatusAction } from '@/actions/properties';
import { ExportPropertiesButton } from '@/components/dashboard/ExportPropertiesButton';
import {
  Building2,
  CheckCircle,
  Clock,
  ExternalLink,
  PlusCircle,
  Sparkles,
  MapPin,
  XCircle,
} from 'lucide-react';
import type { PropertyStatus } from '@/types/crm';

export default async function DashboardPropiedadesPage() {
  const session = await getSessionContext();
  const db = getTenantDb(session.tenantId);

  // List all properties for this tenant
  const result = await db.properties.list({ pageSize: 50 });
  const properties = result.data;

  const pendingCount = properties.filter((p) => p.status === 'PENDING_REVIEW').length;
  const approvedCount = properties.filter((p) => p.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-600" />
            <span>Inventario & Moderación de Inmuebles</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Revisa, aprueba o edita los terrenos y propiedades enviadas por el equipo o usuarios captadores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExportPropertiesButton properties={properties} />

          <Link
            href="/publicar"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Registrar Inmueble</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total en Cartera
          </span>
          <span className="mt-1 text-2xl font-black text-slate-900 block">
            {properties.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Terrenos, residencias y rentas
          </span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
              Pendientes de Revisión
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <span className="mt-1 text-2xl font-black text-amber-900 block">
            {pendingCount}
          </span>
          <span className="text-[11px] text-amber-700 mt-1 block">
            Esperando aprobación para salir a la web
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Publicadas en Portal
            </span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="mt-1 text-2xl font-black text-emerald-900 block">
            {approvedCount}
          </span>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            Visibles y captando leads
          </span>
        </div>
      </div>

      {/* Properties Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Listado General de Inmuebles</h2>
          <span className="text-xs text-slate-500">{properties.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-6">Inmueble</th>
                <th className="py-3 px-4">Tipo / Operación</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Comisión Captador</th>
                <th className="py-3 px-4">Estatus</th>
                <th className="py-3 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {properties.map((prop) => {
                const cover = prop.media[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80';
                return (
                  <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={cover}
                          alt={prop.title}
                          className="h-12 w-16 rounded-lg object-cover shrink-0 border"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/propiedades/${prop.slug}`}
                            target="_blank"
                            className="font-bold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1 flex items-center gap-1"
                          >
                            <span>{prop.title}</span>
                            <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                          </Link>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>{prop.city}, {prop.state}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{prop.propertyType}</span>
                        <span className="text-[10px] text-slate-500">{prop.operationType}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${prop.price.toLocaleString('es-MX')} {prop.currency}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-emerald-700">
                          {prop.captadorCommissionPct}% del total
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Tasa pactada: {prop.commissionRate}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {prop.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3 w-3" /> Aprobada
                        </span>
                      )}
                      {prop.status === 'PENDING_REVIEW' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                          <Clock className="h-3 w-3" /> En Revisión
                        </span>
                      )}
                      {prop.status === 'DRAFT' && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          Borrador
                        </span>
                      )}
                      {prop.status === 'SOLD' && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                          Vendida
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      {prop.status === 'PENDING_REVIEW' ? (
                        <form
                          action={async () => {
                            'use server';
                            await updatePropertyStatusAction(prop.id, 'APPROVED');
                          }}
                          className="inline-block"
                        >
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Aprobar Publicación</span>
                          </button>
                        </form>
                      ) : (
                        <Link
                          href={`/propiedades/${prop.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <span>Ficha Pública</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
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

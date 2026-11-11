import { getSessionContext, getTenantDb } from '@/db/client';
import {
  Calendar,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  User,
  Building2,
  CalendarCheck,
} from 'lucide-react';
import type { VisitStatus } from '@/types/crm';

export default async function DashboardVisitasPage() {
  const session = await getSessionContext();
  const db = getTenantDb(session.tenantId);

  const visits = await db.visits.list();
  const properties = (await db.properties.list({ pageSize: 100 })).data;
  const propMap = new Map(properties.map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="h-6 w-6 text-emerald-600" />
          <span>Agenda de Citas y Visitas Presenciales</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Citas agendadas por prospectos interesados directamente desde las fichas técnicas del portal inmobiliario.
        </p>
      </div>

      {/* Visits List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Visitas Programadas</h2>
          <span className="text-xs text-slate-500">{visits.length} citas registradas</span>
        </div>

        {visits.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {visits.map((v) => {
              const prop = propMap.get(v.propertyId);
              const visitDate = new Date(v.scheduledAt);
              const isPast = visitDate.getTime() < Date.now();

              return (
                <div key={v.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{visitDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{visitDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      Inmueble: {prop?.title || 'Propiedad'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{v.visitorName}</span>
                      </span>
                      <a
                        href={`https://wa.me/${v.visitorPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{v.visitorPhone}</span>
                      </a>
                      {v.visitorEmail && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{v.visitorEmail}</span>
                        </span>
                      )}
                    </div>

                    {v.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-xl">
                        Nota: "{v.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        v.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {v.status === 'CONFIRMED'
                        ? 'Confirmada'
                        : v.status === 'COMPLETED'
                        ? 'Completada'
                        : 'Programada'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs">
            No hay visitas agendadas por el momento.
          </div>
        )}
      </div>
    </div>
  );
}

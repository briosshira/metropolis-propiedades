'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Sparkles,
  Banknote,
  Eye,
  MessageCircle,
  Calendar,
  ShieldCheck,
  FileText,
  FileUp,
  PlusCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  CreditCard,
  Download,
} from 'lucide-react';
import { getCaptadorDashboardDataAction, type CaptadorDashboardPayload } from '@/actions/legal';
import { BrokerageAgreementModal } from '@/components/portal/BrokerageAgreementModal';
import { DocumentUploadModal } from '@/components/portal/DocumentUploadModal';
import type { CaptadorPropertyStat } from '@/types/crm';

export default function MisPropiedadesDashboardPage() {
  const [data, setData] = useState<CaptadorDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedStat, setSelectedStat] = useState<CaptadorPropertyStat | null>(null);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await getCaptadorDashboardDataAction();
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center space-y-2">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Cargando tus propiedades y métricas...</p>
        </div>
      </div>
    );
  }

  const { stats, totals, commissions } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Portal de Afiliados & Captadores</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">
            Mis Propiedades & Comisiones Blindadas
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitorea el rendimiento de tus terrenos y casas, consulta prospectos interesados y descarga tus convenios legales.
          </p>
        </div>

        <Link
          href="/publicar"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Publicar Otra Propiedad</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Inmuebles Activos
          </span>
          <span className="mt-1 text-2xl font-black text-slate-900 block">
            {totals.propertiesCount}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Registrados con tu cuenta</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Comisiones Cobradas
            </span>
            <Banknote className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="mt-1 text-2xl font-black text-emerald-950 block">
            ${totals.earnedCommission.toLocaleString('es-MX')} MXN
          </span>
          <span className="text-[10px] text-emerald-700 mt-1 block">Depositadas vía SPEI</span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Comisión en Trámite
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <span className="mt-1 text-2xl font-black text-amber-950 block">
            ${totals.pendingCommission.toLocaleString('es-MX')} MXN
          </span>
          <span className="text-[10px] text-amber-700 mt-1 block">En proceso de cierre notarial</span>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider block">
              Impacto Comercial
            </span>
            <Eye className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black text-indigo-950">
              {totals.totalLeads} Leads
            </span>
            <span className="text-xs text-indigo-700">/ {totals.totalVisits} Citas</span>
          </div>
          <span className="text-[10px] text-indigo-700 mt-1 block">Interesados reales en el CRM</span>
        </div>
      </div>

      {/* Properties List with Live Metrics */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Tus Inmuebles en Promoción ({stats.length})
        </h2>

        {stats.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {stats.map((item) => {
              const { property, views, whatsappClicks, visitsCount, leadsCount, agreement, legalDocuments } = item;
              const cover = property.media[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80';
              const hasAgreement = !!agreement;
              const hasDeed = legalDocuments.some((d) => d.type === 'DEED');
              const hasPredial = legalDocuments.some((d) => d.type === 'TAX_RECEIPT');

              return (
                <div
                  key={property.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image & Main Info */}
                    <div className="flex gap-4 sm:w-80 shrink-0">
                      <img
                        src={cover}
                        alt={property.title}
                        className="h-28 w-36 rounded-2xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                            {property.propertyType} • {property.operationType}
                          </span>
                          <h3 className="mt-1 text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                            {property.title}
                          </h3>
                        </div>

                        <div className="mt-2 text-base font-black text-emerald-700">
                          ${property.price.toLocaleString('es-MX')} {property.currency}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Live Analytics Row */}
                    <div className="flex-1 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between space-y-4">
                      {/* Status Badges & Folio */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {property.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Publicada en Portal</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              <span>En Revisión por Asesor</span>
                            </span>
                          )}

                          {hasAgreement ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-mono font-bold text-white shadow-sm">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Folio: {agreement.folio}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
                              Pendiente de Convenio
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          Tu Comisión: {property.captadorCommissionPct}% ({property.exclusivityType === 'EXCLUSIVE' ? 'Exclusiva' : 'No Exclusiva'})
                        </span>
                      </div>

                      {/* 4 Performance Metric Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                            Vistas Web
                          </span>
                          <span className="font-bold text-slate-900 text-sm flex items-center gap-1 mt-0.5">
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            {views}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                            Clics WhatsApp
                          </span>
                          <span className="font-bold text-emerald-700 text-sm flex items-center gap-1 mt-0.5">
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                            {whatsappClicks}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                            Visitas Agendadas
                          </span>
                          <span className="font-bold text-indigo-700 text-sm flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                            {visitsCount}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                            Leads Calificados
                          </span>
                          <span className="font-bold text-slate-900 text-sm flex items-center gap-1 mt-0.5">
                            {leadsCount}
                          </span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        {/* Legal documents compliance pill */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">Expediente Legal:</span>
                          <span className={hasDeed ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                            {hasDeed ? '✓ Escritura' : '○ Sin Escritura'}
                          </span>
                          <span>•</span>
                          <span className={hasPredial ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                            {hasPredial ? '✓ Predial' : '○ Sin Predial'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStat(item);
                              setIsDocModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            <FileUp className="h-3.5 w-3.5 text-slate-500" />
                            <span>Expediente / Papeles</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStat(item);
                              setIsAgreementModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>{hasAgreement ? 'Ver Convenio Firmado' : 'Firmar Convenio'}</span>
                          </button>

                          {hasAgreement && (
                            <Link
                              href={`/convenios/${agreement.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-sm"
                              title="Descargar Contrato Oficial en PDF"
                            >
                              <Download className="h-3.5 w-3.5 text-emerald-700" />
                              <span>PDF</span>
                            </Link>
                          )}

                          <Link
                            href={`/propiedades/${property.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-3 text-base font-bold text-slate-900">
              Aún no tienes inmuebles registrados
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Publica un terreno, casa o departamento en venta o renta para comenzar a generar comisiones.
            </p>
            <Link
              href="/publicar"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Publicar mi Primera Propiedad</span>
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedStat && (
        <>
          <BrokerageAgreementModal
            property={selectedStat.property}
            isOpen={isAgreementModalOpen}
            onClose={() => {
              setIsAgreementModalOpen(false);
              loadData();
            }}
            existingAgreement={selectedStat.agreement}
          />

          <DocumentUploadModal
            property={selectedStat.property}
            isOpen={isDocModalOpen}
            onClose={() => {
              setIsDocModalOpen(false);
              loadData();
            }}
            existingDocuments={selectedStat.legalDocuments}
            onDocumentUploaded={loadData}
          />
        </>
      )}
    </div>
  );
}

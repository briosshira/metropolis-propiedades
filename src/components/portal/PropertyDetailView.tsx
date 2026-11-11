'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Maximize2,
  BedDouble,
  Bath,
  Car,
  CheckCircle2,
  Calendar,
  Share2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Compass,
  Layers,
  Lock,
  CreditCard,
  Clock,
  Images,
} from 'lucide-react';
import type { PropertyWithMedia } from '@/types/crm';
import { InquiryForm } from './InquiryForm';
import { VisitSchedulerModal } from './VisitSchedulerModal';
import { PropertyMap } from './PropertyMap';
import { VirtualTourViewer } from './VirtualTourViewer';
import { FloorPlanViewerModal } from './FloorPlanViewerModal';
import { PropertyReservationModal } from './PropertyReservationModal';

interface PropertyDetailViewProps {
  property: PropertyWithMedia;
}

export function PropertyDetailView({ property }: PropertyDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(
    property.media[0]?.url ||
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'
  );
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'tour360' | 'floorplans'>('photos');
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isFloorPlansOpen, setIsFloorPlansOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const depositAmount =
    property.reservationDeposit ||
    (property.operationType === 'RENTA' ? 12000 : 25000);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Navigation / Breadcrumbs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al catálogo</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>{copied ? '¡Enlace copiado!' : 'Compartir Ficha'}</span>
        </button>
      </div>

      {/* Main Grid: Gallery & Info vs Sticky Form */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (2 Cols): Gallery, Details, Description, Features */}
        <div className="lg:col-span-2 space-y-8">
          {/* Multimedia Mode Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveMediaTab('photos')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeMediaTab === 'photos'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Images className="h-4 w-4 text-emerald-400" />
              <span>Fotos ({property.media.length})</span>
            </button>

            {property.virtualTourUrl && (
              <button
                onClick={() => setActiveMediaTab('tour360')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeMediaTab === 'tour360'
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30'
                    : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Compass className="h-4 w-4 text-emerald-500" />
                <span>Recorrido 360° Interactivo</span>
              </button>
            )}

            {property.floorPlans && property.floorPlans.length > 0 && (
              <button
                onClick={() => {
                  setActiveMediaTab('floorplans');
                  setIsFloorPlansOpen(true);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeMediaTab === 'floorplans'
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-700/30'
                    : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200'
                }`}
              >
                <Layers className="h-4 w-4 text-blue-500" />
                <span>Planos Arquitectónicos ({property.floorPlans.length})</span>
              </button>
            )}
          </div>

          {/* Active Media Container */}
          {activeMediaTab === 'tour360' && property.virtualTourUrl ? (
            <VirtualTourViewer
              tourUrl={property.virtualTourUrl}
              propertyTitle={property.title}
            />
          ) : activeMediaTab === 'floorplans' && property.floorPlans && property.floorPlans.length > 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Planos Arquitectónicos y Distribución</h3>
                  <p className="text-xs text-slate-500">Haz clic en cualquier plano para abrir el visor con zoom de alta resolución</p>
                </div>
                <button
                  onClick={() => setIsFloorPlansOpen(true)}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Abrir Visor Completo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.floorPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setIsFloorPlansOpen(true)}
                    className="cursor-pointer group rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-md hover:border-emerald-500 transition-all"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-slate-900">
                      <img
                        src={plan.url}
                        alt={plan.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <strong className="text-xs text-slate-900 block font-bold">{plan.title}</strong>
                      <span className="text-[11px] text-slate-500">{plan.level || 'Plano de Planta'} {plan.area ? `• ${plan.area} m²` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Standard Image Gallery */
            <div className="space-y-3">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-lg border border-slate-200/80">
                <img
                  src={selectedImage}
                  alt={property.title}
                  className="h-full w-full object-cover transition-all duration-300"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md ${
                      property.operationType === 'VENTA' ? 'bg-emerald-600' : 'bg-blue-600'
                    }`}
                  >
                    {property.operationType}
                  </span>
                  <span className="rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {property.propertyType}
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {property.media.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {property.media.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.url)}
                      className={`relative aspect-[16/10] h-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        selectedImage === img.url
                          ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="thumbnail" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title, Location & Price */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                {property.address ? `${property.address}, ` : ''}
                {property.neighborhood ? `${property.neighborhood}, ` : ''}
                {property.city}, {property.state}
              </span>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {property.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-700">
                {formatPrice(property.price, property.currency)}
              </span>
              {property.operationType === 'RENTA' && (
                <span className="text-sm font-semibold text-slate-500">mensuales</span>
              )}
              <span className="text-xs text-slate-400">({property.currency})</span>
            </div>
          </div>

          {/* Property Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl bg-slate-50 p-5 border border-slate-200/70">
            {property.landArea && (
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Área de Terreno
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-base font-bold text-slate-900">
                  <Maximize2 className="h-4 w-4 text-emerald-600" />
                  <span>{property.landArea} m²</span>
                </div>
              </div>
            )}

            {property.constructionArea && (
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Construcción
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-base font-bold text-slate-900">
                  <Maximize2 className="h-4 w-4 text-emerald-600" />
                  <span>{property.constructionArea} m²</span>
                </div>
              </div>
            )}

            {property.bedrooms > 0 && (
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Recámaras
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-base font-bold text-slate-900">
                  <BedDouble className="h-4 w-4 text-emerald-600" />
                  <span>{property.bedrooms}</span>
                </div>
              </div>
            )}

            {property.bathrooms > 0 && (
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Baños
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-base font-bold text-slate-900">
                  <Bath className="h-4 w-4 text-emerald-600" />
                  <span>{property.bathrooms}</span>
                </div>
              </div>
            )}

            {property.parkingSpaces > 0 && (
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Estacionamientos
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-base font-bold text-slate-900">
                  <Car className="h-4 w-4 text-emerald-600" />
                  <span>{property.parkingSpaces}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Descripción del Inmueble</h2>
            <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </div>
          </div>

          {/* Features / Amenities */}
          {property.features && property.features.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Amenidades y Características</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {property.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white p-2.5 text-xs font-medium text-slate-800 shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Map Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Ubicación y Entorno</h2>
              <span className="text-xs text-slate-500 font-semibold">{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}, {property.state}</span>
            </div>
            <PropertyMap singleProperty={property} className="h-80 w-full" zoom={14} />
            <p className="text-[11px] text-slate-400">
              * Por seguridad del propietario y del captador, el mapa muestra el perímetro y cuadrante aproximado. Al confirmar tu cita presencial con el asesor asignado, te compartiremos las coordenadas y ruta exacta.
            </p>
          </div>

          {/* Affiliate Commission Transparency Callout */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-md shadow-emerald-600/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  ¿Conoces a un comprador para esta propiedad?
                </h3>
                <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                  En nuestra plataforma compartimos hasta el <strong>{property.captadorCommissionPct}%</strong> de la comisión con la persona que traiga al comprador o haya captado el inmueble. Contáctanos para registrar a tu cliente y proteger tu comisión por escrito.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Convenio formal de comisión compartida</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Sticky Contact & Booking Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-20 space-y-6">
            {/* Apartado Inmediato Online Card (Stripe / SPEI) */}
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              {property.isReserved ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/40">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Inmueble Apartado</span>
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Apartado Activo en Proceso
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Un comprador ha congelado este inmueble con depósito de garantía. Si el trámite no se formaliza, volverá a estar disponible automáticamente.
                  </p>
                  <button
                    onClick={() => setIsSchedulerOpen(true)}
                    className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-200 transition-colors"
                  >
                    Anotarme en Lista de Espera
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Apartado en Línea</span>
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      72 hrs protegidas
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-300 block">Depósito de Garantía</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-white">
                        {formatPrice(depositAmount, property.currency)}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">
                        ({property.currency})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      100% deducible de tu enganche final
                    </span>
                  </div>

                  <button
                    onClick={() => setIsReservationOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-3.5 px-4 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Apartar Inmueble Ahora</span>
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      Reembolso garantizado
                    </span>
                    <span>•</span>
                    <span>Stripe & SPEI</span>
                  </div>
                </div>
              )}
            </div>

            <InquiryForm
              property={property}
              onOpenScheduler={() => setIsSchedulerOpen(true)}
            />

            {/* Quick Incentive Sidebar Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>Gana con nosotros</span>
              </div>
              <h4 className="mt-2 text-sm font-bold">¿Tienes un terreno similar en venta?</h4>
              <p className="mt-1 text-xs text-slate-300">
                Súbelo a nuestra plataforma. Cero costo de publicación y tú ganas tu porcentaje al cerrarse el trato.
              </p>
              <Link
                href="/publicar"
                className="mt-4 block w-full rounded-xl bg-emerald-500 py-2.5 text-center text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                Publicar mi Terreno o Casa
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Agendador de Visitas */}
      <VisitSchedulerModal
        property={property}
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
      />

      {/* Modal Visor de Planos Arquitectónicos */}
      {property.floorPlans && property.floorPlans.length > 0 && (
        <FloorPlanViewerModal
          isOpen={isFloorPlansOpen}
          onClose={() => setIsFloorPlansOpen(false)}
          floorPlans={property.floorPlans}
          propertyTitle={property.title}
        />
      )}

      {/* Modal Apartado Inmediato con Stripe / SPEI */}
      <PropertyReservationModal
        property={property}
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />
    </div>
  );
}

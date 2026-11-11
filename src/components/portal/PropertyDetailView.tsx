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
} from 'lucide-react';
import type { PropertyWithMedia } from '@/types/crm';
import { InquiryForm } from './InquiryForm';
import { VisitSchedulerModal } from './VisitSchedulerModal';
import { PropertyMap } from './PropertyMap';

interface PropertyDetailViewProps {
  property: PropertyWithMedia;
}

export function PropertyDetailView({ property }: PropertyDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(
    property.media[0]?.url ||
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'
  );
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
          {/* Gallery View */}
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
    </div>
  );
}

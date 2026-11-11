import Link from 'next/link';
import { MapPin, Maximize2, BedDouble, Bath, Car, ArrowUpRight } from 'lucide-react';
import type { PropertyWithMedia } from '@/types/crm';

interface PropertyCardProps {
  property: PropertyWithMedia;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const coverImage =
    property.media.find((m) => m.isCover)?.url ||
    property.media[0]?.url ||
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const typeLabels: Record<string, string> = {
    TERRENO: 'Terreno / Lote',
    CASA: 'Casa Residencial',
    DEPARTAMENTO: 'Departamento',
    LOCAL_COMERCIAL: 'Local Comercial',
    BODEGA: 'Bodega Industrial',
    OFICINA: 'Oficina Corporativa',
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      {/* Media & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Badges top */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md ${
              property.operationType === 'VENTA' ? 'bg-emerald-600/90' : 'bg-blue-600/90'
            }`}
          >
            {property.operationType}
          </span>
          <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-slate-100 backdrop-blur-md">
            {typeLabels[property.propertyType] || property.propertyType}
          </span>
        </div>

        {property.featured && (
          <div className="absolute top-3 right-3">
            <span className="rounded-full bg-amber-500/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              ★ Destacado
            </span>
          </div>
        )}

        {/* Bottom Price on image */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-xl font-extrabold tracking-tight drop-shadow-sm">
            {formatPrice(property.price, property.currency)}
            {property.operationType === 'RENTA' && (
              <span className="text-xs font-normal text-slate-200"> /mes</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="truncate">
            {property.neighborhood ? `${property.neighborhood}, ` : ''}
            {property.city}, {property.state}
          </span>
        </div>

        <h3 className="mt-2 text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
          {property.title}
        </h3>

        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {property.description}
        </p>

        {/* Key Specs */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-700">
          {property.landArea ? (
            <div className="flex items-center gap-1.5" title="Superficie de terreno">
              <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
              <span>{property.landArea} m² Terr.</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5" title="Construcción">
              <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
              <span>{property.constructionArea || 0} m²</span>
            </div>
          )}

          {property.bedrooms > 0 ? (
            <div className="flex items-center gap-1.5" title="Recámaras">
              <BedDouble className="h-3.5 w-3.5 text-slate-400" />
              <span>{property.bedrooms} Rec.</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400" title="Uso de suelo">
              <span>Lote plano</span>
            </div>
          )}

          {property.bathrooms > 0 ? (
            <div className="flex items-center gap-1.5" title="Baños">
              <Bath className="h-3.5 w-3.5 text-slate-400" />
              <span>{property.bathrooms} Baños</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Servicios</span>
            </div>
          )}
        </div>

        {/* Footer / CTA */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            Comisión garantizada
          </span>

          <Link
            href={`/propiedades/${property.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors"
          >
            <span>Ver detalle</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

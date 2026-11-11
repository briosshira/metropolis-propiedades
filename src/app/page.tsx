import Link from 'next/link';
import { Navbar } from '@/components/portal/Navbar';
import { HeroSearch } from '@/components/portal/HeroSearch';
import { PropertyCard } from '@/components/portal/PropertyCard';
import { IncentiveBanner } from '@/components/portal/IncentiveBanner';
import { getPublicPropertiesAction } from '@/actions/properties';
import { Sparkles, Building2, Trees, ShieldCheck, HelpCircle } from 'lucide-react';
import type { PropertyType, OperationType } from '@/types/crm';

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    operacion?: string;
    tipo?: string;
    ciudad?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;

  const result = await getPublicPropertiesAction({
    search: resolvedParams.q,
    operationType: resolvedParams.operacion ? (resolvedParams.operacion as OperationType) : undefined,
    propertyType: resolvedParams.tipo ? (resolvedParams.tipo as PropertyType) : undefined,
    city: resolvedParams.ciudad,
    pageSize: 12,
  });

  const properties = result.data?.data || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero & Interactive Search */}
      <HeroSearch />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* Catalog Section */}
        <section id="catalogo" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Catálogo Inmobiliario</span>
              </div>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
                Inmuebles y Terrenos Disponibles
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Mostrando {properties.length} propiedades verificadas
            </span>
          </div>

          {/* Grid of properties */}
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-3 text-base font-bold text-slate-900">
                No se encontraron inmuebles con estos filtros
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Intenta ajustar la búsqueda o limpia los filtros para ver todos los terrenos y casas.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
              >
                Ver todo el catálogo
              </Link>
            </div>
          )}
        </section>

        {/* Incentive & Commission Program Banner */}
        <IncentiveBanner />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Building2 className="h-4 w-4 text-emerald-700" />
            <span>Metropolis Propiedades & CRM</span>
          </div>
          <p>© {new Date().getFullYear()} Metropolis Propiedades. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/publicar" className="hover:text-emerald-700 font-medium">Publicar Inmueble</Link>
            <Link href="/leads" className="hover:text-emerald-700 font-medium">Panel CRM Asesores</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

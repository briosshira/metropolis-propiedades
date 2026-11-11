import Link from 'next/link';
import { Navbar } from '@/components/portal/Navbar';
import { HeroSearch } from '@/components/portal/HeroSearch';
import { CatalogViewToggle } from '@/components/portal/CatalogViewToggle';
import { IncentiveBanner } from '@/components/portal/IncentiveBanner';
import { getPublicPropertiesAction } from '@/actions/properties';
import { Building2 } from 'lucide-react';
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
        {/* Catalog Section with Grid / Map Toggle */}
        <section id="catalogo" className="scroll-mt-24">
          <CatalogViewToggle properties={properties} />
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

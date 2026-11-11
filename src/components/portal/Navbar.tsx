import Link from 'next/link';
import { Building2, PlusCircle, LayoutDashboard, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-amber-500 text-white shadow-md shadow-emerald-700/25 group-hover:scale-105 transition-transform">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
              Metropolis<span className="text-emerald-700">Propiedades</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-600 block">
              Portal & CRM de Comisiones
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <Link href="/?tipo=TERRENO" className="hover:text-emerald-600 transition-colors">
            Terrenos
          </Link>
          <Link href="/?operacion=VENTA" className="hover:text-emerald-600 transition-colors">
            En Venta
          </Link>
          <Link href="/?operacion=RENTA" className="hover:text-emerald-600 transition-colors">
            En Renta
          </Link>
          <Link
            href="/publicar"
            className="flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-800 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Gana Comisiones
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/publicar"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all hover:shadow-md hover:shadow-emerald-600/20 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Publicar y Ganar</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Ingresar al CRM o Portal de Afiliados"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Iniciar Sesión / CRM</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

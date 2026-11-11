import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Kanban,
  Table,
  Users,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Banknote,
  Calendar,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white block">
                  Metropolis<span className="text-emerald-400">Propiedades</span>
                </span>
                <span className="text-[10px] text-amber-400 uppercase tracking-widest block font-bold">
                  CRM & Comisiones
                </span>
              </div>
            </div>
          </div>

          {/* Active Tenant Context Card */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Inmobiliaria
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                En Línea
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  Inmobiliaria Premier
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  premier-realestate
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-6">
            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Embudo de Leads
              </p>
              <div className="space-y-1">
                <Link
                  href="/leads?view=kanban"
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Kanban className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                    <span>Embudo Kanban</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Ventas
                  </span>
                </Link>

                <Link
                  href="/leads?view=table"
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Table className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                    <span>Tabla Prospectos</span>
                  </div>
                </Link>

                <Link
                  href="/leads?view=contacts"
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                    <span>Directorio Contactos</span>
                  </div>
                </Link>
              </div>
            </div>

            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Inmuebles & Comisiones
              </p>
              <div className="space-y-1">
                <Link
                  href="/dashboard/mis-propiedades"
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 transition" />
                    <span className="font-bold">Panel de Captador</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
                    Mis Ganancias
                  </span>
                </Link>

                <Link
                  href="/dashboard/propiedades"
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                    <span>Inventario Inmuebles</span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/comisiones"
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Banknote className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                    <span>Comisiones y Pagos</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    Reparto
                  </span>
                </Link>

                <Link
                  href="/dashboard/visitas"
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                    <span>Citas y Visitas</span>
                  </div>
                </Link>
              </div>
            </div>

            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Portal Público
              </p>
              <div className="space-y-1">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                    <span>Ver Portal Web</span>
                  </div>
                </Link>

                <Link
                  href="/publicar"
                  target="_blank"
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-emerald-800 hover:bg-emerald-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="h-4 w-4 text-emerald-600" />
                    <span>Publicar Inmueble</span>
                  </div>
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-600 text-xs shadow-sm">
            <Lock className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Seguridad
              </span>
              <span className="font-semibold text-slate-700">Supabase RLS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500">
              CD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">
                Carlos Director
              </p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> Rol: Owner / Admin
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-emerald-600" />
              Gestión Integral Inmobiliaria
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Metropolis Real Estate Workspace
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-5 border-r border-slate-200 pr-6">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                  Captadores Activos
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Comisión Compartida Habilitada
                </span>
              </div>
              <div className="h-7 w-px bg-slate-200"></div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                  Base de Datos
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Supabase Ready
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold">Tenant:</span>
              <span className="font-mono text-[11px]">premier-realestate</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 md:p-8 bg-slate-50 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

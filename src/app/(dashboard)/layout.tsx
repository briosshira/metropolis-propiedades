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
  Banknote,
  Calendar,
  ExternalLink,
  PlusCircle,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { getSessionContext } from '@/db/client';
import { RoleSwitcher } from '@/components/dashboard/RoleSwitcher';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSessionContext();
  const role = session.userRole;
  const isCaptador = role === 'captador';
  const isAgent = role === 'agent';
  const isOwner = role === 'owner' || role === 'admin';

  let userProfile = {
    name: 'Carlos Director',
    roleTitle: 'Director General',
    roleBadge: 'Admin / Owner',
    initials: 'CD',
    avatarBg: 'bg-slate-900 ring-2 ring-amber-500',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    roleIcon: '👑',
  };

  if (isCaptador) {
    userProfile = {
      name: 'Juan Afiliado',
      roleTitle: 'Aliado Comercial',
      roleBadge: 'Afiliado / Captador',
      initials: 'JA',
      avatarBg: 'bg-emerald-700 ring-2 ring-emerald-400',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      roleIcon: '🌟',
    };
  } else if (isAgent) {
    userProfile = {
      name: 'Lucía Asesora',
      roleTitle: 'Asesora Inmobiliaria',
      roleBadge: 'Asesor Comercial',
      initials: 'LA',
      avatarBg: 'bg-indigo-700 ring-2 ring-indigo-400',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      roleIcon: '💼',
    };
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-slate-900 text-white">
            <Link href="/" className="flex items-center gap-3">
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
            </Link>
          </div>

          {/* Active Tenant & User Profile Badge Card */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Sesión Activa
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${userProfile.badgeColor}`}
              >
                <span>{userProfile.roleIcon}</span>
                <span>{userProfile.roleBadge}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full text-white flex items-center justify-center font-bold text-xs ${userProfile.avatarBg}`}
              >
                {userProfile.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {userProfile.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {userProfile.roleTitle}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links (Role Adaptive) */}
          <nav className="p-3 space-y-6">
            {/* 1. MÓDULO EXCLUSIVO PARA CAPTADOR / AFILIADO */}
            {isCaptador && (
              <div>
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2">
                  Portal de Afiliado
                </p>
                <div className="space-y-1">
                  <Link
                    href="/dashboard/mis-propiedades"
                    className="flex items-center justify-between px-3 py-2 text-sm font-bold rounded-lg text-emerald-950 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-200 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Mis Propiedades & Métricas</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">
                      Activo
                    </span>
                  </Link>

                  <Link
                    href="/dashboard/comisiones"
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
                      <span>Mis Comisiones por Cobrar</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                      SPEI
                    </span>
                  </Link>

                  <Link
                    href="/publicar"
                    target="_blank"
                    className="flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg text-emerald-800 hover:bg-emerald-50 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlusCircle className="h-4 w-4 text-emerald-600" />
                      <span>Publicar Nuevo Inmueble</span>
                    </div>
                    <span className="text-[10px] text-amber-600 font-bold">+35%</span>
                  </Link>

                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                      <span>Ver Catálogo Público</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* 2. MÓDULO PARA ASESOR COMERCIAL */}
            {isAgent && (
              <div>
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-indigo-800 mb-2">
                  Gestión Comercial de Ventas
                </p>
                <div className="space-y-1">
                  <Link
                    href="/leads?view=kanban"
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/60 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Kanban className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition" />
                      <span>Embudo Kanban</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                      Prospectos
                    </span>
                  </Link>

                  <Link
                    href="/leads?view=table"
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/60 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Table className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition" />
                      <span>Tabla Prospectos</span>
                    </div>
                  </Link>

                  <Link
                    href="/leads?view=contacts"
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/60 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition" />
                      <span>Directorio Contactos</span>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/visitas"
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/60 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition" />
                      <span>Citas y Visitas</span>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/propiedades"
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/60 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition" />
                      <span>Inventario Inmuebles</span>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/comisiones"
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/60 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition" />
                      <span>Mis Comisiones de Asesor</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* 3. MÓDULO PARA ADMINISTRADOR / OWNER (TODO EL SISTEMA) */}
            {isOwner && (
              <>
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

                    <Link
                      href="/dashboard/mis-propiedades"
                      className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-emerald-800 hover:bg-emerald-50 transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 transition" />
                        <span>Vista de Captadores</span>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/analytics"
                      className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/60 transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition" />
                        <span>Analytics & Métricas</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                        KPIs
                      </span>
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
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer (Dynamic User Info) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-md bg-white border border-slate-200 text-slate-600 text-xs shadow-sm">
            <Lock className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Seguridad Multi-Tenant
              </span>
              <span className="font-semibold text-slate-700">Supabase RLS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow ${userProfile.avatarBg}`}
            >
              {userProfile.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {userProfile.name}
              </p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                <span className="truncate">Rol: {userProfile.roleBadge}</span>
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Interactive Role Switcher */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-emerald-600" />
              <span>{isCaptador ? 'Portal del Aliado / Captador' : isAgent ? 'Panel de Asesor Comercial' : 'Gestión Integral Inmobiliaria'}</span>
            </h1>
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Metropolis Real Estate Workspace
            </span>
          </div>

          {/* Interactive Role Switcher in Header */}
          <div className="flex items-center gap-3">
            <RoleSwitcher activeRole={session.userRole} userName={userProfile.name} />

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold">Tenant:</span>
              <span className="font-mono text-[11px]">premier</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-slate-50 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

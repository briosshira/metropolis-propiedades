'use client';

import { useState } from 'react';
import { Sparkles, Check, Loader2, LogOut } from 'lucide-react';
import { switchDemoRoleAction, logoutAction } from '@/actions/auth';
import type { UserRole } from '@/types/crm';

interface RoleSwitcherProps {
  activeRole: UserRole;
  userName?: string;
}

export function RoleSwitcher({ activeRole, userName }: RoleSwitcherProps) {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleSwitch = async (role: 'owner' | 'agent' | 'captador') => {
    if (role === activeRole) return;
    setLoadingRole(role);

    try {
      await switchDemoRoleAction(role);
      // Hard navigation to force SSR layout reload with the new user session cookies
      if (role === 'captador') {
        window.location.href = '/dashboard/mis-propiedades';
      } else if (role === 'agent') {
        window.location.href = '/leads';
      } else {
        window.location.href = '/dashboard/analytics';
      }
    } catch (err) {
      console.error('Error switching demo role:', err);
      setLoadingRole(null);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Switcher Pill Group */}
      <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-inner">
        <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 px-2.5">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Perfil Demo:</span>
        </span>

        {/* 1. Captador */}
        <button
          type="button"
          onClick={() => handleSwitch('captador')}
          disabled={loadingRole !== null}
          title="Vista de Aliado / Propietario que publica inmuebles y gana comisión"
          className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeRole === 'captador'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-1 ring-emerald-500'
              : 'text-slate-600 hover:text-emerald-800 hover:bg-white/80'
          }`}
        >
          {loadingRole === 'captador' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : activeRole === 'captador' ? (
            <Check className="h-3.5 w-3.5 text-emerald-200" />
          ) : (
            <span className="text-[10px]">🌟</span>
          )}
          <span>Captador</span>
          <span className="hidden sm:inline text-[10px] opacity-80">(Juan)</span>
        </button>

        {/* 2. Asesor */}
        <button
          type="button"
          onClick={() => handleSwitch('agent')}
          disabled={loadingRole !== null}
          title="Vista de Asesor Comercial interno que atiende prospectos y cierra ventas"
          className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeRole === 'agent'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 ring-1 ring-indigo-500'
              : 'text-slate-600 hover:text-indigo-800 hover:bg-white/80'
          }`}
        >
          {loadingRole === 'agent' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : activeRole === 'agent' ? (
            <Check className="h-3.5 w-3.5 text-indigo-200" />
          ) : (
            <span className="text-[10px]">💼</span>
          )}
          <span>Asesor</span>
          <span className="hidden sm:inline text-[10px] opacity-80">(Lucía)</span>
        </button>

        {/* 3. Admin / Owner */}
        <button
          type="button"
          onClick={() => handleSwitch('owner')}
          disabled={loadingRole !== null}
          title="Vista de Director General con acceso a métricas, comisiones globales y configuración"
          className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeRole === 'owner' || activeRole === 'admin'
              ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/30 ring-1 ring-slate-700'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          {loadingRole === 'owner' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : activeRole === 'owner' || activeRole === 'admin' ? (
            <Check className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <span className="text-[10px]">👑</span>
          )}
          <span>Admin</span>
          <span className="hidden sm:inline text-[10px] opacity-80">(Carlos)</span>
        </button>
      </div>

      {/* Logout button */}
      <button
        type="button"
        onClick={handleLogout}
        title="Cerrar sesión / Salir"
        className="inline-flex items-center p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { loginAction, registerAction, switchDemoRoleAction } from '@/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [roleType, setRoleType] = useState<'captador' | 'agent'>('captador');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleQuickSwitch = async (role: 'owner' | 'agent' | 'captador') => {
    setLoading(true);
    await switchDemoRoleAction(role);
    setLoading(false);
    if (role === 'captador') {
      router.push('/dashboard/comisiones');
    } else {
      router.push('/leads');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('roleType', roleType);

    if (mode === 'register') {
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('role', roleType);
      const res = await registerAction(formData);
      setLoading(false);
      if (res.success && res.data) {
        router.push(res.data.redirectUrl);
      } else {
        setErrorMessage(res.error || 'Error al crear cuenta.');
      }
    } else {
      const res = await loginAction(formData);
      setLoading(false);
      if (res.success && res.data) {
        router.push(res.data.redirectUrl);
      } else {
        setErrorMessage(res.error || 'Credenciales inválidas.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-amber-500 text-white shadow-md shadow-emerald-700/25">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Metropolis<span className="text-emerald-700">Propiedades</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
          {mode === 'login' ? 'Iniciar Sesión en el Portal & CRM' : 'Crear Cuenta en el Portal'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Control de propiedades, prospectos y pago de comisiones
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        {/* Quick Demo Switcher Card */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Acceso Rápido Demo (Prueba los 3 roles con 1 clic):</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSwitch('captador')}
              disabled={loading}
              className="rounded-xl border border-emerald-300 bg-white p-2 text-center font-bold text-emerald-800 shadow-sm hover:bg-emerald-100/50 transition-colors"
            >
              <span className="block text-[10px] text-slate-500 font-normal">Afiliado</span>
              Captador
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('agent')}
              disabled={loading}
              className="rounded-xl border border-emerald-300 bg-white p-2 text-center font-bold text-indigo-800 shadow-sm hover:bg-indigo-50 transition-colors"
            >
              <span className="block text-[10px] text-slate-500 font-normal">Ventas</span>
              Asesor
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('owner')}
              disabled={loading}
              className="rounded-xl border border-emerald-300 bg-white p-2 text-center font-bold text-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
            >
              <span className="block text-[10px] text-slate-500 font-normal">Control</span>
              Admin
            </button>
          </div>
        </div>

        {/* Main Auth Box */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          {/* Role selector tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRoleType('captador')}
              className={`flex-1 rounded-lg py-2 transition-colors ${
                roleType === 'captador'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌟 Captador / Propietario
            </button>
            <button
              type="button"
              onClick={() => setRoleType('agent')}
              className={`flex-1 rounded-lg py-2 transition-colors ${
                roleType === 'agent'
                  ? 'bg-white text-indigo-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💼 Asesor de Ventas
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">Nombre completo *</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">Correo electrónico *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="55 1234 5678"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">Contraseña *</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <span>{loading ? 'Procesando...' : mode === 'login' ? 'Entrar al Panel' : 'Crear Cuenta'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-600">
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Regístrate aquí
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Inicia sesión aquí
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-emerald-700 transition-colors">
            ← Volver al Portal Inmobiliario
          </Link>
        </div>
      </div>
    </div>
  );
}

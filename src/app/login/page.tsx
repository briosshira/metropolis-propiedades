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
  Mail,
  Send,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loginAction, registerAction, switchDemoRoleAction } from '@/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [authMethod, setAuthMethod] = useState<'password' | 'magic_link'>('password');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [roleType, setRoleType] = useState<'captador' | 'agent'>('captador');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Google OAuth
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=${
        roleType === 'captador' ? '/dashboard/mis-propiedades' : '/leads'
      }`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      setGoogleLoading(false);
      const msg = err instanceof Error ? err.message : 'Error al conectar con Google';
      setErrorMessage(msg);
    }
  };

  // 2. Magic Link (Email OTP)
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=${
        roleType === 'captador' ? '/dashboard/mis-propiedades' : '/leads'
      }`;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: roleType,
          },
        },
      });

      setLoading(false);

      if (error) {
        throw error;
      }

      setMagicLinkSent(true);
      setSuccessMessage(
        `¡Enlace mágico enviado a ${email}! Revisa tu bandeja de entrada o carpeta de spam y haz clic para entrar de inmediato.`
      );
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Error al enviar el enlace mágico';
      setErrorMessage(msg);
    }
  };

  // 3. Quick Demo Switcher
  const handleQuickSwitch = async (role: 'owner' | 'agent' | 'captador') => {
    setLoading(true);
    await switchDemoRoleAction(role);
    setLoading(false);
    if (role === 'captador') {
      router.push('/dashboard/mis-propiedades');
    } else {
      router.push('/leads');
    }
  };

  // 4. Traditional Email & Password (con respaldo a Server Actions)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'register') {
        // Intento directo con Supabase Auth
        const { data: supaData, error: supaError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              name,
              phone,
              role: roleType,
            },
          },
        });

        // Respaldo de cookies de sesión para la demo
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('role', roleType);
        formData.append('password', password);
        await registerAction(formData);

        setLoading(false);
        router.push(roleType === 'captador' ? '/dashboard/mis-propiedades' : '/leads');
      } else {
        // Login con Supabase Auth
        const { error: supaLoginError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('roleType', roleType);
        const res = await loginAction(formData);

        setLoading(false);
        if (res.success && res.data) {
          router.push(res.data.redirectUrl);
        } else {
          setErrorMessage(res.error || 'Credenciales inválidas.');
        }
      }
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Error en autenticación';
      setErrorMessage(msg);
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
          Control de propiedades, prospectos y pago de comisiones con Supabase Auth
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
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200 space-y-5">
          {/* Role selector tabs */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              ¿Cómo deseas participar?
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
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
                💼 Asesor Inmobiliario
              </button>
            </div>
          </div>

          {/* Google OAuth One-Click */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white py-3 px-4 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.27-2.09 3.675-5.17 3.675-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.15C3.25 21.31 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.23 0 10.06 0 12s.46 3.77 1.26 5.39l4.01-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.26 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
              )}
              <span>Continuar con Google</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase">
              O con correo
            </span>
          </div>

          {/* Auth Method Subtabs: Magic Link vs Contraseña */}
          <div className="flex border-b border-slate-100 pb-2 gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('magic_link');
                setErrorMessage('');
              }}
              className={`pb-1 transition-colors ${
                authMethod === 'magic_link'
                  ? 'border-b-2 border-emerald-600 text-emerald-800 font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Enlace Mágico (Sin Contraseña)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setErrorMessage('');
              }}
              className={`pb-1 transition-colors ${
                authMethod === 'password'
                  ? 'border-b-2 border-emerald-600 text-emerald-800 font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {mode === 'login' ? 'Con Contraseña' : 'Crear Cuenta'}
            </button>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {authMethod === 'magic_link' ? (
            /* Magic Link Form */
            <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Tu Correo Electrónico *</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="propietario@correo.com"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Te enviaremos un enlace de acceso seguro a tu correo para entrar sin memorizar claves.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || magicLinkSent}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{magicLinkSent ? 'Enlace Enviado' : 'Enviar Enlace Mágico a mi Correo'}</span>
              </button>
            </form>
          ) : (
            /* Traditional Password Form */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
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
          )}

          {/* Toggle Login / Register */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-600">
                ¿Aún no tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setAuthMethod('password');
                  }}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Regístrate aquí
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                ¿Ya tienes una cuenta creada?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setAuthMethod('password');
                  }}
                  className="font-bold text-emerald-700 hover:underline"
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

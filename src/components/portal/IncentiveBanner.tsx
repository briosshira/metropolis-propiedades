import Link from 'next/link';
import { Sparkles, ShieldCheck, Users, Banknote, ArrowRight } from 'lucide-react';

export function IncentiveBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
      {/* Background glow decoration */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Programa de Afiliados y Captadores Inmobiliarios</span>
        </div>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-4xl leading-tight">
          ¿Tienes un terreno o propiedad? <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            Publícala con nosotros y gana tu comisión
          </span>
        </h2>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Diseñado para que cualquier persona o propietario tenga la confianza de registrar terrenos, casas o bodegas. Nosotros atendemos los prospectos, agendamos visitas y cerramos el trato contigo.
        </p>

        {/* 3 Step highlights */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              1
            </div>
            <h3 className="mt-3 text-sm font-bold text-white">Registra el Inmueble</h3>
            <p className="mt-1 text-xs text-slate-300">
              Sube fotos, precio y detalles de tu terreno o propiedad en 2 minutos desde nuestro portal.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              2
            </div>
            <h3 className="mt-3 text-sm font-bold text-white">Nosotros lo Vendemos</h3>
            <p className="mt-1 text-xs text-slate-300">
              Un asesor profesional atiende a los interesados en el CRM, coordina visitas y negocia el precio.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              3
            </div>
            <h3 className="mt-3 text-sm font-bold text-white">Cobras tu Comisión</h3>
            <p className="mt-1 text-xs text-slate-300">
              Al formalizar la venta o renta en notaría, recibes tu comisión pactada de forma 100% garantizada.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/publicar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Registrar mi Propiedad y Ganar Comisión</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Trámites seguros con contrato de corretaje</span>
          </div>
        </div>
      </div>
    </section>
  );
}

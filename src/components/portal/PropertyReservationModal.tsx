'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ShieldCheck,
  CreditCard,
  Building2,
  Clock,
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import type { PropertyWithMedia } from '@/types/crm';
import { createReservationAction } from '@/actions/reservations';

interface PropertyReservationModalProps {
  property: PropertyWithMedia;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyReservationModal({
  property,
  isOpen,
  onClose,
}: PropertyReservationModalProps) {
  const router = useRouter();

  const depositAmount =
    property.reservationDeposit ||
    (property.operationType === 'RENTA' ? 12000 : 25000);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE_CARD' | 'SPEI' | 'SIMULATION'>('STRIPE_CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const result = await createReservationAction(
        {
          propertyId: property.id,
          clientName,
          clientEmail,
          clientPhone,
          amount: depositAmount,
          paymentMethod,
        },
        origin
      );

      if (!result.success || !result.data) {
        setError(result.error || 'No fue posible procesar el apartado.');
        setIsSubmitting(false);
        return;
      }

      // Si Stripe Checkout devolvió una URL activa (modo real)
      if (result.data.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
        return;
      }

      // Redirigir a la pantalla de comprobante digital oficial de apartado
      router.push(`/reservaciones/exito?folio=${result.data.reservation.folio}`);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado al apartar.');
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: property.currency || 'MXN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400 border border-emerald-500/30">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Apartado Inmediato y Depósito de Garantía
              </h3>
              <p className="text-xs text-emerald-300">
                Congela este inmueble por 72 horas y formaliza tu compraventa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Inmueble Seleccionado
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{property.title}</h4>
              <p className="text-xs text-slate-500">
                {property.city}, {property.state} • Valor total:{' '}
                <strong className="text-slate-800">
                  {formatCurrency(property.price)} {property.currency}
                </strong>
              </p>
            </div>

            <div className="sm:text-right bg-emerald-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Monto de Apartado
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-700">
                {formatCurrency(depositAmount)}
              </p>
              <span className="text-[10px] text-emerald-600 block">
                100% deducible del enganche
              </span>
            </div>
          </div>

          {/* Legal Warranties */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Garantías de Protección al Comprador:</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-emerald-800">
              <li>
                <strong>Bloqueo Exclusivo de 72 Horas:</strong> El inmueble se congela inmediatamente en el catálogo web para que nadie más pueda apartarlo.
              </li>
              <li>
                <strong>Deducción al 100%:</strong> El importe depositado se acredita íntegramente a tu enganche o liquidación final.
              </li>
              <li>
                <strong>Garantía de Reembolso:</strong> Si la propiedad no aprueba el dictamen jurídico o certificado de libertad de gravamen, se reembolsa el 100%.
              </li>
            </ul>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} id="reservation-form" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Completo del Comprador / Titular
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Lic. Fernando Morales Arreola"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico para Recibo
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono / WhatsApp Móvil
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej. 442 345 6789"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700">
                Selecciona la Forma de Pago de la Garantía
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('STRIPE_CARD')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'STRIPE_CARD'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-600/20 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mb-1 text-emerald-600" />
                  <span className="text-xs">Tarjeta Bancaria</span>
                  <span className="text-[10px] text-slate-400">Stripe SSL 256-bit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('SPEI')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'SPEI'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-600/20 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                >
                  <Building2 className="h-5 w-5 mb-1 text-emerald-600" />
                  <span className="text-xs">Transferencia SPEI</span>
                  <span className="text-[10px] text-slate-400">CLABE STP Inmediata</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('SIMULATION')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'SIMULATION'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-600/20 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                >
                  <Sparkles className="h-5 w-5 mb-1 text-emerald-600" />
                  <span className="text-xs">Modo Prueba Demo</span>
                  <span className="text-[10px] text-slate-400">Confirmación 1-clic</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Transacción Encriptada y Protegida</span>
          </div>

          <button
            type="submit"
            form="reservation-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Procesando Apartado...</span>
            ) : (
              <>
                <span>Confirmar y Apartar Inmueble</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
